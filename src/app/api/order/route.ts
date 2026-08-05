import { NextRequest, NextResponse } from "next/server";
import { seSaveFastOrder } from "../../../lib/salesexpert";

export async function POST(req: NextRequest) {
  const { phone, address, city, name, comment, items } =
    (await req.json()) as {
      phone:   string;
      address: string;
      city:    string;
      name:    string;
      comment?: string;
      items:   Array<{ uid?: string; qty: number }>;
    };

  const lines = items
    .filter((i) => !!i.uid)
    .map((i, idx) => ({
      uid:        i.uid as string,
      qty:        i.qty,
      lineNumber: idx + 1,
    }));

  if (lines.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Niciun produs cu UID valid" },
      { status: 400 }
    );
  }

  const result = await seSaveFastOrder({
    phone,
    address:      `${city}, ${address}`,
    deliveryType: 1,
    paymentType:  1,
    comment:      `Comandat de: ${name}. ${comment ?? ""}`.trim(),
    lines,
  });

  return NextResponse.json(result);
}
