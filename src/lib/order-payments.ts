import { ensureOrderSchema, getDb } from "@/lib/db";
import { getMaibCheckout } from "@/lib/maib";
import { NotificationChannel, sendOrderNotifications } from "@/lib/order-notifications";

interface PaymentOrderRow {
  id: string;
  code: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  comment: string;
  subtotal: string;
  shipping: string;
  total: string;
  status: string;
  payment_method: string;
  payment_status: string;
  maib_checkout_id: string | null;
  stock_released_at: string | null;
  email_sent_at: string | null;
  telegram_sent_at: string | null;
}

interface PaymentItemRow {
  product_name: string;
  unit_price: string;
  quantity: number;
  line_number: number;
}

export type PublicPaymentStatus = "pending" | "paid" | "failed";

function sameMoney(left: number, right: number) {
  return Number.isFinite(left) && Number.isFinite(right) && Math.round(left * 100) === Math.round(right * 100);
}

async function getPaymentOrder(code: string, checkoutId: string) {
  const sql = getDb();
  await ensureOrderSchema(sql);
  const rows = await sql`
    SELECT id, code, customer_name, email, phone, address, city, comment,
      subtotal, shipping, total, status, payment_method, payment_status,
      maib_checkout_id, stock_released_at, email_sent_at, telegram_sent_at
    FROM orders
    WHERE code = ${code} AND maib_checkout_id = ${checkoutId} AND payment_method = 'maib'
    LIMIT 1
  ` as PaymentOrderRow[];
  return rows[0] ?? null;
}

export async function notifyOrderById(orderId: string) {
  const sql = getDb();
  await ensureOrderSchema(sql);
  const claimedRows = await sql`
    UPDATE orders
    SET notifications_claimed_at = NOW()
    WHERE id = ${orderId}
      AND notifications_sent_at IS NULL
      AND (notifications_claimed_at IS NULL OR notifications_claimed_at < NOW() - INTERVAL '10 minutes')
    RETURNING id, code, customer_name, email, phone, address, city, comment,
      subtotal, shipping, total, status, payment_method, payment_status,
      maib_checkout_id, stock_released_at, email_sent_at, telegram_sent_at
  ` as PaymentOrderRow[];
  const order = claimedRows[0];
  if (!order) return;

  try {
    const items = await sql`
      SELECT product_name, unit_price, quantity, line_number
      FROM order_items
      WHERE order_id = ${orderId}
      ORDER BY line_number
    ` as PaymentItemRow[];
    const channels: NotificationChannel[] = [];
    if (!order.email_sent_at) channels.push("email");
    if (!order.telegram_sent_at) channels.push("telegram");
    const failures = await sendOrderNotifications({
      code: order.code,
      customerName: order.customer_name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      comment: order.comment,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      items: items.map((item) => ({
        name: item.product_name,
        unitPrice: Number(item.unit_price),
        quantity: Number(item.quantity),
      })),
    }, channels);

    const emailSent = !!order.email_sent_at || (channels.includes("email") && !failures.includes("email"));
    const telegramSent = !!order.telegram_sent_at || (channels.includes("telegram") && !failures.includes("telegram"));
    await sql`
      UPDATE orders
      SET
        email_sent_at = CASE WHEN ${emailSent} THEN COALESCE(email_sent_at, NOW()) ELSE email_sent_at END,
        telegram_sent_at = CASE WHEN ${telegramSent} THEN COALESCE(telegram_sent_at, NOW()) ELSE telegram_sent_at END,
        notifications_sent_at = CASE WHEN ${emailSent && telegramSent} THEN COALESCE(notifications_sent_at, NOW()) ELSE notifications_sent_at END,
        notifications_claimed_at = NULL
      WHERE id = ${orderId}
    `;
    if (failures.length > 0) {
      console.error(`[/api/order] Notificări eșuate: ${failures.join(", ")}`);
    }
  } catch (error) {
    await sql`UPDATE orders SET notifications_claimed_at = NULL WHERE id = ${orderId}`;
    throw error;
  }
}

