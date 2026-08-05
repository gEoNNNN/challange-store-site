import { NextResponse } from "next/server";
import { readLiveProducts } from "../../../lib/syncProducts";
import { PRODUCTS } from "../../produse/productsData";

export const dynamic = "force-dynamic";

export async function GET() {
  const live = readLiveProducts();

  // Cat timp SalesExpert nu are produse publicate pentru export web,
  // servim catalogul local ca sa nu ramana site-ul gol.
  const products = live.length > 0 ? live : PRODUCTS;

  return NextResponse.json(products, {
    headers: { "X-Products-Source": live.length > 0 ? "salesexpert" : "local" },
  });
}
