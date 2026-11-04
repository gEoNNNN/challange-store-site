/**
 * Migrates schema + data from Neon to Supabase Postgres.
 *
 *   npm run db:migrate:check          dry-run: prints the plan, writes nothing
 *   npm run db:migrate                creates the schema, copies every row, enables RLS
 *   npm run db:migrate -- --truncate  empties the target tables before copying
 *   npm run db:migrate -- --no-rls    same, but leaves Row Level Security off
 *
 * Source: --source=... | NEON_DATABASE_URL | DATABASE_URL (when it points at Neon)
 * Target: --target=... | SUPABASE_DB_URL  | DATABASE_URL (when it points at Supabase)
 *
 * Both sides are Postgres, so the schema is read from the live Neon database
 * (columns, defaults, constraints, indexes), recreated on Supabase, then the data
 * is copied table by table in foreign-key order, one transaction per table.
 */
const { createSqlClient } = require("../src/lib/db.ts");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const TRUNCATE = args.includes("--truncate");
// Supabase's REST API answers with the *publishable* key, which is public. Tables created by raw
// SQL have RLS off, so they would be readable through REST. RLS is on by default here; the table
// owner (what this app connects as) bypasses RLS, so the application keeps working.
const ENABLE_RLS = !args.includes("--no-rls");
const CHUNK_SIZE = 500;

const IDENT = /^[a-z_][a-z0-9_]*$/i;
function ident(name, what = "identifier") {
  if (!IDENT.test(name)) throw new Error(`Unexpected ${what} name: ${name}`);
  return name;
}

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return "(unparsable url)";
  }
}

function pickConnectionString(kind) {
  const fromFlag = args.find((a) => a.startsWith(`--${kind}=`))?.slice(kind.length + 3);
  if (fromFlag) return fromFlag;

  const preferred = (kind === "source" ? process.env.NEON_DATABASE_URL : process.env.SUPABASE_DB_URL)?.trim();
  if (preferred) return preferred;

  const shared = process.env.DATABASE_URL?.trim();
  if (!shared) throw new Error(`Nu am găsit o legătură ${kind}. Folosește --${kind}=<url> sau variabila de mediu.`);
  const looksRight = kind === "source" ? /neon\.tech/i.test(shared) : /supabase\.(co|com)/i.test(shared);
  if (!looksRight) {
    throw new Error(
      `DATABASE_URL (${hostOf(shared)}) nu arată ca o bază ${kind}. Trece --${kind}=<connection string>.`
    );
  }
  return shared;
}

async function readSourceSchema(source) {
  const columns = await source`
    SELECT cls.relname AS table_name,
           att.attname AS column_name,
           format_type(att.atttypid, att.atttypmod) AS data_type,
           att.attnotnull AS not_null,
           pg_get_expr(def.adbin, def.adrelid) AS default_expr,
           att.attidentity AS identity
    FROM pg_attribute att
    JOIN pg_class cls ON cls.oid = att.attrelid
    JOIN pg_namespace ns ON ns.oid = cls.relnamespace
    LEFT JOIN pg_attrdef def ON def.adrelid = att.attrelid AND def.adnum = att.attnum
    WHERE cls.relkind = 'r' AND ns.nspname = 'public' AND att.attnum > 0 AND NOT att.attisdropped
    ORDER BY cls.relname, att.attnum
  `;

  // contype 'n' holds NOT NULL rules, which the column list already carries.
  const constraints = await source`
    SELECT cls.relname AS table_name,
           con.conname AS constraint_name,
           con.contype AS constraint_type,
           pg_get_constraintdef(con.oid) AS definition
    FROM pg_constraint con
    JOIN pg_class cls ON cls.oid = con.conrelid
    JOIN pg_namespace ns ON ns.oid = cls.relnamespace
    WHERE ns.nspname = 'public' AND cls.relkind = 'r' AND con.contype <> 'n'
    ORDER BY cls.relname, CASE con.contype WHEN 'p' THEN 0 WHEN 'u' THEN 1 WHEN 'c' THEN 2 ELSE 3 END
  `;

  const indexes = await source`
    SELECT i.tablename AS table_name, i.indexname AS index_name, i.indexdef AS definition
    FROM pg_indexes i
    WHERE i.schemaname = 'public'
      AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conname = i.indexname)
    ORDER BY i.tablename, i.indexname
  `;

  const byTable = new Map();
  for (const column of columns) {
    if (!byTable.has(column.table_name)) byTable.set(column.table_name, []);
    byTable.get(column.table_name).push(column);
  }
  // A plain object, so callers can use tables["products"] instead of Map lookups.
  return { columns, constraints, indexes, tables: Object.fromEntries(byTable) };
}

