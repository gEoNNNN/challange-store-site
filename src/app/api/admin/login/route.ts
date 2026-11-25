import { NextRequest, NextResponse } from "next/server";
import { adminPassword, adminSessionCookie, adminSessionValue, clearAdminSessionCookie } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const password = adminPassword();
  if (!password) {
    return NextResponse.json({ ok: false, error: "ADMIN_PASSWORD nu este setat." }, { status: 503 });
  }
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (body.password !== password) {
    return NextResponse.json({ ok: false, error: "Parolă greșită." }, { status: 401 });
  }
  const value = adminSessionValue();
  const response = NextResponse.json({ ok: true, session: value });
  response.headers.set("Set-Cookie", adminSessionCookie(value));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Set-Cookie", clearAdminSessionCookie());
  return response;
}
