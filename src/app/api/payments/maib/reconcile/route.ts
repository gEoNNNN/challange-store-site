import { NextRequest, NextResponse } from "next/server";
import { getPendingMaibOrders, notifyOrderById, reconcileMaibOrder } from "@/lib/order-payments";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
    ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const pending = await getPendingMaibOrders();
  const results = await Promise.allSettled(pending.map(async (order) => {
    const result = await reconcileMaibOrder(order.code, order.maib_checkout_id);
    if (result.status === "paid" && result.orderId) await notifyOrderById(result.orderId);
    return result.status;
  }));
  const summary = { paid: 0, failed: 0, pending: 0, errors: 0 };
  results.forEach((result) => {
    if (result.status === "rejected") summary.errors++;
    else summary[result.value]++;
  });
  return NextResponse.json({ ok: true, checked: pending.length, ...summary });
}
