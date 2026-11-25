import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSchemaOnce, DbProduct } from "@/lib/db";

export const dynamic = "force-dynamic";

const PLACEHOLDER_IMG = "/img/candypack.png";
const PAGE_SIZE = 16;
const PRICE_EXPRESSION = "CASE WHEN promotion_price > 0 THEN promotion_price ELSE price END";
const PRODUCT_COLUMNS = "uid, name, price, promotion_price, depot_stock, brand, category, description, has_image, image_url";
const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };
type ProductRow = Pick<DbProduct, "uid" | "name" | "price" | "promotion_price" | "depot_stock" | "brand" | "category" | "description" | "has_image" | "image_url">;

function getImageUrl(product: ProductRow) {
  if (product.image_url?.startsWith("/")) return product.image_url;
  if (product.image_url) {
    try {
      const url = new URL(product.image_url);
      if (url.protocol === "http:" || url.protocol === "https:") return product.image_url;
    } catch {}
  }
  return product.has_image ? `/api/product-image/${product.uid}` : PLACEHOLDER_IMG;
}

function mapRow(p: ProductRow, i: number, offset = 0) {
  const price = Number(p.price);
  const promo = Number(p.promotion_price);
  return {
    id:               offset + i + 1,
    uid:              p.uid,
    name:             p.name,
    price:            promo > 0 ? promo : price,
    originalPrice:    promo > 0 ? price : undefined,
    img:              getImageUrl(p),
    description:      p.description || p.name,
    fullDescription:  p.description || p.name,
    category:         p.category || "Bomboane",
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

export async function GET(req: NextRequest) {
  const t0 = Date.now();
  try {
    const sql = getDb();
    await ensureSchemaOnce(sql);

    const facets = req.nextUrl.searchParams.get("facets");
    if (facets === "brands") {
      const rows = await sql`
        WITH brand_counts AS (
          SELECT brand, COUNT(*)::int AS count
          FROM products
          WHERE depot_stock > 0 AND brand IS NOT NULL AND brand <> 'Generic'
          GROUP BY brand
        )
        SELECT
          CASE WHEN count <= 2 THEN 'Altele' ELSE brand END AS brand,
          SUM(count)::int AS count
        FROM brand_counts
        GROUP BY CASE WHEN count <= 2 THEN 'Altele' ELSE brand END
        ORDER BY CASE WHEN CASE WHEN count <= 2 THEN 'Altele' ELSE brand END = 'Altele' THEN 1 ELSE 0 END,
          CASE WHEN count <= 2 THEN 'Altele' ELSE brand END ASC
      ` as { brand: string; count: number }[];
      return NextResponse.json({ brands: rows }, { headers: CACHE_HEADERS });
    }

    const uid = req.nextUrl.searchParams.get("uid")?.trim();
    if (uid) {
      const rows = (await sql`
        SELECT uid, name, price, promotion_price, depot_stock, brand, category, description, has_image, image_url
        FROM products
        WHERE uid = ${uid} AND depot_stock > 0
        LIMIT 1
      `) as ProductRow[];
      return NextResponse.json({ item: rows[0] ? mapRow(rows[0], 0) : null }, { headers: CACHE_HEADERS });
    }

    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit")) || PAGE_SIZE, 1), PAGE_SIZE);
    const offset = Math.max(Number(req.nextUrl.searchParams.get("offset")) || 0, 0);
    const search = req.nextUrl.searchParams.get("search")?.trim();
    const brands = req.nextUrl.searchParams.getAll("brand").filter(Boolean);
    const categories = req.nextUrl.searchParams.getAll("category").filter(Boolean);
    const minPriceParam = req.nextUrl.searchParams.get("minPrice");
    const maxPriceParam = req.nextUrl.searchParams.get("maxPrice");
    const minPrice = minPriceParam === null ? Number.NaN : Number(minPriceParam);
    const maxPrice = maxPriceParam === null ? Number.NaN : Number(maxPriceParam);
    const sort = req.nextUrl.searchParams.get("sort") || "featured";

    const conditions = ["depot_stock > 0"];
    const params: unknown[] = [];
    const addParam = (value: unknown) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (search) {
      const placeholder = addParam(`%${search}%`);
      conditions.push(`(name ILIKE ${placeholder} OR COALESCE(brand, '') ILIKE ${placeholder})`);
    }
    if (brands.length > 0) {
      const regularBrands = brands.filter((brand) => brand !== "Altele");
      const brandConditions: string[] = [];
      if (regularBrands.length > 0) brandConditions.push(`brand = ANY(${addParam(regularBrands)}::text[])`);
      if (brands.includes("Altele")) {
        brandConditions.push(`brand IN (
          SELECT brand FROM products
          WHERE depot_stock > 0 AND brand IS NOT NULL AND brand <> 'Generic'
          GROUP BY brand HAVING COUNT(*) <= 2
        )`);
      }
      if (brandConditions.length > 0) conditions.push(`(${brandConditions.join(" OR ")})`);
    }
    if (categories.length > 0) conditions.push(`category = ANY(${addParam(categories)}::text[])`);
    if (Number.isFinite(minPrice) && minPrice > 0) conditions.push(`${PRICE_EXPRESSION} >= ${addParam(minPrice)}`);
    if (Number.isFinite(maxPrice) && maxPrice >= 0) conditions.push(`${PRICE_EXPRESSION} <= ${addParam(maxPrice)}`);

    const orderBy = sort === "price-asc"
      ? `${PRICE_EXPRESSION} ASC, name ASC`
      : sort === "price-desc"
        ? `${PRICE_EXPRESSION} DESC, name ASC`
        : "name ASC";
    const where = conditions.join(" AND ");
    const dataParams = [...params, limit, offset];
    const rowsQuery = `SELECT ${PRODUCT_COLUMNS} FROM products WHERE ${where} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    const countQuery = `SELECT COUNT(*)::int AS total FROM products WHERE ${where}`;

    const [rowsResult, countResult] = await Promise.all([
      sql.query(rowsQuery, dataParams),
      sql.query(countQuery, params),
    ]);
    const rows = rowsResult as unknown as ProductRow[];
    const countRows = countResult as unknown as { total: number }[];
    const total = Number(countRows[0]?.total ?? 0);

    console.log(`[/api/products] DB → ${rows.length}/${total} produse, offset ${offset} (${Date.now() - t0}ms)`);
    return NextResponse.json({
      items: rows.map((row, i) => mapRow(row, i, offset)),
      total,
      hasMore: offset + rows.length < total,
    }, { headers: CACHE_HEADERS });
  } catch (err) {
    console.error(`[/api/products] Error:`, err);
    return NextResponse.json({ items: [], total: 0, hasMore: false }, { status: 500 });
  }
}
