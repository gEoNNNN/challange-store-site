// Testeaza metodele POST (JSON vs XML) pe WebExportService.
// Rulare: node scripts/edi-post.mjs
const BASE = process.env.EDI_BASE || 'https://eservicii.md/WebExportService/1025600025386';
const UID = process.argv[2] || '0ecf6778-7149-4a5e-bfca-fef5673fa3f9';

async function post(url, contentType, body) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body,
      signal: AbortSignal.timeout(30000),
    });
    const t = await res.text();
    console.log(`\n[${res.status}] ${contentType} -> ${url}`);
    console.log('  resp:', t.slice(0, 400).replace(/\s+/g, ' '));
  } catch (e) {
    console.log(`\n[ERR] ${url}\n  `, e.message);
  }
}

// 1) JSON pe ruta /json
await post(
  `${BASE}/json/GetDiscountedPrices`,
  'application/json',
  JSON.stringify({ AssortimentUid: [UID], DiscountCardNumber: '16161616' })
);

// 2) JSON pe ruta /xml (asa arata documentatia)
await post(
  `${BASE}/xml/GetDiscountedPrices`,
  'application/json',
  JSON.stringify({ AssortimentUid: [UID], DiscountCardNumber: '16161616' })
);

// 3) XML pe ruta /xml
await post(
  `${BASE}/xml/GetDiscountedPrices`,
  'application/xml',
  `<GetDiscountedPricesRequest xmlns="http://schemas.datacontract.org/2004/07/ISWebExportService">
  <AssortimentUid>
    <guid xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">${UID}</guid>
  </AssortimentUid>
  <DiscountCardNumber>16161616</DiscountCardNumber>
</GetDiscountedPricesRequest>`
);

// 4) GetAssortimentList (POST) - poate returneaza tot catalogul dintr-un apel
await post(
  `${BASE}/json/GetAssortimentList`,
  'application/json',
  JSON.stringify({ AssortimentUid: [UID] })
);
