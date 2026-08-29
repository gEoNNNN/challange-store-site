const { neon } = require("@neondatabase/serverless");

const PLACEHOLDER = "/img/candypack.png";
const APPLY = process.argv.includes("--apply");
const MISSING_ONLY = process.argv.includes("--missing-only");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const uidArg = process.argv.find((arg) => arg.startsWith("--uid="));
const queryArg = process.argv.find((arg) => arg.startsWith("--query="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
const TARGET_UID = uidArg?.slice("--uid=".length);
const SEARCH_QUERY = queryArg?.slice("--query=".length);
const CHECK_CONCURRENCY = 20;
const SEARCH_CONCURRENCY = 5;
const REQUEST_TIMEOUT = 12000;

function decodeEntities(value) {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function cleanName(value) {
  return decodeEntities(value)
    .replace(/\(\s*\d+\s*x\s*([^)]*)\)/gi, " $1 ")
    .replace(/\b(master carton|case|pmp)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function validateImage(url) {
  if (!url || url === PLACEHOLDER || !/^https?:\/\//i.test(url)) return false;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Range: "bytes=0-65535",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    const contentType = response.headers.get("content-type") || "";
    const contentLength = Number(response.headers.get("content-length") || 0);
    const valid = response.ok && contentType.toLowerCase().startsWith("image/") && (!contentLength || contentLength >= 5000);
    await response.body?.cancel();
    return valid;
  } catch {
    return false;
  }
}

async function searchImages(name) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": process.env.SERPER_API_KEY,
        },
        body: JSON.stringify({
          q: `${cleanName(name)} product packaging`,
          gl: "us",
          hl: "en",
          num: 10,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("SERPER_API_KEY nu este validă sau nu este autorizată");
      }
      if (response.ok) {
        const data = await response.json();
        return (data.images || [])
          .filter((image) => image.imageUrl && (!image.imageWidth || image.imageWidth >= 300) && (!image.imageHeight || image.imageHeight >= 300))
          .map((image) => image.imageUrl)
          .slice(0, 10);
      }
      if (response.status !== 429 && response.status < 500) return [];
    } catch (error) {
      if (error instanceof Error && error.message.includes("SERPER_API_KEY")) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
  }
  return [];
}

async function findReplacement(product) {
  const candidates = await searchImages(product.searchName || product.name);
  for (const url of candidates) {
    if (await validateImage(url)) return url;
  }
  return null;
}

async function mapConcurrent(items, concurrency, worker) {
  const results = new Array(items.length);
  let next = 0;

  async function run() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL lipsește");
  if (!process.env.SERPER_API_KEY) throw new Error("SERPER_API_KEY lipsește");
  const sql = neon(process.env.DATABASE_URL);
  const products = await sql`
    SELECT uid, name, image_url
    FROM products
    WHERE depot_stock > 0
    ORDER BY name ASC
  `;

  const selectedProducts = TARGET_UID
    ? products.filter((product) => product.uid === TARGET_UID).map((product) => ({ ...product, searchName: SEARCH_QUERY }))
    : products;
  if (TARGET_UID && selectedProducts.length === 0) throw new Error(`Produsul ${TARGET_UID} nu există sau nu este în stoc`);

  const missing = selectedProducts.filter((product) => !product.image_url || product.image_url === PLACEHOLDER);
  const existing = selectedProducts.filter((product) => product.image_url && product.image_url !== PLACEHOLDER);
  let checked = 0;

  const checks = MISSING_ONLY ? [] : await mapConcurrent(existing, CHECK_CONCURRENCY, async (product) => {
    const valid = await validateImage(product.image_url);
    checked++;
    if (checked % 50 === 0 || checked === existing.length) {
      console.log(`Verificate: ${checked}/${existing.length}`);
    }
    return valid ? null : product;
  });

  const broken = checks.filter(Boolean);
  const targets = [...missing, ...broken].slice(0, LIMIT);
  console.log(`Total: ${products.length}; lipsă: ${missing.length}; defecte: ${broken.length}; de reparat: ${targets.length}`);
  console.log(APPLY ? "Mod: actualizare DB" : "Mod: verificare fără actualizare DB");

  let found = 0;
  let updated = 0;
  let failed = 0;

  await mapConcurrent(targets, SEARCH_CONCURRENCY, async (product, index) => {
    const replacement = await findReplacement(product);
    if (!replacement) {
      failed++;
      console.log(`[${index + 1}/${targets.length}] Fără rezultat: ${product.name}`);
      return;
    }

    found++;
    if (APPLY) {
      await sql`
        UPDATE products
        SET image_url = ${replacement}, updated_at = NOW()
        WHERE uid = ${product.uid}
      `;
      updated++;
    }
    console.log(`[${index + 1}/${targets.length}] ${product.name} -> ${replacement}`);
  });

  console.log(`Găsite: ${found}; actualizate: ${updated}; fără rezultat: ${failed}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
