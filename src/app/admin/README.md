# Panoul administrativ

## Ce este

`/admin/products` — listă toate produsele (căutare, grid/list) și permite **schimbarea imaginii**
fiecărui produs cu una găsită pe net.

Fluxul butonului „Schimbă imaginea”:

1. se caută automat cu **Serper Images** (`SERPER_API_KEY`), folosind numele de la furnizor;
2. se afișează 10–12 rezultate; alegi unul;
3. imaginea aleasă se descarcă, se optimizează (webp, max 1200 px) și se urcă pe **R2**;
4. `products.image_url` se actualizează în DB cu URL-ul nou → apare imediat pe site.

Nu se salvează nimic până când alegi tu o imagine.

## Configurare

Variabile de mediu necesare (Vercel → Settings → Environment Variables):

| Variabilă | De unde o găsești | Rol |
| --- | --- | --- |
| `ADMIN_PASSWORD` | o alegi tu | parola panoului `/admin` (separată de parola site-ului) |
| `SERPER_API_KEY` | serper.dev | căutarea de imagini |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | `.env.local` | upload-ul imaginilor |
| `SITE_LOCK_USER`, `SITE_LOCK_PASSWORD` | `.env.local` | parola site-ului; API-ul admin o acceptă și pe aceasta |

Fără `ADMIN_PASSWORD`, `/admin` răspunde 503 cu un mesaj explicit.

## Local

```bash
npm run dev
# http://localhost:3000/admin/products
```

Parola din `.env.local`: `ADMIN_PASSWORD=challenge-admin-2026` (schimb-o).

## Utilitar offline (fără panou)

```bash
node --env-file=.env.local scripts/repair-product-images.js --check
node --env-file=.env.local scripts/repair-product-images.js --apply
```

Găsește singur imagini lipsă sau greșite și le mută pe R2, folosind aceeași cheie Serper.
