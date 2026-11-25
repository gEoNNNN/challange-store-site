This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Baza de date (Neon → Supabase)

Toată baza se accesează printr-un singur loc: `src/lib/db.ts` (`getDb()`), care folosește
driverul `pg` (node-postgres) peste un șir de conectare Postgres obișnuit.
Toate celelalte fișiere și scripturi primesc acest `sql`, deci schimbarea bazei nu cere rescrieri.

Variabile de mediu (server-side, **fără** `NEXT_PUBLIC_`):

| Variabilă | Rol |
| --- | --- |
| `SUPABASE_DB_URL` | Șirul de conectare Supabase (Connect → **Transaction pooler**, port **6543**). Dacă e setat, `getDb()` îl folosește. |
| `DATABASE_URL` | Baza Neon; rămâne fallback până muți tot pe Supabase. |
| `DATABASE_POOL_MAX` | Mărimea pool-ului (implicit 10). |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | `true` pentru verificarea completă a certificatului (implicit: criptare fără verificare CA, cum documentează Supabase pentru pooler). |

`NEXT_PUBLIC_SUPABASE_URL` și `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` nu sunt folosite de aplicație:
ele servesc doar pentru Data API / `supabase-js` în browser. SQL-ul brut, DDL-ul și tranzacțiile
necesită `SUPABASE_DB_URL` — un șir de conectare nu trebuie niciodată prefixat cu `NEXT_PUBLIC_`,
pentru că ajunge în bundle-ul client.

Comenzi:

```bash
npm run db:check                     # verifică driverul, parametrizarea, tranzacțiile, rollback-ul
npm run db:migrate:check             # dry-run: ce tabele, SQL și date ar copia pe Supabase
npm run db:migrate                   # creează schema, copiază datele, activează RLS
npm run db:migrate -- --truncate     # golește tabelele din țintă înainte de copiere
npm run db:migrate -- --no-rls       # nu activează Row Level Security
```

RLS se activează implicit la migrare: cheia `publishable` este publică, iar prin REST
(`https://<ref>.supabase.co/rest/v1/products`) ar fi vizibile și comenzile clienților din `orders`
(nume, email, telefon, adresă). Aplicația nu este afectată, pentru că rolul cu care se conectează
este proprietarul tabelelor și RLS nu i se aplică.

După migrare: pune șirul Supabase în `DATABASE_URL` (sau păstrează `SUPABASE_DB_URL`),
șterge fallback-ul Neon și repornește aplicația.

## Site blocat cu parolă (mod preview / pre-lansare)

Cât timp `SITE_LOCK_PASSWORD` e setat, **tot site-ul** cere HTTP Basic Auth (`src/proxy.ts`):
pagini, catalog, `/api/products` — totul, inclusiv pentru Googlebot. Comenzile se închid
separat, cu `NEXT_PUBLIC_ORDERS_ENABLED=false`:

| Variabilă | Efect |
| --- | --- |
| `SITE_LOCK_PASSWORD` | Parola gate-ului. Goală/lipsă = site deschis. |
| `SITE_LOCK_USER` | Utilizatorul (implicit `challenge`). |
| `NEXT_PUBLIC_ORDERS_ENABLED` | `false` = `/api/order` refuză cu 503, iar checkout-ul afișează „Comenzile sunt temporar suspendate" și dezactivează butonul. Lipsă = comenzi active. |

Rămân accesibile **fără** parolă (nu pot răspunde la o fereastră de parolă):
`/api/sync` și `/api/payments/maib/reconcile` (cron-ul Vercel, ambele protejate de `CRON_SECRET`),
`/api/payments/maib/callback` (serverele Maib), plus `robots.txt` și `sitemap.xml` — care în modul
blocat spun crawler-elor `Disallow: /`, respectiv sitemap gol, iar paginile primesc `noindex`.

Deschiderea la lansare: șterge `SITE_LOCK_PASSWORD`, pune `NEXT_PUBLIC_ORDERS_ENABLED=true`,
redeploy. Ambele se evaluează la **build**, nu doar la runtime, deci schimbarea lor fără redeploy nu are efect.

⚠ Nu activa și „Deployment Protection" din Vercel peste acest gate — acela blochează
și cron-ul și callback-ul Maib, iar `src/proxy.ts` le lasă special libere.
