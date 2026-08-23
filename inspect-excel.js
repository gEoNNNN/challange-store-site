const XLSX = require('xlsx');

const wb = XLSX.readFile('public/produse.xlsx');
console.log('Sheets:', wb.SheetNames);

const sheet = wb.Sheets[wb.SheetNames[0]];
const range = XLSX.utils.decode_range(sheet['!ref']);
console.log('Range:', sheet['!ref'], '| Rows:', range.e.r + 1, '| Cols:', range.e.c + 1);

// Header row
const headers = [];
for (let c = range.s.c; c <= range.e.c; c++) {
  const cell = sheet[XLSX.utils.encode_cell({ r: 0, c })];
  headers.push(cell ? String(cell.v) : `col${c}`);
}
console.log('\nHeaders:', headers);

// First 5 data rows
const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
console.log('\nTotal data rows:', rows.length);
console.log('\nFirst 3 rows:');
rows.slice(0, 3).forEach((r, i) => {
  console.log(`\n--- Row ${i + 1} ---`);
  Object.entries(r).forEach(([k, v]) => {
    const s = String(v);
    console.log(`  ${k}: ${s.length > 120 ? s.substring(0, 120) + '...' : s}`);
  });
});

// Check images column content pattern
const imgKeys = headers.filter(h => /img|image|poza|photo|url/i.test(h));
if (imgKeys.length) {
  console.log('\nImage columns found:', imgKeys);
  imgKeys.forEach(k => {
    const vals = rows.slice(0, 5).map(r => String(r[k]));
    console.log(`  ${k} samples:`, vals);
  });
}
