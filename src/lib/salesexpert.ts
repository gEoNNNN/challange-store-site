const BASE_URL =
  process.env.SALESEXPERT_URL ??
  "https://eservicii.md/WebExportService/1025600025386";

/* ── Minimal XML helpers ─────────────────────────────────────────── */

function xmlVal(xml: string, tag: string): string {
  const re = new RegExp(
    `<(?:[^:>]+:)?${tag}[^>]*>([^<]*)<\\/(?:[^:>]+:)?${tag}>`,
    "i"
  );
  const m = xml.match(re);
  return m ? m[1].trim() : "";
}

function xmlBool(xml: string, tag: string): boolean {
  return xmlVal(xml, tag) === "true";
}

function xmlFloat(xml: string, tag: string): number {
  return parseFloat(xmlVal(xml, tag)) || 0;
}

function splitBlocks(xml: string, tag: string): string[] {
  const blocks: string[] = [];
  const openRe  = new RegExp(`<(?:[^:>]+:)?${tag}(?:\\s[^>]*)?>`, "gi");
  const closeRe = new RegExp(`<\\/(?:[^:>]+:)?${tag}>`, "gi");
  let openMatch: RegExpExecArray | null;
  while ((openMatch = openRe.exec(xml)) !== null) {
    closeRe.lastIndex = openMatch.index + openMatch[0].length;
    const closeMatch = closeRe.exec(xml);
    if (!closeMatch) break;
    blocks.push(
      xml.substring(openMatch.index + openMatch[0].length, closeMatch.index)
    );
    openRe.lastIndex = closeMatch.index + closeMatch[0].length;
  }
  return blocks;
}

/* ── Types ───────────────────────────────────────────────────────── */

export interface SEGroup {
  uid: string;
  code: string;
  name: string;
  parent: string;
  hasImage: boolean;
}

export interface SEProduct {
  uid: string;
  code: string;
  name: string;
  description: string;
  price: number;
  promotionPrice: number;
  remain: number;
  unitName: string;
  vat: number;
  parentGroup: string;
  image1: boolean;
  image2: boolean;
  image3: boolean;
  image4: boolean;
}

/* ── API calls ───────────────────────────────────────────────────── */

