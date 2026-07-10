const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile('public/produse.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '', range: 1 });

function inferCategory(name) {
  const n = name.toLowerCase();
  if (n.includes('gum') || n.includes('jel') || n.includes('gom')) return 'Gumă & Jeleuri';
  if (n.includes('choc') || n.includes('cioc')) return 'Ciocolată';
  if (n.includes('chip') || n.includes('snack') || n.includes('crisp')) return 'Snacks & Chips';
  if (n.includes('bisc') || n.includes('cook')) return 'Biscuiți';
  if (n.includes('candy') || n.includes('bomb') || n.includes('caramel')) return 'Bomboane';
  if (n.includes('drink') || n.includes('soda') || n.includes('juice') || n.includes('tea')) return 'Băuturi';
  if (n.includes('noodle') || n.includes('ramen') || n.includes('instant')) return 'Instant & Ramen';
  if (n.includes('lollipop') || n.includes('acadea') || n.includes('sucker')) return 'Acadele';
  return 'Diverse';
}

const products = rows
  .filter(r => r.Name && r.Price && r.Image)
  .map((r, i) => ({
    id: i + 1,
    name: String(r.Name || '').trim(),
    price: parseFloat(r.Price) || 0,
    originalPrice: parseFloat(r.__EMPTY_1) || null,
    img: String(r.Image || '').trim(),
    description: String(r.Description || '').trim(),
    fullDescription: String(r.Description || '').trim(),
    category: inferCategory(String(r.Name || '')),
    brand: 'Generic',
    country: 'Necunoscut',
    rating: 4.5,
    reviews: Math.floor(Math.random() * 200) + 20,
    inStock: true,
    isNew: false,
    attributes: []
  }));

fs.writeFileSync(
  path.join(__dirname, '../src/app/produse/products.json'),
  JSON.stringify(products, null, 2)
);

console.log(`✅ Generated ${products.length} products with descriptions`);
