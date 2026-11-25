/**
 * Scrie descrierile generate în src/lib/productMedia.json (sursa folosită de sync)
 * și, direct, în tabela products. Rulează cu `--apply` ca să scrie; altfel doar raportează.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
    .split(/\r?\n/).filter(Boolean).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; })
);
const fill = require('../data/desc-fill.json');
const mediaPath = path.join(__dirname, '../src/lib/productMedia.json');
const media = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
const apply = process.argv.includes('--apply');

(async () => {
  const c = new Client({ connectionString: env.SUPABASE_DB_URL || env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const rows = (await c.query(
    "select uid, source_name, image_url from products where uid = ANY($1::text[])",
    [Object.keys(fill)]
  )).rows;
  if (rows.length !== Object.keys(fill).length) {
    console.log('ATENȚIE: descrieri fără produs în DB:', Object.keys(fill).length - rows.length);
  }

  let added = 0, updated = 0;
  for (const row of rows) {
    const entry = media[row.uid];
    if (entry) {
      if (entry.description !== fill[row.uid]) { entry.description = fill[row.uid]; updated++; }
      if (!entry.excelName) entry.excelName = row.source_name;
    } else {
      media[row.uid] = {
        image: row.image_url || null,
        description: fill[row.uid],
        excelName: row.source_name,
        score: 1,
      };
      added++;
    }
  }
  console.log(`productMedia: ${added} intrări noi, ${updated} actualizate, total ${Object.keys(media).length}`);
  console.log(`DB: ${rows.length} produse de actualizat`);
  if (!apply) { console.log('dry-run — rulează cu --apply pentru a scrie'); await c.end(); return; }

  fs.writeFileSync(mediaPath, JSON.stringify(media, null, 1));
  const payload = rows.map(r => ({ uid: r.uid, description: fill[r.uid] }));
  await c.query(
    `UPDATE products SET description = v.description
     FROM jsonb_to_recordset($1::jsonb) AS v(uid text, description text)
     WHERE products.uid = v.uid`,
    [JSON.stringify(payload)]
  );
  const check = (await c.query(
    "select count(*)::int total, count(*) filter (where coalesce(description,'')<>'')::int cu_descriere from products where uid = ANY($1::text[])",
    [Object.keys(fill)]
  )).rows[0];
  console.log('verificare:', check);
  await c.end();
})();
