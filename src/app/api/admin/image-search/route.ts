import { NextRequest, NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT = 12000;

/** Caută imagini pe net cu Serper Images, ca în scriptul de reparație. */
export async function GET(req: NextRequest) {
  if (!isAdminSessionValid(req)) {
    return NextResponse.json({ error: "Neautentificat." }, { status: 401 });
  }
  const query = req.nextUrl.searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ error: "Lipsește căutarea." }, { status: 400 });

  const apiKey = process.env.SERPER_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "SERPER_API_KEY nu este setat." }, { status: 503 });

  try {
    const response = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
      body: JSON.stringify({ q: `${query} product packaging`, gl: "us", hl: "en", num: 12 }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    if (!response.ok) {
      return NextResponse.json({ error: `Serper a răspuns ${response.status}.` }, { status: 502 });
    }
    const data = (await response.json()) as { images?: { imageUrl?: string; title?: string; source?: string; imageWidth?: number; imageHeight?: number }[] };
    const images = (data.images ?? [])
      .filter((image) => image.imageUrl)
      .filter((image) => !image.imageWidth || image.imageWidth >= 250)
      .filter((image) => !image.imageHeight || image.imageHeight >= 250)
      .map((image) => ({
        url: image.imageUrl as string,
        title: image.title ?? "",
        source: image.source ?? "",
        width: image.imageWidth ?? 0,
        height: image.imageHeight ?? 0,
      }));
    return NextResponse.json({ images }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/admin/image-search]", error);
    return NextResponse.json({ error: "Căutarea a eșuat." }, { status: 502 });
  }
}
