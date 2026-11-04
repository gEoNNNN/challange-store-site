import { randomBytes, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ensureOrderSchema, ensureSchema, getDb } from "@/lib/db";
import { ordersEnabled } from "@/lib/siteLock";
import { cancelMaibCheckout, createMaibCheckout } from "@/lib/maib";
import { notifyOrderById, releaseOrderStock } from "@/lib/order-payments";

export const dynamic = "force-dynamic";

const MAX_BODY_SIZE = 20_000;
const MAX_ITEMS = 50;
const MAX_QUANTITY = 99;

type OrderItem = { uid: string; qty: number; lineNumber: number };
type OrderData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  comment: string;
  paymentMethod: "cod" | "maib";
  language: "ro" | "ru" | "en";
  items: OrderItem[];
};

class ValidationError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readText(
  body: Record<string, unknown>,
  key: string,
  minLength: number,
  maxLength: number,
) {
  const raw = body[key];
  if (typeof raw !== "string") throw new ValidationError(`Câmpul ${key} nu este valid.`);
  const value = raw.normalize("NFKC").trim().replace(/\s+/g, " ");
  if (value.length < minLength || value.length > maxLength || /[\u0000-\u001F\u007F<>]/.test(value)) {
    throw new ValidationError(`Câmpul ${key} nu este valid.`);
  }
  return value;
}

function parseOrder(body: unknown): OrderData {
  if (!isRecord(body)) throw new ValidationError("Datele comenzii nu sunt valide.");

  const name = readText(body, "name", 2, 100);
  const email = readText(body, "email", 5, 254).toLowerCase();
  const phone = readText(body, "phone", 7, 24);
  const address = readText(body, "address", 5, 200);
  const city = readText(body, "city", 2, 80);
  const comment = body.comment === undefined || body.comment === ""
    ? ""
    : readText(body, "comment", 0, 500);
  const paymentMethod = body.paymentMethod;
  const language = body.language;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new ValidationError("Adresa de email nu este validă.");
  }
  if (!/^\+?[0-9 ()-]{7,24}$/.test(phone)) {
    throw new ValidationError("Numărul de telefon nu este valid.");
  }
  if (paymentMethod !== "cod" && paymentMethod !== "maib") {
    throw new ValidationError("Metoda de plată nu este validă.");
  }
  if (paymentMethod === "maib") normalizeMaibPhone(phone);
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > MAX_ITEMS) {
    throw new ValidationError("Produsele comenzii nu sunt valide.");
  }

  const seen = new Set<string>();
  const items = body.items.map((item, index) => {
    if (!isRecord(item) || typeof item.uid !== "string") {
      throw new ValidationError("Un produs din comandă nu este valid.");
    }
    const uid = item.uid.normalize("NFKC").trim();
    const qty = item.qty;
    if (!uid || uid.length > 128 || /[\u0000-\u001F\u007F<>]/.test(uid) || seen.has(uid)) {
      throw new ValidationError("Un produs din comandă nu este valid.");
    }
    if (!Number.isInteger(qty) || (qty as number) < 1 || (qty as number) > MAX_QUANTITY) {
      throw new ValidationError("Cantitatea unui produs nu este validă.");
    }
    seen.add(uid);
    return { uid, qty: qty as number, lineNumber: index + 1 };
  });

  return {
    name,
    email,
    phone,
    address,
    city,
    comment,
    paymentMethod,
    language: language === "ru" || language === "en" ? language : "ro",
    items,
  };
}

function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.nextUrl.host;
  } catch {
    return false;
  }
}

