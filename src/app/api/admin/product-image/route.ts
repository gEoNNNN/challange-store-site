import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { getDb, ensureSchema } from "@/lib/db";
import { isAdminSessionValid } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const REQUEST_TIMEOUT = 20000;

/** Descarcă imaginea aleasă, o optimizează și o urcă pe R2, apoi salvează URL-ul în DB. */
export async function POST(req: NextRequest) {
  if (!isAdminSessionValid(req)) {
    return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { uid?: string; imageUrl?: string };
  const uid = body.uid?.trim();
  const imageUrl = body.imageUrl?.trim();
  if (!uid || !imageUrl) {
    return NextResponse.json({ error: "Lipsesc uid sau imageUrl." }, { status: 400 });
  }
  if (!/^https?:\/\//i.test(imageUrl)) {
    return NextResponse.json({ error: "URL invalid." }, { status: 400 });
  }

  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicUrl = process.env.R2_PUBLIC_URL?.trim()?.replace(/\/$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return NextResponse.json({ error: "Configurarea R2 lipsește." }, { status: 503 });
  }

  try {
    const source = await downloadImage(imageUrl);
    const optimized = await sharp(source, { failOn: "none", limitInputPixels: 100_000_000 })
      .rotate()
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const hash = createHash("sha256").update(optimized).digest("hex").slice(0, 12);
    const key = `products/${uid}-${hash}.webp`;
    const url = `${publicUrl}/${key}`;

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: optimized,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }));

    const sql = getDb();
    await ensureSchema(sql);
    await sql`
      UPDATE products
      SET image_url = ${url}, has_image = TRUE, updated_at = NOW()
      WHERE uid = ${uid}
    `;

    return NextResponse.json({ ok: true, imageUrl: url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/product-image]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Salvarea imaginii a eșuat." },
      { status: 502 }
    );
  }
}

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.toLowerCase().startsWith("image/")) {
    throw new Error(`Imaginea nu a putut fi descărcată (${response.status}).`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0 || buffer.length > MAX_SOURCE_BYTES) {
    throw new Error("Dimensiunea imaginii este invalidă.");
  }
  return buffer;
}
