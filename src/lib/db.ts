import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing from environment");
  return neon<false, false>(url);
}

export async function ensureSchema(sql: ReturnType<typeof getDb>) {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      uid           TEXT PRIMARY KEY,
      name          TEXT        NOT NULL,
      code          TEXT,
      price         NUMERIC(12,2) NOT NULL DEFAULT 0,
      promotion_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      depot_stock   NUMERIC(12,3) NOT NULL DEFAULT 0,
      brand         TEXT,
      description   TEXT,
      unit_name     TEXT,
      has_image     BOOLEAN     NOT NULL DEFAULT FALSE,
      image_url     TEXT,
      barcodes      JSONB,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_stock ON products (depot_stock) WHERE depot_stock > 0`;
}

export interface DbProduct {
  uid:             string;
  name:            string;
  code:            string | null;
  price:           string;
  promotion_price: string;
  depot_stock:     string;
  brand:           string | null;
  description:     string | null;
  unit_name:       string | null;
  has_image:       boolean;
  image_url:       string | null;
  barcodes:        string[] | null;
  updated_at:      string;
}
