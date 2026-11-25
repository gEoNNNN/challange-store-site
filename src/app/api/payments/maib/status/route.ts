import { after, NextRequest, NextResponse } from "next/server";
import { getOrderSummary, notifyOrderById, reconcileMaibOrder } from "@/lib/order-payments";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("orderId")?.trim();
  const checkoutId = req.nextUrl.searchParams.get("checkoutId")?.trim();
  if (!code || code.length > 64 || !checkoutId || checkoutId.length > 64) {
    return NextResponse.json({ ok: false, error: "Date de plată invalide." }, { status: 400 });
  }

  try {
    const result = await reconcileMaibOrder(code, checkoutId);
    if (!result.orderId) {
      return NextResponse.json({ ok: false, error: "Comanda nu a fost găsită." }, { status: 404 });
    }
    if (result.status === "paid") after(() => notifyOrderById(result.orderId as string));
    const summary = result.status === "paid" ? await getOrderSummary(code, checkoutId) : null;
    return NextResponse.json(
      { ok: true, status: result.status, code, order: summary },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[maib/status] Verificarea plății a eșuat", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { ok: false, error: "Statutul plății nu a putut fi verificat." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
