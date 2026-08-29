const { neon } = require("@neondatabase/serverless");
const { inferProductBrand, normalizeProductName } = require("../src/lib/productNormalization.ts");

const APPLY = process.argv.includes("--apply");
const CONCURRENCY = 20;

async function mapConcurrent(items, concurrency, worker) {
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next++;
      await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL lipsește");
  const sql = neon(process.env.DATABASE_URL);
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS source_name TEXT`;

  const products = await sql`
    SELECT uid, name, source_name, brand
    FROM products
    ORDER BY name ASC
  `;
  const changes = products.map((product) => {
    const sourceName = product.source_name || product.name;
    return {
      ...product,
      sourceName,
      normalizedName: normalizeProductName(sourceName),
      normalizedBrand: inferProductBrand(sourceName, product.brand),
    };
  }).filter((product) =>
    product.source_name !== product.sourceName ||
    product.name !== product.normalizedName ||
    product.brand !== product.normalizedBrand
  );

  const knownBrands = changes.filter((product) => product.normalizedBrand !== "Generic").length;
  console.log(`Produse: ${products.length}; de actualizat: ${changes.length}; branduri deduse: ${knownBrands}`);
  changes.slice(0, 20).forEach((product) => {
    console.log(`${product.name} -> ${product.normalizedName} [${product.normalizedBrand}]`);
  });
  if (!APPLY) {
    console.log("Mod verificare: baza de date nu a fost modificată");
    return;
  }

  let updated = 0;
  await mapConcurrent(changes, CONCURRENCY, async (product) => {
    await sql`
      UPDATE products
      SET source_name = ${product.sourceName}, name = ${product.normalizedName}, brand = ${product.normalizedBrand}, updated_at = NOW()
      WHERE uid = ${product.uid}
    `;
    updated++;
    if (updated % 100 === 0 || updated === changes.length) console.log(`Actualizate: ${updated}/${changes.length}`);
  });
  console.log(`Finalizat: ${updated} produse actualizate`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
