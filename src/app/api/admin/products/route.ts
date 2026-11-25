import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminSessionValid } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

type AdminRow = {
  uid: string;
  name: string;
  source_name: string;
  brand: string | null;
  category: string | null;
  price: string;
  promotion_price: string;
  depot_stock: string;
  image_url: string | null;
  has_image: boolean;
  description_length: number;
  total: number;
};

/** Lista produselor pentru panoul de admin (cu stoc, inclusiv cele epuizate). */
export async function GET(req: NextRequest) {
  if (!isAdminSessionValid(req)) {
    return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
  }
  try {
    const sql = getDb();
    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit")) || 60, 1), 200);
    const offset = Math.max(Number(req.nextUrl.searchParams.get("offset")) || 0, 0);

    const values: unknown[] = [];
    let where = "";
    if (search) {
      values.push(`%${search}%`);
      where = `WHERE (name ILIKE $1 OR COALESCE(source_name, '') ILIKE $1 OR COALESCE(brand, '') ILIKE $1)`;
    }

    // O singură interogare: COUNT(*) OVER () dă totalul, fără un al doilea round-trip.
    const rows = (await sql.query(
      `SELECT uid, name, COALESCE(source_name, name) AS source_name, brand, category,
              price, promotion_price, depot_stock, image_url, has_image,
              length(COALESCE(description, '')) AS description_length,
              COUNT(*) OVER ()::int AS total
       FROM products ${where}
       ORDER BY name ASC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    )) as AdminRow[];

    return NextResponse.json(
      { items: rows.map(({ total, ...rest }) => rest), total: Number(rows[0]?.total ?? 0) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[api/admin/products]", error);
    return NextResponse.json({ error: "Nu am putut încărca produsele." }, { status: 500 });
  }
}
