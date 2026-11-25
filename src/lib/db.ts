import * as pg from "pg";

/**
 * Postgres values are returned as text for date/time types, the same way the previous
 * Neon driver returned them, so `updated_at: string` style types keep matching reality.
 */
const TEXT_PASSTHROUGH_OIDS = [1082, 1083, 1114, 1184, 1266, 1186]; // date, time, timestamp, timestamptz, timetz, interval

let typesConfigured = false;
function keepDatesAsText() {
  if (typesConfigured) return;
  typesConfigured = true;
  for (const oid of TEXT_PASSTHROUGH_OIDS) pg.types.setTypeParser(oid, (value) => value);
}

export interface TransactionOptions {
  isolationLevel?: "Read Committed" | "Repeatable Read" | "Serializable";
}

/** A single statement runner: call it as a template tag, or with explicit text + parameters. */
export interface Sql {
  (strings: TemplateStringsArray, ...values: unknown[]): Promise<unknown[]>;
  /** Raw SQL with positional parameters (`$1`, `$2`, ...). */
  query(text: string, values?: readonly unknown[]): Promise<unknown[]>;
  /**
   * Runs every statement created by `fn` inside one transaction. `fn` may return an array of
   * statements (resolved in order, as an array of row arrays) or a single value.
   */
  transaction<T = unknown>(fn: (txn: Sql) => unknown, options?: TransactionOptions): Promise<T>;
  /** Closes the pool. Only scripts need it; the app keeps one pool for its whole life. */
  close(): Promise<void>;
}

const ISOLATION_SQL = ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"];

function beginStatementFor(isolationLevel?: string): string {
  if (!isolationLevel) return "BEGIN";
  const level = isolationLevel.toUpperCase();
  if (!ISOLATION_SQL.includes(level)) throw new Error(`Unsupported isolation level: ${isolationLevel}`);
  return `BEGIN ISOLATION LEVEL ${level}`;
}

function toTextResult(result: pg.QueryResult): unknown[] {
  const rows = result.rows ?? [];
  // Not enumerable, so `Object.keys()`/JSON stay identical to the old driver's plain arrays.
  Object.defineProperty(rows, "count", { value: result.rowCount ?? 0, enumerable: false });
  return rows;
}

function makeSql(executor: pg.Pool | pg.PoolClient, pool?: pg.Pool): Sql {
  const run = (text: string, values: readonly unknown[]) => executor.query(text, [...values]);

  const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
    run(strings.reduce((acc, chunk, i) => `${acc}$${i}${chunk}`), values).then(toTextResult)
  ) as Sql;

  sql.query = (text, values = []) => run(text, values).then(toTextResult);

  sql.transaction = async <T,>(fn: (txn: Sql) => unknown, options?: TransactionOptions): Promise<T> => {
    if (!pool) throw new Error("transaction() needs the pool client, not a transaction");
    const begin = beginStatementFor(options?.isolationLevel);
    const client = await pool.connect();
    try {
      await client.query(begin);
      const txn = makeSql(client);
      const pending = fn(txn);
      const settled = Array.isArray(pending) ? await Promise.all(pending) : await pending;
      await client.query("COMMIT");
      return settled as T;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  };

  sql.close = async () => {
    if (pool) await pool.end();
  };

  return sql;
}

/**
 * TLS mode for a connection string: `sslmode=` wins, then a Supabase-friendly default.
 * Supabase's pooler answers with a wildcard certificate, so its documented driver
 * setting is `rejectUnauthorized: false`; force verification with
 * `DATABASE_SSL_REJECT_UNAUTHORIZED=true` once your CA bundle covers it.
 */
function sslConfigFor(url: string): pg.PoolConfig["ssl"] {
  const override = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED;
  if (override === "true") return { rejectUnauthorized: true };
  if (override === "false") return { rejectUnauthorized: false };

  let sslmode = "";
  try {
    sslmode = new URL(url).searchParams.get("sslmode") ?? "";
  } catch {
    return { rejectUnauthorized: false };
  }

  if (sslmode === "disable") return false;
  if (sslmode === "verify-full" || sslmode === "verify-ca") return { rejectUnauthorized: true };
  return { rejectUnauthorized: false };
}

/**
 * `sslmode` is translated into an explicit `ssl` setting below, so it is dropped from the URL
 * we hand to pg: leaving it in makes pg-connection-string warn about its aliasing rules.
 * A regex keeps the URL byte-for-byte (a URL round-trip would re-encode the password).
 */
