const XLSX = require('xlsx');
const fs = require('fs');

// ── EDI API ──
const SE_URL = 'https://eservicii.md/WebExportService/1025600025386/json';
const AUTH = 'Basic ' + Buffer.from('CGCAPITAL:1;7\\/6#Gv&').toString('base64');
const ROOT_GROUP = '00000000-0000-0000-0000-000000000000';

// ── Decode HTML entities (&#39; → ', &amp; → &, etc.) ──
function decodeEntities(s) {
  return String(s)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

// ── Normalize name for comparison ──
function normalize(s) {
  return decodeEntities(s)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Token-based similarity (Jaccard) ──
function similarity(a, b) {
  const ta = new Set(normalize(a).split(' ').filter(Boolean));
  const tb = new Set(normalize(b).split(' ').filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

// ── Extract size/weight tokens (150g, 1.5l, 330ml, 6oz, 24ct) ──
function sizeTokens(s) {
  const norm = decodeEntities(s).toLowerCase().replace(/\s+/g, ' ');
  const m = norm.match(/\d+(?:[.,]\d+)?\s*(g|kg|ml|l|oz|ct|buc)\b/g);
  return (m || []).map(x => x.replace(/[.,\s]/g, ''));
}

function sizesCompatible(a, b) {
  const sa = sizeTokens(a), sb = sizeTokens(b);
  if (!sa.length || !sb.length) return true;         // unul nu are gramaj → ok
  return sa.some(x => sb.includes(x));               // trebuie cel puțin o gramaj comun
}

async function main() {
  // 1. Read Excel
  const wb = XLSX.readFile('public/produse.xlsx');
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const excel = raw
    .map(r => ({
      name: String(r['__EMPTY'] || '').trim(),
      price: r['__EMPTY_1'],
      image: String(r['__EMPTY_4'] || '').trim(),
      description: String(r['__EMPTY_5'] || '').trim(),
    }))
    .filter(r => r.name && r.name !== 'Name');

  console.log(`📄 Excel: ${excel.length} produse`);

  // 2. Fetch API products
  console.log('📡 Fetching EDI API...');
  const res = await fetch(`${SE_URL}/GetAssortimentFromGroup?group=${ROOT_GROUP}`, {
    headers: { Authorization: AUTH },
  });
  const data = await res.json();
  const apiProducts = data.Assortiment || [];
  console.log(`📦 API: ${apiProducts.length} produse`);

  // 3. Build normalized index of Excel names
  const excelIndex = new Map(); // normalizedName → excelRow
  excel.forEach(e => {
    const key = normalize(e.name);
    if (!excelIndex.has(key)) excelIndex.set(key, e);
  });

  // 4. Match
  const mapping = {};      // apiUid → { image, description, excelName, score }
  let exact = 0, fuzzy = 0, none = 0;
  const unmatched = [];

  for (const p of apiProducts) {
    const apiName = p.Name.trim();
    const normApi = normalize(apiName);

    // exact normalized
    let hit = excelIndex.get(normApi);
    let score = 1;

    // fuzzy: find best similarity
    if (!hit) {
      let best = 0;
      for (const e of excel) {
        const s = similarity(apiName, e.name);
        if (s > best) { best = s; hit = e; score = s; }
      }
      if (best < 0.78 || !sizesCompatible(apiName, hit?.name ?? '')) hit = null;
    }

    if (hit && (hit.image || hit.description)) {
      mapping[p.Uid] = {
        image: hit.image || null,
        description: decodeEntities(hit.description) || null,
        excelName: hit.name,
        score: Math.round(score * 100) / 100,
      };
      if (score === 1) exact++; else fuzzy++;
    } else {
      none++;
      unmatched.push(apiName);
    }
  }

  fs.writeFileSync('src/lib/productMedia.json', JSON.stringify(mapping, null, 1));

  console.log(`\n✅ Exact match: ${exact}`);
  console.log(`🔀 Fuzzy match: ${fuzzy}`);
  console.log(`❌ No match:    ${none}`);
  console.log(`\n💾 Mapping salvat în src/lib/productMedia.json (${Object.keys(mapping).length} produse)`);

  if (unmatched.length) {
    console.log(`\nPrimele 20 nematch-uite:`);
    unmatched.slice(0, 20).forEach(n => console.log(`  - ${n}`));
  }

  // Sample matches for review
  console.log(`\nSample matches (fuzzy):`);
  Object.entries(mapping).filter(([, v]) => v.score < 1).slice(0, 8).forEach(([uid, v]) => {
    const apiName = apiProducts.find(p => p.Uid === uid)?.Name.trim();
    console.log(`  API:   ${apiName}`);
    console.log(`  Excel: ${v.excelName}  (score ${v.score})\n`);
  });
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
