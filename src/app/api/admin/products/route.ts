import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Lista produselor pentru panoul de admin (cu stoc, inclusiv cele epuizate). */
export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    await ensureSchema(sql);
    const search = req.nextUrl.searchParams.get("search")?.trim() ?? "";
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit")) || 60, 1), 200);
    const offset = Math.max(Number(req.nextUrl.searchParams.get("offset")) || 0, 0);

    const params: unknown[] = [];
    const addParam = (value: unknown) => {
      params.push(value);
      return `$${params.length}`;
    };
    const conditions: string[] = [];
    if (search) {
      const placeholder = addParam(`%${search}%`);
      conditions.push(`(name ILIKE ${placeholder} OR COALESCE(source_name, '') ILIKE ${placeholder} OR COALESCE(brand, '') ILIKE ${placeholder})`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = (await sql.query(
      `SELECT uid, name, source_name, brand, category, price, promotion_price, depot_stock, image_url, has_image,
              length(COALESCE(description, '')) AS description_length
       FROM products ${where}
       ORDER BY name ASC
       LIMIT ${addParam(limit)} OFFSET ${addParam(offset)}`,
      params
    )) as unknown[];
    const countRows = (await sql.query(
      `SELECT COUNT(*)::int AS total FROM products ${where}`,
      params.slice(0, params.length - 2)
    )) as { total: number }[];
    const total = Number(countRows[0]?.total ?? 0);

    return NextResponse.json({ items: rows, total }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/products]", error);
    return NextResponse.json({ error: "Nu am putut încărca produsele." }, { status: 500 });
  }
}
