import { NextRequest, NextResponse } from "next/server";
import { getDb, ensureSchema } from "@/lib/db";
import productMedia from "@/lib/productMedia.json";

interface MediaEntry {
  image: string | null;
  description: string | null;
}
const MEDIA = productMedia as Record<string, MediaEntry>;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SE_URL = "https://eservicii.md/WebExportService/1025600025386/json";
const AUTH = "Basic " + Buffer.from("CGCAPITAL:1;7\\/6#Gv&").toString("base64");
const ROOT_GROUP = "00000000-0000-0000-0000-000000000000";
const CENTER_DEPOT_UID = "1c92062a-d133-456e-966b-c89871e54b10";

// Câte produse procesăm per apel — trebuie să încapă în ~25s
// (cron-job.org free timeout = 30s, Vercel Hobby maxDuration = 60s)
const CHUNK_SIZE = 250;

interface SEProduct {
  Uid: string;
  Name: string;
  Code: string;
  Price: number;
  PromotionPrice: number;
  Remain: number;
  Description: string | null;
  Brand: string;
  UnitName: string;
  Barcodes: string[] | null;
  Images?: { Image1?: boolean } | null;
}

interface RemainEntry {
  Count: number;
  StockUid: string;
}

export async function GET(req: NextRequest) {
  const t0 = Date.now();

  const secret = req.nextUrl.searchParams.get("secret") ??
                 req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();
    await ensureSchema(sql);

    // Cursor persistent — reia de unde a rămas
    await sql`CREATE TABLE IF NOT EXISTS sync_cursor (id INT PRIMARY KEY, pos INT NOT NULL DEFAULT 0)`;
    await sql`INSERT INTO sync_cursor (id, pos) VALUES (1, 0) ON CONFLICT (id) DO NOTHING`;

    // 1. Lista produselor din API (1 request)
    const res = await fetch(`${SE_URL}/GetAssortimentFromGroup?group=${ROOT_GROUP}`, {
      headers: { Authorization: AUTH },
    });
    if (!res.ok) throw new Error(`GetAssortimentFromGroup: ${res.status}`);
    const data = await res.json();
    const all: SEProduct[] = data.Assortiment ?? [];
    const inStock = all.filter((p) => p.Remain > 0);
    console.log(`[sync] API: ${all.length} total, ${inStock.length} cu stoc (${Date.now() - t0}ms)`);

    // 2. Citește cursorul
    const cursorRows = await sql`SELECT pos FROM sync_cursor WHERE id = 1`;
    let pos = Number((cursorRows as { pos: number }[])[0]?.pos ?? 0);
    if (pos >= inStock.length) pos = 0; // lista s-a micșorat — reia de la cap

    const slice = inStock.slice(pos, pos + CHUNK_SIZE);
    const isLastChunk = pos + slice.length >= inStock.length;
    console.log(`[sync] Procesez ${slice.length} produse de la poziția ${pos}`);

    // 3. Stoc centru + UPSERT (batching paralel)
    const BATCH = 25;
    let upserted = 0;
    let failed = 0;

    for (let i = 0; i < slice.length; i += BATCH) {
      const batch = slice.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (p) => {
          try {
            const r = await fetch(`${SE_URL}/GetAssortimentTotalRemains?aslUid=${p.Uid}`, {
              headers: { Authorization: AUTH },
            });
            if (!r.ok) { failed++; return; }
            const d = await r.json();
            const centru = (d.Remains ?? []).find(
              (x: RemainEntry) => x.StockUid === CENTER_DEPOT_UID
            );
            const depotStock = centru && centru.Count > 0 ? centru.Count : 0;
            const media = MEDIA[p.Uid];

            await sql`
              INSERT INTO products (uid, name, code, price, promotion_price, depot_stock, brand, description, unit_name, has_image, image_url, barcodes, updated_at)
              VALUES (${p.Uid}, ${p.Name.trim()}, ${p.Code ?? null}, ${p.Price ?? 0}, ${p.PromotionPrice ?? 0}, ${depotStock}, ${p.Brand?.trim() || null}, ${media?.description || p.Description || null}, ${p.UnitName ?? null}, ${p.Images?.Image1 === true}, ${media?.image || null}, ${JSON.stringify(p.Barcodes ?? [])}, NOW())
              ON CONFLICT (uid) DO UPDATE SET
                name            = EXCLUDED.name,
                code            = EXCLUDED.code,
                price           = EXCLUDED.price,
                promotion_price = EXCLUDED.promotion_price,
                depot_stock     = EXCLUDED.depot_stock,
                brand           = EXCLUDED.brand,
                description     = EXCLUDED.description,
                unit_name       = EXCLUDED.unit_name,
                has_image       = EXCLUDED.has_image,
                image_url       = EXCLUDED.image_url,
                barcodes        = EXCLUDED.barcodes,
                updated_at      = NOW()
            `;
            upserted++;
          } catch (e) {
            failed++;
            console.error(`[sync] ✗ ${p.Uid}:`, e instanceof Error ? e.message : e);
          }
        })
      );
    }

    // 4. La finalul listei: zero produsele dispărute din API + reset cursor
    let zeroed = 0;
    if (isLastChunk) {
      const seenUids = inStock.map((p) => p.Uid);
      const result = await sql`
        UPDATE products SET depot_stock = 0
        WHERE NOT (uid = ANY(${seenUids})) AND depot_stock > 0
      `;
      zeroed = (result as unknown as { count?: number }).count ?? 0;
    }

    const nextPos = isLastChunk ? 0 : pos + slice.length;
    await sql`UPDATE sync_cursor SET pos = ${nextPos} WHERE id = 1`;

    const summary = {
      ok: true,
      chunk: `${pos}–${pos + slice.length} din ${inStock.length}`,
      upserted,
      failed,
      cycleComplete: isLastChunk,
      zeroedOut: zeroed,
      ms: Date.now() - t0,
    };
    console.log(`[sync] ✅ CHUNK DONE`, summary);
    return NextResponse.json(summary);
  } catch (err) {
    console.error(`[sync] ❌ Error după ${Date.now() - t0}ms:`, err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error", ms: Date.now() - t0 },
      { status: 500 }
    );
  }
}
