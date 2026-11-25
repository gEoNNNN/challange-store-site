import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

/**
 * Sesiune pentru panoul /admin: cookie httpOnly semnat cu parola de admin.
 * Parola vine din env (ADMIN_PASSWORD); fără ea, panoul este complet închis.
 */

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 ore

function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function adminPassword(): string {
  return env("ADMIN_PASSWORD");
}

/**
 * Parola de rezervă, folosită doar dacă ADMIN_PASSWORD nu există în mediu
 * (de ex. build-uri vechi fără env nou). Se poate suprascrie cu env-ul.
 */
export function adminPasswordConfigured(): boolean {
  return Boolean(adminPassword());
}

function sign(value: string): string {
  const secret = env("ADMIN_PASSWORD") || "disabled";
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function isAdminSessionValid(req: NextRequest): boolean {
  const password = adminPassword();
  if (!password) return false;
  // Headerul Authorization are prioritate: clientul din browser poate trimite cookie-ul
  // doar pentru cererile sale, dar fetch-ul server-side nu îl are.
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const cookie = bearer || req.cookies.get(COOKIE_NAME)?.value || "";
  if (!cookie) return false;
  const [value, signature] = cookie.split(".");
  if (!value || !signature) return false;
  return safeEqual(signature, sign(value));
}

/** Valoarea completă a sesiunii (token + semnătură), folosită și în cookie. */
export function adminSessionValue(): string {
  const value = String(Date.now());
  return `${value}.${sign(value)}`;
}

export function adminSessionCookie(value: string): string {
  // `Secure` doar peste HTTPS: pe localhost, cookie-ul ar fi respins și panoul ar cere parola la fiecare refresh.
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure}`;
}

export function clearAdminSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
