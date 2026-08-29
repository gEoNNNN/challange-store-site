const { createHash } = require("crypto");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { neon } = require("@neondatabase/serverless");
const sharp = require("sharp");

const APPLY = process.argv.includes("--apply");
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const uidArg = process.argv.find((arg) => arg.startsWith("--uid="));
const sourceUrlArg = process.argv.find((arg) => arg.startsWith("--source-url="));
const LIMIT = limitArg ? Number(limitArg.slice("--limit=".length)) : Infinity;
const TARGET_UID = uidArg?.slice("--uid=".length);
const SOURCE_URL = sourceUrlArg?.slice("--source-url=".length);
const CONCURRENCY = 5;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const REQUEST_TIMEOUT = 20000;

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} lipsește`);
  return value;
}

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

async function fetchSource(url) {
  return fetch(url, {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });
}

async function downloadImage(url) {
  let response = await fetchSource(url);
  if (!response.ok) {
    const nestedUrl = new URL(url).searchParams.get("url");
    if (nestedUrl) response = await fetchSource(nestedUrl);
  }
  const contentType = response.headers.get("content-type") || "";
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (!response.ok) throw new Error(`download HTTP ${response.status}`);
  if (!contentType.toLowerCase().startsWith("image/")) throw new Error(`tip invalid: ${contentType || "necunoscut"}`);
  if (contentLength > MAX_SOURCE_BYTES) throw new Error("imaginea depășește 20 MB");

  const source = Buffer.from(await response.arrayBuffer());
  if (source.length === 0 || source.length > MAX_SOURCE_BYTES) throw new Error("dimensiune invalidă");
  return source;
}

async function optimizeImage(source) {
  return sharp(source, { failOn: "none", limitInputPixels: 100_000_000 })
    .rotate()
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

async function verifyPublicImage(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { Range: "bytes=0-1023" },
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });
      const contentType = response.headers.get("content-type") || "";
      await response.body?.cancel();
      if (response.ok && contentType.toLowerCase().startsWith("image/")) return true;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, attempt * 750));
  }
  return false;
}

async function main() {
  const databaseUrl = requiredEnv("DATABASE_URL");
  const accountId = requiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requiredEnv("R2_BUCKET_NAME");
  const publicUrl = requiredEnv("R2_PUBLIC_URL").replace(/\/$/, "");
  const sql = neon(databaseUrl);
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  if (SOURCE_URL && !TARGET_UID) throw new Error("--source-url necesită --uid");
  const rows = await sql`
    SELECT uid, name, image_url
    FROM products
    WHERE depot_stock > 0
    ORDER BY name ASC
  `;
  const candidates = rows
    .filter((product) => !TARGET_UID || product.uid === TARGET_UID)
    .map((product) => ({ ...product, sourceUrl: SOURCE_URL || product.image_url }))
    .filter((product) => /^https?:\/\//i.test(product.sourceUrl || ""))
    .filter((product) => !product.sourceUrl.startsWith(`${publicUrl}/`))
    .slice(0, LIMIT);

  if (TARGET_UID && candidates.length === 0) throw new Error("Produsul nu există, nu este în stoc sau este deja migrat");
  console.log(`Produse în stoc: ${rows.length}; de migrat: ${candidates.length}`);
  console.log(APPLY ? "Mod: upload R2 și actualizare DB" : "Mod verificare: fără upload și fără actualizare DB");
  if (!APPLY) return;

  let migrated = 0;
  let failed = 0;
  let sourceBytes = 0;
  let outputBytes = 0;

  await mapConcurrent(candidates, CONCURRENCY, async (product, index) => {
    try {
      const source = await downloadImage(product.sourceUrl);
      const optimized = await optimizeImage(source);
      const hash = createHash("sha256").update(optimized).digest("hex").slice(0, 12);
      const key = `products/${product.uid}-${hash}.webp`;
      const url = `${publicUrl}/${key}`;

      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: optimized,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }));
      if (!await verifyPublicImage(url)) throw new Error("URL-ul R2 nu este public după upload");

      await sql`
        UPDATE products
        SET image_url = ${url}, updated_at = NOW()
        WHERE uid = ${product.uid}
      `;
      migrated++;
      sourceBytes += source.length;
      outputBytes += optimized.length;
      console.log(`[${index + 1}/${candidates.length}] ${product.name} -> ${url}`);
    } catch (error) {
      failed++;
      console.error(`[${index + 1}/${candidates.length}] Eșuat ${product.name}: ${error instanceof Error ? error.message : error}`);
    }
  });

  const savedPercent = sourceBytes > 0 ? Math.round((1 - outputBytes / sourceBytes) * 100) : 0;
  console.log(`Migrate: ${migrated}; eșuate: ${failed}; reducere dimensiune: ${savedPercent}%`);
  if (failed > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
