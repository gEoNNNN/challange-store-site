import { NextResponse } from "next/server";
import { getDb, ensureSchema, DbProduct } from "@/lib/db";

export const dynamic = "force-dynamic";

const PLACEHOLDER_IMG = "/img/candypack.png";

function mapRow(p: DbProduct, i: number) {
  const price = Number(p.price);
  const promo = Number(p.promotion_price);
  return {
    id:               i + 1,
    uid:              p.uid,
    name:             p.name,
    price:            promo > 0 ? promo : price,
    originalPrice:    promo > 0 ? price : undefined,
    img:              p.image_url || (p.has_image ? `/api/product-image/${p.uid}` : PLACEHOLDER_IMG),
    description:      p.description || p.name,
    fullDescription:  p.description || p.name,
    category:         "Produse",
    brand:            p.brand || "Generic",
    country:          "Moldova",
    countryCode:      "MD",
    rating:           5,
    reviews:          0,
    inStock:          true,
    isNew:            false,
    attributes:       [],
    remain:           Math.floor(Number(p.depot_stock)),
  };
}

export async function GET() {
  const t0 = Date.now();
  try {
    const sql = getDb();
    await ensureSchema(sql);

    const rows = (await sql`
      SELECT * FROM products
      WHERE depot_stock > 0
      ORDER BY name ASC
    `) as DbProduct[];

    console.log(`[/api/products] DB → ${rows.length} produse (${Date.now() - t0}ms)`);
    return NextResponse.json(rows.map(mapRow));
  } catch (err) {
    console.error(`[/api/products] ❌ Error:`, err);
    return NextResponse.json([], { status: 500 });
  }
}