function copyParentsFirst(tableNames, constraints) {
  const remaining = new Set(tableNames);
  const ordered = [];
  while (remaining.size > 0) {
    let progressed = false;
    for (const table of remaining) {
      const blockedBy = constraints
        .filter((c) => c.table_name === table && c.constraint_type === "f")
        .map((c) => /REFERENCES (?:public\.)?"?([a-z_][a-z0-9_]*)"?/i.exec(c.definition)?.[1])
        .filter((parent) => parent && parent !== table && remaining.has(parent));
      if (blockedBy.length === 0) {
        ordered.push(table);
        remaining.delete(table);
        progressed = true;
      }
    }
    if (!progressed) throw new Error(`Ciclul de foreign keys blochează: ${[...remaining].join(", ")}`);
  }
  return ordered;
}

function createTableStatement(tableName, columns) {
  const fields = columns.map((column) => {
    let line = `  ${ident(column.column_name, "column")} ${column.data_type}`;
    if (column.identity === "a") line += " GENERATED ALWAYS AS IDENTITY";
    else if (column.identity === "d") line += " GENERATED BY DEFAULT AS IDENTITY";
    else if (column.default_expr !== null) line += ` DEFAULT ${column.default_expr}`;
    if (column.not_null) line += " NOT NULL";
    return line;
  });
  return `CREATE TABLE IF NOT EXISTS public.${ident(tableName, "table")} (\n${fields.join(",\n")}\n)`;
}

async function tableExists(target, tableName) {
  const rows = await target`
    SELECT 1 AS found
    FROM pg_class cls
    JOIN pg_namespace ns ON ns.oid = cls.relnamespace
    WHERE ns.nspname = 'public' AND cls.relname = ${tableName} AND cls.relkind = 'r'
  `;
  return rows.length > 0;
}

async function constraintExists(target, constraintName) {
  const rows = await target`
    SELECT 1 AS found
    FROM pg_constraint con
    JOIN pg_namespace ns ON ns.oid = con.connamespace
    WHERE ns.nspname = 'public' AND con.conname = ${constraintName}
  `;
  return rows.length > 0;
}

async function indexExists(target, indexName) {
  const rows = await target`
    SELECT 1 AS found FROM pg_class cls
    JOIN pg_namespace ns ON ns.oid = cls.relnamespace
    WHERE ns.nspname = 'public' AND cls.relname = ${indexName} AND cls.relkind = 'i'
  `;
  return rows.length > 0;
}

async function countRows(client, tableName) {
  const rows = await client.query(`SELECT COUNT(*)::int AS n FROM public.${ident(tableName, "table")}`, []);
  return Number(rows[0]?.n ?? 0);
}

/**
 * Copies one table. JSONB arrives from the source as text (cast in the SELECT) so it can be
 * re-inserted with an explicit `::jsonb` cast; dates travel as text for the same reason.
 */
