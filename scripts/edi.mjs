// Client minimal pentru WebExportService (edi.md / eservicii.md)
//
// Rulare:
//   node scripts/edi.mjs groups                 -> grupele radacina
//   node scripts/edi.mjs groups <groupUid>      -> subgrupele unei grupe
//   node scripts/edi.mjs items <groupUid>       -> produsele dintr-o grupa
//   node scripts/edi.mjs item <aslUid>          -> un produs
//   node scripts/edi.mjs changes                -> ce s-a modificat recent
//   node scripts/edi.mjs raw <Metoda> [query]   -> apel brut, afiseaza XML
//
// Credentialele se citesc din .env.local:
//   EDI_BASE=https://eservicii.md/WebExportService/1025600025386
//   EDI_USER=CGCAPITAL
//   EDI_PASS=...

import fs from 'node:fs';
import path from 'node:path';

function loadEnvLocal() {
  const file = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}
loadEnvLocal();

const BASE = process.env.EDI_BASE || 'https://eservicii.md/WebExportService/1025600025386';
const USER = process.env.EDI_USER || 'CGCAPITAL';
const PASS = process.env.EDI_PASS || '';
const EMPTY_UID = '00000000-0000-0000-0000-000000000000';
const AUTH = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');

async function call(method, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
  ).toString();
  const url = `${BASE}/xml/${method}${qs ? '?' + qs : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: AUTH, Accept: 'application/xml' },
    signal: AbortSignal.timeout(60000),
  });
  const xml = await res.text();
  if (!res.ok) throw new Error(`${method} -> HTTP ${res.status}\n${xml.slice(0, 300)}`);
  return xml;
}

// --- parsare simpla, fara dependinte -------------------------------------
// XML-ul are prefixe (a:Name, b:RO...). Ignoram prefixul si luam tag-ul local.
function blocks(xml, localName) {
  const re = new RegExp(`<(?:\\w+:)?${localName}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${localName}>`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(xml))) out.push(m[1]);
  return out;
}

function field(xml, localName) {
  const re = new RegExp(`<(?:\\w+:)?${localName}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${localName}>`);
  const m = xml.match(re);
  return m ? m[1].trim() : '';
}

function parseRecords(xml, recordTag) {
  return blocks(xml, recordTag).map((b) => ({
    uid: field(b, 'Uid'),
    parent: field(b, 'Parent'),
    code: field(b, 'Code'),
    name: field(b, 'Name'),
    price: field(b, 'Price'),
    promotionPrice: field(b, 'PromotionPrice'),
    remain: field(b, 'Remain'),
    unit: field(b, 'UnitName'),
    brand: field(b, 'Brand'),
    vat: field(b, 'VAT'),
    hasImage1: field(b, 'Image1') === 'true',
  }));
}

// --- API ------------------------------------------------------------------
export async function getGroups(parentUid = EMPTY_UID) {
  const xml = await call('GetAssortimentGroup', { groupUid: parentUid });
  return parseRecords(xml, 'ExAssortimentGroupRecord');
}

export async function getItemsFromGroup(groupUid = EMPTY_UID) {
  const xml = await call('GetAssortimentFromGroup', { groupUid });
  return parseRecords(xml, 'ExAssortimentRecord');
}

export async function getItem(aslUid) {
  const xml = await call('GetAssortiment', { aslUid });
  return parseRecords(xml, 'Assortiment')[0] ?? parseRecords(xml, 'ExAssortimentRecord')[0];
}

export async function getImageBase64(aslUid, imageIndex = 1) {
  const xml = await call('GetAssortimentImage', { aslUid, imageIndex });
  return field(xml, 'Image');
}

export async function getChanges() {
  const xml = await call('GetAssortimentChanges');
  return {
    assortiment: blocks(xml, 'ChangedAssortiment').flatMap((b) =>
      blocks(b, 'guid').concat(blocks(b, 'string'))
    ),
    groups: blocks(xml, 'ChangedAssortimentGroups').flatMap((b) =>
      blocks(b, 'guid').concat(blocks(b, 'string'))
    ),
  };
}

// --- CLI ------------------------------------------------------------------
const [cmd, arg1, arg2] = process.argv.slice(2);

try {
  switch (cmd) {
    case 'groups': {
      const rows = await getGroups(arg1 || EMPTY_UID);
      console.log(`${rows.length} grupe`);
      for (const g of rows) console.log(`  ${g.uid}  ${g.code.padEnd(8)} ${g.name}`);
      break;
    }
    case 'items': {
      const rows = await getItemsFromGroup(arg1 || EMPTY_UID);
      console.log(`${rows.length} inregistrari`);
      for (const p of rows.slice(0, 50)) {
        console.log(
          `  ${p.uid}  ${p.code.padEnd(8)} ${p.name.slice(0, 45).padEnd(46)} pret=${p.price} stoc=${p.remain}`
        );
      }
      if (rows.length > 50) console.log(`  ... si ${rows.length - 50} altele`);
      break;
    }
    case 'item':
      console.log(await getItem(arg1));
      break;
    case 'changes':
      console.log(await getChanges());
      break;
    case 'raw': {
      const params = Object.fromEntries(new URLSearchParams(arg2 || ''));
      console.log(await call(arg1, params));
      break;
    }
    default:
      console.log('Comenzi: groups [uid] | items [uid] | item <uid> | changes | raw <Metoda> [query]');
  }
} catch (e) {
  console.error('EROARE:', e.message);
  process.exit(1);
}
