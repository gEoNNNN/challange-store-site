import { NextRequest, NextResponse } from "next/server";
import { isAdminSessionValid, adminPassword, adminSessionCookie, adminSessionValue } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * Reînnoiește sesiunea și întoarce tokenul pentru headerul Authorization.
 * Cere un cookie de sesiune valid: altfel oricine ar putea cere un token.
 */
export async function POST(req: NextRequest) {
  if (!adminPassword()) {
    return NextResponse.json({ error: "ADMIN_PASSWORD nu este setat." }, { status: 503 });
  }
  if (!isAdminSessionValid(req)) {
    return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
  }
  const value = adminSessionValue();
  const response = NextResponse.json({ ok: true, session: value });
  response.headers.set("Set-Cookie", adminSessionCookie(value));
  return response;
}
