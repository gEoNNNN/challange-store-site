import { NextRequest, NextResponse } from "next/server";
import { adminPassword, adminSessionCookie, adminSessionValue } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * Emite un token de sesiune pentru client: cookie-ul rămâne httpOnly, iar tokenul
 * semnat merge în headerul Authorization ca fetch-urile din browser să fie acceptate.
 */
export async function POST(req: NextRequest) {
  if (!adminPassword()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD nu este setat." }, { status: 503 });
  }
  const value = adminSessionValue();
  const response = NextResponse.json({ ok: true, session: value });
  response.headers.set("Set-Cookie", adminSessionCookie(value));
  return response;
}