function stripSslMode(url: string): string {
  return url
    .replace(/([?&])sslmode=[^&#]*(&|$)/g, (_match, prefix, suffix) => (suffix === "&" ? prefix : ""))
    .replace(/[?&]$/, "");
}

/** A client for one Postgres connection string (own pool). Used by the app and by scripts. */
export function createSqlClient(connectionString: string): Sql {
  keepDatesAsText();
  const pool = new pg.Pool({
    connectionString: stripSslMode(connectionString),
    ssl: sslConfigFor(connectionString),
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
    allowExitOnIdle: true,
  });
  pool.on("error", (error) => console.error("[db] idle client error:", error.message));
  return makeSql(pool, pool);
}

/**
 * Connection string resolution: `SUPABASE_DB_URL` wins when present, which lets the app be
 * switched to Supabase without touching `DATABASE_URL` while the Neon database is still around.
 * Both variables are server-side: a Postgres connection string must never be `NEXT_PUBLIC_`.
 */
export function resolveConnectionString(): string {
  const supabase = process.env.SUPABASE_DB_URL?.trim();
  if (supabase) {
    // Port 5432 is Supabase's *session* pooler: one slot per client, capped at the plan's pool
    // size (free plans: 15). Serverless functions and every dev restart hold a slot, and once
    // they are all taken Postgres refuses the connection and every page shows zero products.
    // The transaction pooler (:6543) multiplexes instead and is what `pg` should point at.
    try {
      const { hostname, port } = new URL(supabase);
      if (port === "5432" && /\.pooler\.supabase\.(co|com)$/i.test(hostname)) {
        console.warn(
          "[db] SUPABASE_DB_URL uses the session pooler (:5432). Switch it to the transaction " +
            "pooler (:6543) — a saturated session pooler fails with 'max clients reached in " +
            "session mode', which the catalog shows as 0 products."
        );
      }
    } catch {
      // Not a URL-shaped string; let the connection attempt report the problem.
    }
    return supabase;
  }

  const url = process.env.DATABASE_URL?.trim();
  if (url) return url;

  throw new Error(
    "No database connection string found. Set SUPABASE_DB_URL (recommended) or DATABASE_URL " +
      "to the Supabase transaction pooler string: postgresql://postgres.<ref>:<password>@<pooler-host>:6543/postgres"
  );
}

const globalForDb = globalThis as unknown as { __challengeStoreSql?: Sql };

export function getDb(): Sql {
  if (!globalForDb.__challengeStoreSql) {
    const connectionString = resolveConnectionString();
    globalForDb.__challengeStoreSql = createSqlClient(connectionString);
    let host = connectionString;
    try {
      host = new URL(connectionString).host;
    } catch {
      // Keep the raw value if it is a libpq keyword string instead of a URL.
    }
    console.log(`[db] using Postgres at ${host}`);
  }
  return globalForDb.__challengeStoreSql;
}

export async function ensureSchema(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      uid           TEXT PRIMARY KEY,
      name          TEXT        NOT NULL,
      source_name   TEXT,
      code          TEXT,
      price         NUMERIC(12,2) NOT NULL DEFAULT 0,
      promotion_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      depot_stock   NUMERIC(12,3) NOT NULL DEFAULT 0,
      brand         TEXT,
      category      TEXT,
      description   TEXT,
      unit_name     TEXT,
      has_image     BOOLEAN     NOT NULL DEFAULT FALSE,
      image_url     TEXT,
      barcodes      JSONB,
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS source_name TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_stock ON products (depot_stock) WHERE depot_stock > 0`;
}

export async function ensureOrderSchema(sql: Sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id            UUID PRIMARY KEY,
      code          TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      email         TEXT NOT NULL,
      phone         TEXT NOT NULL,
      address       TEXT NOT NULL,
      city          TEXT NOT NULL,
      comment       TEXT NOT NULL DEFAULT '',
      subtotal      NUMERIC(12,2) NOT NULL DEFAULT 0,
      shipping      NUMERIC(12,2) NOT NULL DEFAULT 0,
      total         NUMERIC(12,2) NOT NULL DEFAULT 0,
      status        TEXT NOT NULL DEFAULT 'new',
      payment_method TEXT NOT NULL DEFAULT 'cod',
      payment_status TEXT NOT NULL DEFAULT 'not_required',
      maib_checkout_id TEXT,
      maib_checkout_url TEXT,
      maib_payment_id TEXT,
      paid_at      TIMESTAMPTZ,
      stock_released_at TIMESTAMPTZ,
      notifications_claimed_at TIMESTAMPTZ,
      email_sent_at TIMESTAMPTZ,
      telegram_sent_at TIMESTAMPTZ,
      notifications_sent_at TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'not_required'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS maib_checkout_id TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS maib_checkout_url TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS maib_payment_id TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_released_at TIMESTAMPTZ`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notifications_claimed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS telegram_sent_at TIMESTAMPTZ`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notifications_sent_at TIMESTAMPTZ`;
  await sql`
    CREATE TABLE IF NOT EXISTS order_items (
      order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_uid TEXT NOT NULL REFERENCES products(uid),
      product_name TEXT NOT NULL,
      unit_price  NUMERIC(12,2) NOT NULL,
      quantity    INTEGER NOT NULL CHECK (quantity > 0),
      line_number INTEGER NOT NULL,
      PRIMARY KEY (order_id, product_uid)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status, created_at DESC)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_maib_checkout_id ON orders (maib_checkout_id) WHERE maib_checkout_id IS NOT NULL`;
}

export interface DbProduct {
  uid:             string;
  name:            string;
  source_name:     string | null;
  code:            string | null;
  price:           string;
  promotion_price: string;
  depot_stock:     string;
  brand:           string | null;
  category:        string | null;
  description:     string | null;
  unit_name:       string | null;
  has_image:       boolean;
  image_url:       string | null;
  barcodes:        string[] | null;
  updated_at:      string;
}
