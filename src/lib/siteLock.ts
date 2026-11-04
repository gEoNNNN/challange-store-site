/**
 * Pre-launch access control helpers.
 *
 * The password gate itself lives in `src/proxy.ts` (HTTP Basic Auth, enforced before any
 * route renders). These helpers let the rest of the app react to the same state:
 * robots/sitemap/metadata back off while the site is locked, and the order API refuses
 * writes while orders are closed.
 */

/** True when `SITE_LOCK_PASSWORD` is set: the whole site requires Basic Auth. */
export function isSiteLocked(): boolean {
  return Boolean(process.env.SITE_LOCK_PASSWORD?.trim());
}

/**
 * Orders are open unless `NEXT_PUBLIC_ORDERS_ENABLED` is explicitly "false",
 * so a forgotten env var keeps the previous (working) behavior instead of silently
 * blocking checkout. The flag is `NEXT_PUBLIC_` because the checkout UI reads it too.
 */
export function ordersEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ORDERS_ENABLED?.trim().toLowerCase() !== "false";
}