export async function releaseOrderStock(orderId: string, paymentStatus: string) {
  const sql = getDb();
  await ensureOrderSchema(sql);
  const rows = await sql`
    WITH released AS (
      UPDATE orders
      SET
        payment_status = ${paymentStatus},
        status = 'cancelled',
        stock_released_at = NOW()
      WHERE id = ${orderId}
        AND payment_method = 'maib'
        AND payment_status <> 'paid'
        AND stock_released_at IS NULL
      RETURNING id
    )
    UPDATE products
    SET depot_stock = products.depot_stock + order_items.quantity
    FROM order_items, released
    WHERE order_items.order_id = released.id
      AND products.uid = order_items.product_uid
    RETURNING products.uid
  `;
  return rows.length > 0;
}

export async function markOrderPaid(input: {
  code: string;
  checkoutId: string;
  paymentId?: string | null;
  amount: number;
  currency: string;
}) {
  const order = await getPaymentOrder(input.code, input.checkoutId);
  if (!order) return null;
  if (order.stock_released_at) throw new Error("Stock reservation was already released");
  if (input.currency !== "MDL" || !sameMoney(Number(order.total), input.amount)) {
    throw new Error("Payment amount or currency does not match the order");
  }

  const sql = getDb();
  const rows = await sql`
    UPDATE orders
    SET
      payment_status = 'paid',
      status = 'new',
      maib_payment_id = COALESCE(${input.paymentId ?? null}, maib_payment_id),
      paid_at = COALESCE(paid_at, NOW())
    WHERE id = ${order.id} AND payment_status <> 'paid'
    RETURNING id
  ` as { id: string }[];
  return { orderId: rows[0]?.id ?? order.id, changed: rows.length > 0 };
}

export async function reconcileMaibOrder(code: string, checkoutId: string): Promise<{
  status: PublicPaymentStatus;
  orderId: string | null;
}> {
  const order = await getPaymentOrder(code, checkoutId);
  if (!order) return { status: "failed", orderId: null };
  if (order.payment_status === "paid") return { status: "paid", orderId: order.id };
  if (order.stock_released_at || ["failed", "expired", "abandoned", "cancelled", "init_failed"].includes(order.payment_status)) {
    return { status: "failed", orderId: order.id };
  }

  const checkout = await getMaibCheckout(checkoutId);
  if (
    checkout.id !== checkoutId ||
    checkout.currency !== "MDL" ||
    !sameMoney(Number(order.total), Number(checkout.amount)) ||
    (checkout.order?.id && checkout.order.id !== code)
  ) {
    throw new Error("Checkout details do not match the order");
  }

  if (checkout.status === "Completed") {
    const result = await markOrderPaid({
      code,
      checkoutId,
      paymentId: checkout.payment?.id,
      amount: Number(checkout.payment?.amount ?? checkout.amount),
      currency: checkout.payment?.currency ?? checkout.currency,
    });
    return { status: "paid", orderId: result?.orderId ?? order.id };
  }

  if (["Expired", "Abandoned", "Cancelled", "Failed"].includes(checkout.status)) {
    await releaseOrderStock(order.id, checkout.status.toLowerCase());
    return { status: "failed", orderId: order.id };
  }
  return { status: "pending", orderId: order.id };
}

export async function getPendingMaibOrders(limit = 25) {
  const sql = getDb();
  await ensureOrderSchema(sql);
  return await sql`
    SELECT code, maib_checkout_id
    FROM orders
    WHERE payment_method = 'maib'
      AND payment_status = 'pending'
      AND maib_checkout_id IS NOT NULL
      AND created_at < NOW() - INTERVAL '10 minutes'
    ORDER BY created_at
    LIMIT ${limit}
  ` as { code: string; maib_checkout_id: string }[];
}
