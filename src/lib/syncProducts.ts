import fs from "fs";
import path from "path";
import {
  seGetGroups,
  seGetProductsFromGroup,
  seGetProduct,
  seGetChanges,
  SEProduct,
} from "./salesexpert";
import type { Product } from "../app/produse/productsData";

const DATA_DIR      = path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const STATE_FILE    = path.join(DATA_DIR, "sync-state.json");

/* ── Helpers ────────────────────────────────────────────────────── */

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function seToProduct(p: SEProduct, groupName: string, id: number): Product {
  const effectivePrice =
    p.promotionPrice > 0 ? p.promotionPrice : p.price;
  return {
    id,
    name:          p.name,
    price:         effectivePrice > 0 ? Math.round(effectivePrice * 100) / 100 : 0,
    originalPrice: p.promotionPrice > 0 ? p.price : undefined,
    img:           `/api/product-image/${p.uid}/1`,
    description:   p.description || p.name,
    fullDescription: p.description || p.name,
    category:      groupName,
    brand:         "Generic",
    country:       "Moldova",
    countryCode:   "MD",
    rating:        5,
    reviews:       0,
    inStock:       p.remain > 0,
    isNew:         false,
    attributes:    [],
    uid:           p.uid,
    remain:        Math.floor(p.remain),
  };
}

export function readLiveProducts(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      return JSON.parse(
        fs.readFileSync(PRODUCTS_FILE, "utf-8")
      ) as Product[];
    }
  } catch {}
  return [];
}

function writeLiveProducts(products: Product[]) {
  ensureDataDir();
  fs.writeFileSync(
    PRODUCTS_FILE,
    JSON.stringify(products, null, 2),
    "utf-8"
  );
}

function readState(): { lastFullSync?: string } {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

function writeState(state: object) {
  ensureDataDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state), "utf-8");
}

/* ── Sync logic ─────────────────────────────────────────────────── */

let syncInProgress = false;

/**
 * Full sync: fetch ALL groups + products, write only in-stock items.
 * Called on first startup or if data is stale (> 1 hour old).
 */
export async function fullSync(): Promise<void> {
  if (syncInProgress) return;
  syncInProgress = true;
  console.log("[SalesExpert] Full sync started…");
  try {
    const groups = await seGetGroups();

    const allProducts: Product[] = [];
    let id = 1;

    for (const group of groups) {
      let items: SEProduct[] = [];
      try {
        items = await seGetProductsFromGroup(group.uid);
      } catch (err) {
        console.warn(`[SalesExpert] Could not fetch group ${group.name}:`, err);
        continue;
      }
      for (const p of items) {
        if (p.remain > 0 && p.uid) {
          allProducts.push(seToProduct(p, group.name, id++));
        }
      }
    }

    writeLiveProducts(allProducts);
    writeState({ lastFullSync: new Date().toISOString() });
    console.log(
      `[SalesExpert] Full sync done — ${allProducts.length} products in stock.`
    );
  } catch (err) {
    console.error("[SalesExpert] Full sync failed:", err);
  } finally {
    syncInProgress = false;
  }
}

/**
 * Delta sync: fetch only changed UIDs since last sync.
 * Runs every 30 minutes to keep stock accurate.
 */
export async function deltaSync(): Promise<void> {
  if (syncInProgress) return;
  syncInProgress = true;
  console.log("[SalesExpert] Delta sync started…");
  try {
    const { products: changedUids } = await seGetChanges();

    if (changedUids.length === 0) {
      console.log("[SalesExpert] No changes detected.");
      syncInProgress = false;
      return;
    }

    const current = readLiveProducts();
    const byUid = new Map<string, Product>(
      current
        .filter((p) => p.uid)
        .map((p) => [p.uid as string, p])
    );

    let changed = 0;
    for (const uid of changedUids) {
      let updated: SEProduct | null = null;
      try {
        updated = await seGetProduct(uid);
      } catch {
        continue;
      }
      if (!updated) continue;

      if (updated.remain <= 0) {
        byUid.delete(uid);
        console.log(`[SalesExpert] Removed (out of stock): ${updated.name}`);
      } else {
        const existing = byUid.get(uid);
        if (existing) {
          existing.remain  = Math.floor(updated.remain);
          existing.inStock = true;
          if (updated.price > 0) {
            existing.price = Math.round(updated.price * 100) / 100;
          }
        } else {
          const maxId = current.reduce((m, p) => Math.max(m, p.id), 0);
          byUid.set(uid, seToProduct(updated, "General", maxId + 1));
          console.log(`[SalesExpert] Added new product: ${updated.name}`);
        }
      }
      changed++;
    }

    if (changed > 0) {
      writeLiveProducts(Array.from(byUid.values()));
      console.log(`[SalesExpert] Delta sync done — ${changed} products updated.`);
    }
  } catch (err) {
    console.error("[SalesExpert] Delta sync failed:", err);
  } finally {
    syncInProgress = false;
  }
}

/* ── Scheduler ──────────────────────────────────────────────────── */

let schedulerStarted = false;

export async function startSyncScheduler(): Promise<void> {
  if (schedulerStarted) return;
  schedulerStarted = true;

  const state   = readState();
  const lastSync = state.lastFullSync ? new Date(state.lastFullSync) : null;
  const ageMs   = lastSync ? Date.now() - lastSync.getTime() : Infinity;
  const ONE_HOUR = 60 * 60 * 1000;

  if (ageMs > ONE_HOUR) {
    await fullSync();
  } else {
    console.log("[SalesExpert] Recent data found, running delta sync…");
    await deltaSync();
  }

  setInterval(() => {
    deltaSync().catch(console.error);
  }, 30 * 60 * 1000);

  console.log("[SalesExpert] Scheduler active — delta sync every 30 min.");
}