async function copyTable(source, target, tableName, columns) {
  const names = columns.map((c) => ident(c.column_name, "column"));
  const jsonColumn = columns.map((c) => /^json/i.test(c.data_type));
  const alwaysIdentity = columns.some((c) => c.identity === "a");
  const projection = columns.map((c, i) =>
    /^json/i.test(c.data_type) ? `${names[i]}::text AS ${names[i]}` : names[i]
  );
  const selectSql = `SELECT ${projection.join(", ")} FROM public.${ident(tableName, "table")}`;
  const insertPrefix = `INSERT INTO public.${ident(tableName, "table")} (${names.join(", ")})`;

  // One transaction per table: a failed copy leaves no partial rows behind.
  return target.transaction(async (txn) => {
    let copied = 0;
    let offset = 0;
    for (;;) {
      const rows = await source.query(
        `${selectSql} ORDER BY ${names[0]} LIMIT ${CHUNK_SIZE} OFFSET ${offset}`,
        []
      );

      if (rows.length > 0) {
        const values = [];
        const groups = rows.map((row) => {
          const placeholders = columns.map((column, i) => {
            values.push(row[column.column_name] === undefined ? null : row[column.column_name]);
            return jsonColumn[i] ? `$${values.length}::jsonb` : `$${values.length}`;
          });
          return `(${placeholders.join(", ")})`;
        });
        await txn.query(
          `${insertPrefix} VALUES ${groups.join(", ")}${alwaysIdentity ? " OVERRIDING SYSTEM VALUE" : ""}`,
          values
        );
        copied += rows.length;
      }

      if (rows.length < CHUNK_SIZE) break;
      offset += CHUNK_SIZE;
    }
    return copied;
  });
}

