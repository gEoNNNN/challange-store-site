// READ-ONLY parity check for the pg adapter in src/lib/db.ts.
// Run: node --env-file=.env.local scripts/check-db-adapter.js
const { createSqlClient, ensureSchema, ensureOrderSchema, resolveConnectionString } = require("../src/lib/db.ts");

// Same resolution the app uses, so this checks the database you are about to switch to.
const url = resolveConnectionString();
const sql = createSqlClient(url);

(async () => {
  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    // Not a URL-shaped string; keep it for the log.
  }
  console.log("target:", host);

  // 1) plain template + typed rows
  const one = await sql`SELECT 1::int AS n, NOW() AS at, TRUE AS flag, '{"a":1}'::jsonb AS obj, ARRAY['x','y'] AS arr`;
  console.log("types:", JSON.stringify(one), "| at is string:", typeof one[0].at === "string");

  // 2) template parameters (the ${} -> $n rewrite)
  const branded = await sql`
    SELECT brand, COUNT(*)::int AS count
    FROM products
    WHERE depot_stock > 0 AND brand = ${"Kinder"}
    GROUP BY brand
  `;
  console.log("params:", JSON.stringify(branded));

  // 3) sql.query(text, values) as used by /api/products
  const [rows, counts] = await Promise.all([
    sql.query("SELECT uid, name, price, depot_stock, barcodes FROM products WHERE name ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3", ["%kit%", 2, 0]),
    sql.query("SELECT COUNT(*)::int AS total FROM products WHERE name ILIKE $1", ["%kit%"]),
  ]);
  console.log("query():", rows.length, "of", counts[0].total, "| first:", JSON.stringify(rows[0]).slice(0, 160));

  // 4) ANY(text[]) as used by the brand/category filters
  const anyTest = await sql`
    SELECT COUNT(*)::int AS n FROM products WHERE brand = ANY(${["Kinder", "Haribo"]}::text[])
  `;
  console.log("ANY(array):", JSON.stringify(anyTest));

  // 5) jsonb_to_recordset + CTE + RETURNING (read part of the order flow)
  const requested = JSON.stringify([{ uid: rows[0]?.uid ?? "", qty: 1, line_number: 1 }]);
  const cte = await sql`
    WITH requested AS (
      SELECT uid, qty, line_number FROM jsonb_to_recordset(${requested}::jsonb) AS item(uid TEXT, qty INTEGER, line_number INTEGER)
    )
    SELECT r.uid, p.name, CASE WHEN p.promotion_price > 0 THEN p.promotion_price ELSE p.price END AS unit_price
    FROM requested r JOIN products p ON p.uid = r.uid
  `;
  console.log("recordset:", JSON.stringify(cte).slice(0, 180));

  // 6) transaction + Serializable isolation, results as an array (the /api/order pattern)
  const results = await sql.transaction((txn) => [
    txn`SELECT 1 AS a`,
    txn`SELECT COUNT(*)::int AS products FROM products`,
    txn`SELECT NOW() AS in_txn`,
  ], { isolationLevel: "Serializable" });
  console.log("transaction:", JSON.stringify(results).slice(0, 200), "| shape is array of arrays:", Array.isArray(results[0]));

  // 7) rollback path: a failing statement must abort the transaction
  try {
    await sql.transaction((txn) => [txn`SELECT 1/0 AS boom`, txn`SELECT 2 AS after`]);
    console.log("rollback: NOT TRIGGERED (unexpected)");
  } catch (error) {
    console.log("rollback ok:", error.message.slice(0, 80));
  }

  // 8) rowCount on a statement that touches zero rows (non-enumerable count)
  const noop = await sql`UPDATE products SET description = description WHERE uid = ${"__no_such_uid__"}`;
  console.log("count prop:", noop.count, "| enumerable:", Object.keys(noop).length);

  // 9) ensureSchema / ensureOrderSchema must be no-ops on the live database
  await ensureSchema(sql);
  await ensureOrderSchema(sql);
  console.log("ensureSchema/ensureOrderSchema: ok (idempotent)");

  // 10) real query timings under the pool
  const t0 = Date.now();
  await Promise.all(Array.from({ length: 25 }, () => sql`SELECT COUNT(*)::int AS n FROM products WHERE depot_stock > 0`));
  console.log(`25 query-uri concurente în ${Date.now() - t0}ms`);

  await sql.close();
})().catch(async (error) => {
  console.error("FAILED:", error.message);
  await sql.close();
  process.exitCode = 1;
});