export async function seGetGroups(): Promise<SEGroup[]> {
  const res = await fetch(`${BASE_URL}/xml/GetAssortimentGroups`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const xml = await res.text();
  return splitBlocks(xml, "ExAssortimentGroupRecord")
    .map((b) => ({
      uid:      xmlVal(b, "Uid"),
      code:     xmlVal(b, "Code"),
      name:     xmlVal(b, "Name"),
      parent:   xmlVal(b, "Parent"),
      hasImage: xmlBool(b, "HasImage"),
    }))
    .filter((g) => !!g.uid);
}

export async function seGetProductsFromGroup(
  groupUid: string
): Promise<SEProduct[]> {
  const res = await fetch(
    `${BASE_URL}/xml/GetAssortimentFromGroup?groupUid=${groupUid}`,
    { cache: "no-store", signal: AbortSignal.timeout(30_000) }
  );
  const xml = await res.text();
  return splitBlocks(xml, "ExAssortimentRecord")
    .map((b) => ({
      uid:            xmlVal(b, "Uid"),
      code:           xmlVal(b, "Code"),
      name:           xmlVal(b, "Name"),
      description:    xmlVal(b, "Description"),
      price:          xmlFloat(b, "Price"),
      promotionPrice: xmlFloat(b, "PromotionPrice"),
      remain:         xmlFloat(b, "Remain"),
      unitName:       xmlVal(b, "UnitName"),
      vat:            xmlFloat(b, "VAT"),
      parentGroup:    xmlVal(b, "Parent"),
      image1:         xmlBool(b, "Image1"),
      image2:         xmlBool(b, "Image2"),
      image3:         xmlBool(b, "Image3"),
      image4:         xmlBool(b, "Image4"),
    }))
    .filter((p) => !!p.uid);
}

export async function seGetProduct(uid: string): Promise<SEProduct | null> {
  const res = await fetch(
    `${BASE_URL}/xml/GetAssortiment?aslUid=${uid}`,
    { cache: "no-store", signal: AbortSignal.timeout(15_000) }
  );
  const xml = await res.text();
  const u = xmlVal(xml, "Uid");
  if (!u) return null;
  return {
    uid:            u,
    code:           xmlVal(xml, "Code"),
    name:           xmlVal(xml, "Name"),
    description:    xmlVal(xml, "Description"),
    price:          xmlFloat(xml, "Price"),
    promotionPrice: xmlFloat(xml, "PromotionPrice"),
    remain:         xmlFloat(xml, "Remain"),
    unitName:       xmlVal(xml, "UnitName"),
    vat:            xmlFloat(xml, "VAT"),
    parentGroup:    xmlVal(xml, "Parent"),
    image1:         xmlBool(xml, "Image1"),
    image2:         xmlBool(xml, "Image2"),
    image3:         xmlBool(xml, "Image3"),
    image4:         xmlBool(xml, "Image4"),
  };
}

export async function seGetChanges(): Promise<{
  products: string[];
  groups: string[];
}> {
  const res = await fetch(`${BASE_URL}/json/GetAssortimentChanges`, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await res.json()) as Record<string, string[]>;
  return {
    products: data.ChangedAssortiment ?? [],
    groups:   data.ChangedAssortimentGroups ?? [],
  };
}

export async function seGetImage(
  uid: string,
  index: number
): Promise<Buffer | null> {
  const res = await fetch(
    `${BASE_URL}/xml/GetAssortimentImage?aslUid=${uid}&imageIndex=${index}`,
    { cache: "no-store", signal: AbortSignal.timeout(30_000) }
  );
  const xml = await res.text();
  const m = xml.match(/<Image>([^<]+)<\/Image>/);
  if (!m) return null;
  return Buffer.from(m[1], "base64");
}

export async function seSaveFastOrder(opts: {
  phone: string;
  address: string;
  deliveryType: 1 | 3;
  paymentType: 1 | 2 | 3 | 4;
  comment?: string;
  discountCardNumber?: string;
  lines: Array<{ uid: string; qty: number; lineNumber: number }>;
}): Promise<
  { ok: true; code: string; orderUid: string } | { ok: false; error: string }
> {
  const body = {
    Order: {
      Comment:            opts.comment ?? "",
      DeliveryAddress:    opts.address,
      DeliveryType:       opts.deliveryType,
      PaymentType:        opts.paymentType,
      PhoneNumber:        opts.phone,
      DiscountCardNumber: opts.discountCardNumber ?? "",
      Lines: opts.lines.map((l) => ({
        AssortimentUid: l.uid,
        Count:          l.qty,
        LineNumber:     l.lineNumber,
      })),
    },
  };

  try {
    const res = await fetch(`${BASE_URL}/json/SaveFastOrder`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(30_000),
    });
    const data = (await res.json()) as {
      ErrorCode: number;
      ErrorMessage: string | null;
      Order: { Uid: string; Code: string } | null;
    };
    if (data.ErrorCode !== 0) {
      return { ok: false, error: data.ErrorMessage || `Eroare API ${data.ErrorCode}` };
    }
    return {
      ok:       true,
      code:     data.Order?.Code ?? "",
      orderUid: data.Order?.Uid ?? "",
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export interface SEClientPrice {
  uid: string;
  price: number;
}

export async function seGetDiscountedPrices(
  productUids: string[],
  discountCardNumber: string
): Promise<
  { ok: true; prices: SEClientPrice[] } | { ok: false; error: string }
> {
  try {
    const res = await fetch(`${BASE_URL}/json/GetDiscountedPrices`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        AssortimentUid:     productUids,
        DiscountCardNumber: discountCardNumber,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = (await res.json()) as {
      ErrorCode: number;
      ErrorMessage: string | null;
      Prices: Array<{ AssortimentUid: string; Price: string }> | null;
    };
    if (data.ErrorCode !== 0) {
      return { ok: false, error: data.ErrorMessage || `Eroare API ${data.ErrorCode}` };
    }
    return {
      ok: true,
      prices: (data.Prices ?? []).map((p) => ({
        uid:   p.AssortimentUid,
        price: parseFloat(p.Price) || 0,
      })),
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
