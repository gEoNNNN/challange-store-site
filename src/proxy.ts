import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Pre-launch password gate (HTTP Basic Auth).
 *
 * Active only while `SITE_LOCK_PASSWORD` is set in the environment; unset it and redeploy
 * to open the site. `SITE_LOCK_USER` optionally changes the login name (default "challenge").
 *
 * Machine endpoints stay reachable without a password, because Vercel's cron scheduler and
 * Maib's servers cannot answer a Basic Auth prompt:
 *   /api/sync                      -> cron (protected by its own CRON_SECRET)
 *   /api/payments/maib/reconcile   -> cron (protected by CRON_SECRET)
 *   /api/payments/maib/callback    -> Maib's HTTP callback (verified by Maib signatures)
 * Everything else — pages, catalog, /api/products — requires the password.
 */
const PASSWORD_FREE_PATHS = [
  "/api/sync",
  "/api/payments/maib/reconcile",
  "/api/payments/maib/callback",
  // robots.txt/sitemap.xml are generated in "stay out" mode while locked; serving them
  // beats a 401, which crawlers treat as "no instruction given".
  "/robots.txt",
  "/sitemap.xml",
  // Panoul de admin are parolă proprie (ADMIN_PASSWORD) și sesiune cu cookie.
  "/api/admin/login",
  "/api/admin/session",
];

function unauthorized(): NextResponse {
  return new NextResponse("Acces restricționat. Este nevoie de parolă.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Challenge Store (preview)", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Panoul /admin are parolă proprie (ADMIN_PASSWORD) și sesiune cu cookie.
  // Rutele API admin sunt verificate în handler (sau prin parola site-ului), nu aici.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!process.env.ADMIN_PASSWORD?.trim()) {
      return new NextResponse(
        "Panoul administrativ nu este configurat: adaugă ADMIN_PASSWORD în Environment Variables (Vercel) și redeploy.",
        { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }
      );
    }
    if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login")) {
      // API-ul admin acceptă fie sesiunea (cookie/header), fie parola site-ului.
      const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      if (!bearer) {
        const sitePassword = process.env.SITE_LOCK_PASSWORD?.trim();
        if (!sitePassword) return NextResponse.next();
        const expected = `Basic ${Buffer.from(`${process.env.SITE_LOCK_USER?.trim() || "challenge"}:${sitePassword}`).toString("base64")}`;
        if (digest(req.headers.get("authorization") ?? "").equals(digest(expected))) {
          return NextResponse.next();
        }
      }
    }
    return NextResponse.next();
  }

  const password = process.env.SITE_LOCK_PASSWORD?.trim();
  if (!password) return NextResponse.next();

  if (PASSWORD_FREE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const expected = `Basic ${Buffer.from(`${process.env.SITE_LOCK_USER?.trim() || "challenge"}:${password}`).toString("base64")}`;
  const provided = req.headers.get("authorization") ?? "";

  // Constant-time comparison of hashes (avoids leaking length or prefix characters).
  const ok = digest(provided).equals(digest(expected));
  if (!ok) return unauthorized();

  const response = NextResponse.next();
  // Never let a CDN cache an authenticated page anonymously.
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

export const config = {
  // Everything except build assets; public/ images are gated too (the browser sends
  // Basic credentials automatically once the visitor has entered them).
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
