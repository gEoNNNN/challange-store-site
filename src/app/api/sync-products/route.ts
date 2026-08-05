import { NextRequest, NextResponse } from "next/server";
import { fullSync, deltaSync, readLiveProducts } from "../../../lib/syncProducts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { type = "delta" } = await req.json().catch(() => ({})) as { type?: string };

  if (type === "full") {
    await fullSync();
  } else {
    await deltaSync();
  }

  const products = readLiveProducts();
  return NextResponse.json({ ok: true, count: products.length, type });
}