function createOrderCode() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `CS-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function normalizeMaibPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (phone.trim().startsWith("+") && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  if (digits.startsWith("373") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 9) return `+373${digits.slice(1)}`;
  if (digits.length === 8) return `+373${digits}`;
  throw new ValidationError("Pentru plata online introdu un număr valid din Moldova.");
}

function getPublicOrigin(req: NextRequest) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (!configured) return req.nextUrl.origin;
  try {
    return new URL(configured).origin;
  } catch {
    throw new Error("Public site URL is invalid");
  }
}

export async function POST(req: NextRequest) {
  if (!ordersEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Comenzile sunt temporar suspendate. Catalogul poate fi vizualizat, dar comandarea va fi activată în curând.",
      },
      { status: 503 },
    );
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: "Cerere neautorizată." }, { status: 403 });
  }
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ ok: false, error: "Formatul cererii nu este acceptat." }, { status: 415 });
  }
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json({ ok: false, error: "Cererea este prea mare." }, { status: 413 });
  }

  try {
    const rawBody = await req.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      return NextResponse.json({ ok: false, error: "Cererea este prea mare." }, { status: 413 });
    }
    const order = parseOrder(JSON.parse(rawBody) as unknown);
    const sql = getDb();
    await ensureSchema(sql);
    await ensureOrderSchema(sql);

    const orderId = randomUUID();
    const code = createOrderCode();
    const requestedItems = JSON.stringify(order.items.map(({ uid, qty, lineNumber }) => ({
      uid,
      qty,
      line_number: lineNumber,
    })));
    const results = await sql.transaction((txn) => [
      txn`
        INSERT INTO orders (
          id, code, customer_name, email, phone, address, city, comment,
          status, payment_method, payment_status
        )
        VALUES (
          ${orderId}, ${code}, ${order.name}, ${order.email}, ${order.phone}, ${order.address}, ${order.city}, ${order.comment},
          ${order.paymentMethod === "maib" ? "awaiting_payment" : "new"},
          ${order.paymentMethod},
          ${order.paymentMethod === "maib" ? "pending" : "not_required"}
        )
      `,
      txn`
        WITH requested AS (
          SELECT uid, qty, line_number
          FROM jsonb_to_recordset(${requestedItems}::jsonb)
            AS item(uid TEXT, qty INTEGER, line_number INTEGER)
        ),
        eligible AS (
          SELECT
            requested.uid,
            requested.qty,
            requested.line_number,
            products.name,
            CASE WHEN products.promotion_price > 0 THEN products.promotion_price ELSE products.price END AS unit_price
          FROM requested
          JOIN products ON products.uid = requested.uid
          WHERE products.depot_stock >= requested.qty
            AND CASE WHEN products.promotion_price > 0 THEN products.promotion_price ELSE products.price END > 0
        ),
        approved AS (
          SELECT COUNT(*) = ${order.items.length} AS ok FROM eligible
        ),
        updated AS (
          UPDATE products
          SET depot_stock = products.depot_stock - eligible.qty
          FROM eligible, approved
          WHERE products.uid = eligible.uid AND approved.ok
          RETURNING products.uid
        )
        INSERT INTO order_items (order_id, product_uid, product_name, unit_price, quantity, line_number)
        SELECT ${orderId}, eligible.uid, eligible.name, eligible.unit_price, eligible.qty, eligible.line_number
        FROM eligible
        JOIN updated ON updated.uid = eligible.uid
        RETURNING product_uid, product_name, unit_price, quantity, line_number
      `,
      txn`
        WITH sums AS (
          SELECT COALESCE(SUM(unit_price * quantity), 0)::numeric(12,2) AS subtotal
          FROM order_items
          WHERE order_id = ${orderId}
          HAVING COUNT(*) = ${order.items.length}
        )
        UPDATE orders
        SET
          subtotal = sums.subtotal,
          shipping = CASE WHEN sums.subtotal >= 500 THEN 0 ELSE 50 END,
          total = sums.subtotal + CASE WHEN sums.subtotal >= 500 THEN 0 ELSE 50 END
        FROM sums
        WHERE orders.id = ${orderId}
        RETURNING orders.code, orders.subtotal, orders.shipping, orders.total
      `,
      txn`
        DELETE FROM orders
        WHERE id = ${orderId} AND NOT EXISTS (
          SELECT 1 FROM order_items WHERE order_id = ${orderId}
          GROUP BY order_id HAVING COUNT(*) = ${order.items.length}
        )
      `,
    ], { isolationLevel: "Serializable" }) as unknown as unknown[][];

    const savedOrder = results[2]?.[0] as { code: string; subtotal: string; shipping: string; total: string } | undefined;
    if (!savedOrder) {
      return NextResponse.json(
        { ok: false, error: "Stocul s-a modificat. Verifică produsele și cantitățile din coș." },
        { status: 409 },
      );
    }

    const subtotal = Number(savedOrder.subtotal);
    const shipping = Number(savedOrder.shipping);
    const total = Number(savedOrder.total);
    const savedItems = (results[1] as {
      product_uid: string;
      product_name: string;
      unit_price: string;
      quantity: number;
      line_number: number;
    }[]).sort((a, b) => a.line_number - b.line_number);

    if (order.paymentMethod === "maib") {
      let createdCheckoutId: string | null = null;
      try {
        const publicOrigin = getPublicOrigin(req);
        const resultUrl = `${publicOrigin}/checkout/rezultat`;
        const checkout = await createMaibCheckout({
          amount: total,
          orderId: savedOrder.code,
          description: `Comandă Challenge Store ${savedOrder.code}`,
          orderAmount: subtotal,
          deliveryAmount: shipping,
          items: savedItems.map((item, index) => ({
            externalId: item.product_uid,
            title: item.product_name.slice(0, 125),
            amount: Number(item.unit_price),
            currency: "MDL",
            quantity: Number(item.quantity),
            displayOrder: index + 1,
          })),
          payer: {
            name: order.name,
            email: order.email,
            phone: normalizeMaibPhone(order.phone),
            ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
            userAgent: req.headers.get("user-agent") || undefined,
          },
          language: order.language,
          callbackUrl: `${publicOrigin}/api/payments/maib/callback`,
          successUrl: resultUrl,
          failUrl: resultUrl,
        });
        createdCheckoutId = checkout.checkoutId;
        const checkoutUrl = new URL(checkout.checkoutUrl);
        if (checkoutUrl.protocol !== "https:") throw new Error("Invalid maib checkout URL");
        await sql`
          UPDATE orders
          SET maib_checkout_id = ${checkout.checkoutId}, maib_checkout_url = ${checkout.checkoutUrl}
          WHERE id = ${orderId}
        `;
        return NextResponse.json({
          ok: true,
          code: savedOrder.code,
          subtotal,
          shipping,
          total,
          paymentMethod: "maib",
          checkoutUrl: checkout.checkoutUrl,
        }, { status: 201, headers: { "Cache-Control": "no-store" } });
      } catch (error) {
        let checkoutCancelled = !createdCheckoutId;
        if (createdCheckoutId) {
          try {
            await cancelMaibCheckout(createdCheckoutId);
            checkoutCancelled = true;
          } catch (cancelError) {
            console.error("[/api/order] Sesiunea maib orfană nu a putut fi anulată", cancelError instanceof Error ? cancelError.message : "unknown error");
          }
        }
        if (checkoutCancelled) await releaseOrderStock(orderId, "init_failed");
        console.error("[/api/order] Sesiunea maib nu a putut fi creată", error instanceof Error ? error.message : "unknown error");
        return NextResponse.json(
          { ok: false, error: "Plata online nu a putut fi inițiată. Încearcă din nou." },
          { status: 502 },
        );
      }
    }

    await notifyOrderById(orderId);
    return NextResponse.json({
      ok: true,
      code: savedOrder.code,
      subtotal,
      shipping,
      total,
      paymentMethod: "cod",
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof SyntaxError) {
      return NextResponse.json(
        { ok: false, error: error instanceof ValidationError ? error.message : "Datele comenzii nu sunt valide." },
        { status: 400 },
      );
    }
    console.error("[/api/order] Comanda nu a putut fi salvată", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { ok: false, error: "Comanda nu a putut fi procesată. Încearcă din nou." },
      { status: 500 },
    );
  }
}
