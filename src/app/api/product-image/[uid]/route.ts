import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SE_URL = "https://eservicii.md/WebExportService/1025600025386/json";
const AUTH = "Basic " + Buffer.from("CGCAPITAL:1;7\\/6#Gv&").toString("base64");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  try {
    const res = await fetch(
      `${SE_URL}/GetAssortimentImage?uid=${uid}&index=1`,
      { headers: { Authorization: AUTH } }
    );

    if (!res.ok) return new NextResponse(null, { status: 404 });

    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type":  res.headers.get("Content-Type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
