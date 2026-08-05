import { NextRequest, NextResponse } from "next/server";
import { seGetImage } from "../../../../../lib/salesexpert";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string; index: string }> }
) {
  const { uid, index } = await params;
  const idx = Math.min(4, Math.max(1, parseInt(index, 10) || 1));

  try {
    const buf = await seGetImage(uid, idx);
    if (!buf) {
      return new NextResponse(null, { status: 404 });
    }
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type":  "image/jpeg",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
