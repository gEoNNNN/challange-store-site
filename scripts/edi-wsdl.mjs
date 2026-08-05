// Descarca WSDL-ul si listeaza operatiile + parametrii lor.
// Rulare: node scripts/edi-wsdl.mjs
import fs from 'node:fs';

const BASE = process.env.EDI_BASE || 'https://eservicii.md/WebExportService/1025600025386';

const res = await fetch(`${BASE}?singleWsdl`, { signal: AbortSignal.timeout(60000) });
const wsdl = await res.text();
fs.writeFileSync('scripts/.edi.wsdl', wsdl);
console.log('status', res.status, 'bytes', wsdl.length);

const ops = [...new Set([...wsdl.matchAll(/<wsdl:operation name="([^"]+)"/g)].map((m) => m[1]))];
console.log('\nOPERATII:\n' + ops.join('\n'));

// pentru fiecare request-element, arata parametrii
const reqs = [...wsdl.matchAll(/<xs:element name="(\w+)">\s*<xs:complexType>\s*<xs:sequence>([\s\S]*?)<\/xs:sequence>/g)];
console.log('\nPARAMETRI:');
for (const [, name, body] of reqs) {
  const params = [...body.matchAll(/name="(\w+)"[^>]*type="([^"]+)"/g)].map((m) => `${m[1]}:${m[2]}`);
  if (params.length) console.log(`  ${name}(${params.join(', ')})`);
}
