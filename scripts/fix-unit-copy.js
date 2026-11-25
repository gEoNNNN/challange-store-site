/**
 * Trece toate descrierile pe „1 unitate”: scoate informația de bax (12 × 355 ml, 24x500ml,
 * Master Carton, Case) și păstrează doar gramajul/volumul unei singure bucăți.
 * Curăță și numele care mai conțin cantități de bax.
 *
 *   node scripts/fix-unit-copy.js          # raport
 *   node scripts/fix-unit-copy.js --apply  # scrie în productMedia.json + DB
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
    .split(/\r?\n/).filter(Boolean).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; })
);
const mediaPath = path.join(__dirname, '../src/lib/productMedia.json');
const media = JSON.parse(fs.readFileSync(mediaPath, 'utf8'));
const apply = process.argv.includes('--apply');

const UNIT = "(?:ml|g|gr|kg|l|oz)";
const cleanUnit = (u) => (u.toLowerCase() === "gr" ? "g" : u.toLowerCase());

/** „(12 × 355 ml)” / „24x500ml” / „1x600gr” → „355 ml” (o singură bucată, fără bax). */
function singleSize(text) {
  const s = String(text || "");
  const multi = s.match(new RegExp(`(\\d{1,3})\\s*[x×х]\\s*(\\d+(?:[.,]\\d+)?)\\s*(${UNIT})\\b`, "i"));
  if (multi) return `${multi[2].replace(",", ".")} ${cleanUnit(multi[3])}`;
  const one = s.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${UNIT})\\b`, "i"));
  if (one) return `${one[1].replace(",", ".")} ${cleanUnit(one[2])}`;
  return null;
}

/** Scoate multiplicatorul de bax păstrând mărimea unei bucăți. */
function unitizeCopy(text, size) {
  let out = String(text || "");
  out = out.replace(new RegExp(`\\(?\\s*\\d{1,3}\\s*[x×х]\\s*(\\d+(?:[.,]\\d+)?)\\s*(${UNIT})\\s*\\)?`, "gi"),
    (_, qty, unit) => `${qty.replace(",", ".")} ${cleanUnit(unit)}`);
  out = out.replace(new RegExp(`(\\d{1,3})\\s*[x×х]\\s*(\\d+(?:[.,]\\d+)?)\\s*(${UNIT})`, "gi"),
    (_, _n, qty, unit) => `${qty.replace(",", ".")} ${cleanUnit(unit)}`);
  out = out.replace(/\b(?:master\s*carton|mastercarton|inner\s*box|display\s*box)\b/gi, " ");
  out = out.replace(/\s*[-–,]?\s*\b(?:case|bax)\b\.?/gi, " ");
  out = out.replace(/\b(?:ambalate|ambalat|ambalată|pachetul|pachet|produsul)\s+(?:este\s+)?într[-\s]o\s+cutie\s+de\s+(\d+(?:[.,]\d+)?\s*(?:ml|g|gr|kg|l))\b/gi,
    "• Conținut: $1 (1 buc.)");
  out = out.replace(/•\s*Ambalaj:\s*/gi, "• Conținut: ");
  out = out.replace(/[ \t]{2,}/g, " ").replace(/\s+([,.;:])/g, "$1").replace(/\(\s*\)/g, "");
  if (size && !new RegExp(`\\b${size.replace(".", "\\.")}\\b`).test(out)) out += `\n• Conținut: ${size} (1 buc.)`;
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

/** „14x5x117gr”, „22x73gr”, „- Pack” — nu fac parte din numele produsului vândut la bucată. */
function cleanProductName(name) {
  return String(name || "")
    .replace(new RegExp(`(?:\\d+\\s*[x×х]\\s*){1,3}\\d+(?:[.,]\\d+)?\\s*${UNIT}\\b\\.?`, "gi"), " ")
    .replace(/(?:\d+\s*[x×х]\s*){1,3}\d+(?:[.,]\d+)?(?:\s*[x×х]\s*\d+(?:[.,]\d+)?)*[,\s]*$/i, " ")
    .replace(/\s*[-–]\s*pack\s*$/i, "")
    .replace(/[\s,;.\-–—(]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

(async () => {
  const c = new Client({ connectionString: env.SUPABASE_DB_URL || env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const rows = (await c.query("select uid, name, source_name, description from products order by name")).rows;

  let mediaChanged = 0;
  for (const entry of Object.values(media)) {
    if (!entry.description) continue;
    const next = unitizeCopy(entry.description, singleSize(entry.excelName || entry.description));
    if (next !== entry.description) { entry.description = next; mediaChanged++; }
  }

  const updates = [];
  let restored = 0, renamed = 0, rewritten = 0;
  for (const row of rows) {
    const size = singleSize(row.source_name) || singleSize(row.name);
    const fromMedia = media[row.uid]?.description || null;
    const current = (row.description || "").trim();
    let next = current || fromMedia || "";
    if (!current && fromMedia) restored++;
    if (next) {
      const unit = unitizeCopy(next, size);
      if (unit !== current) rewritten++;
      next = unit;
    }
    const nextName = cleanProductName(row.name);
    if (nextName && nextName !== row.name) renamed++;
    if (next !== current || nextName !== row.name) {
      updates.push({ uid: row.uid, name: nextName || row.name, description: next || null });
    }
  }

  console.log(`productMedia: ${mediaChanged} descrieri modificate`);
  console.log(`DB: ${updates.length} rânduri (${restored} restaurate, ${rewritten} reformulate, ${renamed} redenumite)`);
  if (!apply) { console.log('dry-run — rulează cu --apply'); await c.end(); return; }

  fs.writeFileSync(mediaPath, JSON.stringify(media, null, 1));
  await c.query(
    `UPDATE products SET name = v.name, description = v.description
     FROM jsonb_to_recordset($1::jsonb) AS v(uid text, name text, description text)
     WHERE products.uid = v.uid`,
    [JSON.stringify(updates)]
  );
  console.log('scris.');
  await c.end();
})();
