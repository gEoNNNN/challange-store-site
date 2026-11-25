const fs = require('fs');
const path = require('path');
const { RULES, EXTRA, sizeOf, cleanName, RO_FLAVOUR } = require('./desc-rules');

const products = require('../data/products-missing-desc.json');
const out = {};
const unmatched = [];

for (const p of products) {
  const name = cleanName(p.name);
  let body = EXTRA[p.uid] || EXTRA[name] || null;
  if (!body) {
    for (const [re, build] of RULES) {
      const m = name.match(re);
      if (m) { body = build({ ...p, name, raw: p.name }, m); break; }
    }
  }
  if (!body) { unmatched.push(p.name + '  [' + p.uid + ']'); continue; }
  body = body
    .replace(/\s+Flavours?\b/gi, "")
    .replace(/\s+(Chinese|Chenese|Chlnese|Canadian|USA|Mexico)\b/g, "")
    .replace(/\s*\((?:Japan|Korea)\)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n");
  const size = sizeOf(p.source_name);
  for (const [en, roValue] of Object.entries(RO_FLAVOUR)) {
    body = body.replace(new RegExp(`(arom[ăa] (?:intens[ăa] )?de )${en}\\b`, "gi"), `$1${roValue}`);
  }
  const unitSize = size ? (size.single ? size.text : size.text.split("×")[1].trim()) : null;
  body = body.replace(/• Ambalaj: [^\n]+/g, "");
  if (unitSize && !body.includes(unitSize) && !/• Conținut:/.test(body)) body += `\n• Conținut: ${unitSize} (1 buc.)`;
  out[p.uid] = body;
}

fs.writeFileSync(path.join(__dirname, '../data/desc-fill.json'), JSON.stringify(out, null, 1));
console.log('descrise:', Object.keys(out).length, '/', products.length);
const lens = Object.values(out).map((d) => d.length);
console.log('lungime min/med/max:', Math.min(...lens), Math.round(lens.reduce((a, b) => a + b, 0) / lens.length), Math.max(...lens));
console.log('sub 250 caractere:', Object.entries(out).filter(([, d]) => d.length < 250).length);
console.log('--- fara regula:');
console.log(unmatched.join('\n'));
