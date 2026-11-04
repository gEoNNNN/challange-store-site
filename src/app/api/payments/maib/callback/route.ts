import { after, NextRequest, NextResponse } from "next/server";
import { markOrderPaid, notifyOrderById } from "@/lib/order-payments";
import { verifyMaibCallback } from "@/lib/maib";

export const dynamic = "force-dynamic";

interface MaibCallback {
  checkoutId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  paymentId?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  paymentStatus?: string;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (rawBody.length > 50_000) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }
  if (!verifyMaibCallback(
    rawBody,
    req.headers.get("x-signature"),
    req.headers.get("x-signature-timestamp"),
  )) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: MaibCallback;
  try {
    body = JSON.parse(rawBody) as MaibCallback;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (
    !body.checkoutId ||
    !body.orderId ||
    body.paymentStatus !== "Executed" ||
    typeof (body.paymentAmount ?? body.amount) !== "number"
  ) {
    return NextResponse.json({ ok: true });
  }

  try {
    const result = await markOrderPaid({
      code: body.orderId,
      checkoutId: body.checkoutId,
      paymentId: body.paymentId,
      amount: Number(body.paymentAmount ?? body.amount),
      currency: body.paymentCurrency ?? body.currency ?? "",
    });
    if (!result) return NextResponse.json({ ok: false }, { status: 404 });
    after(() => notifyOrderById(result.orderId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[maib/callback] Confirmarea plății a eșuat", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ ok: false }, { status: 409 });
  }
}
