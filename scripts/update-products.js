const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile('public/produse.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { defval: '', range: 1 });

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
    category: String(r.__EMPTY || 'Diverse').trim(),
    brand: String(r.__EMPTY_2 || 'Generic').trim(),
    country: String(r.Quanty || 'Necunoscut').trim(),
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