/** Serial/identity columns keep their own counters, so they must be moved past the copied rows. */
async function syncSequences(target, columns) {
  for (const column of columns) {
    const usesSequence = column.identity !== "" || /^nextval\(/.test(column.default_expr ?? "");
    if (!usesSequence) continue;
    const table = `public.${ident(column.table_name, "table")}`;
    const name = ident(column.column_name, "column"); // ident() guarantees no quotes inside
    await target.query(
      `SELECT setval(
         pg_get_serial_sequence('${table}', '${name}'),
         COALESCE((SELECT MAX(${name}) FROM ${table}), 0) + 1,
         false
       )`,
      []
    );
    console.log(`  secvență resetată: ${column.table_name}.${column.column_name}`);
  }
}

/**
 * The statements the target still needs. Missing tables get the full DDL; tables that already
 * exist only get `ADD COLUMN IF NOT EXISTS`, plus the constraints and indexes they lack.
 * The dry-run prints this list and --apply runs it, so plan and execution cannot drift apart.
 */
async function missingSchemaStatements(target, tables, constraints, indexes, ordered) {
  const plan = [];
  for (const table of ordered) {
    const exists = await tableExists(target, table);
    if (exists) {
      for (const column of tables[table]) {
        plan.push(
          `ALTER TABLE public.${ident(table, "table")} ADD COLUMN IF NOT EXISTS ${ident(column.column_name, "column")} ${column.data_type}`
        );
      }
    } else {
      plan.push(createTableStatement(table, tables[table]));
    }

    for (const constraint of constraints.filter((c) => c.table_name === table)) {
      if (exists && (await constraintExists(target, constraint.constraint_name))) continue;
      plan.push(
        `ALTER TABLE public.${ident(table, "table")} ADD CONSTRAINT ${ident(constraint.constraint_name, "constraint")} ${constraint.definition}`
      );
    }
    for (const index of indexes.filter((i) => i.table_name === table)) {
      if (exists && (await indexExists(target, index.index_name))) continue;
      plan.push(index.definition);
    }
  }
  return plan;
}

async function main() {
  const sourceUrl = pickConnectionString("source");
  const targetUrl = pickConnectionString("target");
  if (sourceUrl === targetUrl) throw new Error("Sursa și ținta au același string de conectare.");

  const source = createSqlClient(sourceUrl);
  const target = createSqlClient(targetUrl);

  try {
    console.log(`sursă : ${hostOf(sourceUrl)}`);
    console.log(`țintă : ${hostOf(targetUrl)}`);
    console.log(
      `mod   : ${APPLY ? "APPLY (scrie în țintă)" : "DRY-RUN (nu scrie nimic)"}${TRUNCATE ? " + truncate" : ""}` +
      ` | RLS: ${APPLY ? (ENABLE_RLS ? "va fi activat" : "rămâne dezactivat (--no-rls)") : ENABLE_RLS ? "activat la --apply" : "dezactivat"}`
    );

    const { constraints, indexes, tables } = await readSourceSchema(source);
    const ordered = copyParentsFirst(Object.keys(tables), constraints);
    console.log(`\nTabele: ${ordered.join(", ")}`);

    const inventory = [];
    for (const table of ordered) {
      const from = await countRows(source, table);
      const to = (await tableExists(target, table)) ? await countRows(target, table) : 0;
      inventory.push({ table, from, to });
      const warning = to > 0 && !TRUNCATE ? "   ⚠ ținta are deja date" : "";
      console.log(`  ${table.padEnd(13)} sursă: ${String(from).padStart(6)}  țintă: ${String(to).padStart(6)}${warning}`);
    }

    const blocked = inventory.filter((row) => row.to > 0 && !TRUNCATE);
    if (APPLY && blocked.length > 0) {
      throw new Error(
        `Ținta nu e goală (${blocked.map((b) => b.table).join(", ")}). Repetă cu --truncate dacă vrei să le golești.`
      );
    }

    const plan = await missingSchemaStatements(target, tables, constraints, indexes, ordered);
    console.log(plan.length === 0 ? "\nSchema există deja în țintă:" : "\nStatement-uri necesare în țintă:");
    for (const statement of plan) console.log(`  ${statement.replace(/\s+/g, " ").slice(0, 140)}`);

    if (!APPLY) {
      console.log("\nDry-run gata. Rulează cu --apply ca să creezi schema și să copiezi datele.");
      return;
    }

    console.log("\nApply: rulez planul de schema...");
    for (const statement of plan) await target.query(statement, []);

    if (ENABLE_RLS) {
      console.log("\nApply: activez RLS (tabelele nu mai pot fi citite prin REST cu cheia publica)...");
      for (const table of ordered) {
        await target.query(`ALTER TABLE public.${ident(table, "table")} ENABLE ROW LEVEL SECURITY`, []);
      }
    } else {
      console.log(
        "\nAtenție: ai trecut --no-rls, deci RLS rămâne dezactivat. Cu NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
          "(o cheie publică), tabelele din `public` pot fi citite prin REST, inclusiv datele clienților din `orders`."
      );
    }

    console.log("\nApply: copiez datele...");
    for (const table of ordered) {
      const columnsOfTable = tables[table];
      if (TRUNCATE && (await tableExists(target, table))) {
        await target.query(`TRUNCATE public.${ident(table, "table")} RESTART IDENTITY CASCADE`, []);
      }
      const expected = inventory.find((row) => row.table === table).from;
      if (expected === 0) {
        console.log(`  ${table.padEnd(13)} gol și în sursă`);
        continue;
      }
      const copied = await copyTable(source, target, table, columnsOfTable);
      const found = await countRows(target, table);
      console.log(`  ${table.padEnd(13)} ${copied} copiat, țintă ${found}/${expected} ${found === expected ? "✅" : "❌"}`);
      if (found !== expected) throw new Error(`Numărul de rânduri nu se potrivește pentru ${table}.`);
      await syncSequences(target, columnsOfTable);
    }

    console.log("\nMigrare finalizată. Setează DATABASE_URL pe string-ul Supabase și repornește aplicația.");
  } finally {
    await source.close();
    await target.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`\nMigrare eșuată: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { main, readSourceSchema, createTableStatement, copyParentsFirst, pickConnectionString };
