import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_BASE_URL = "https://sandbox.maibmerchants.md";
const SIGNATURE_MAX_AGE_MS = 5 * 60 * 1000;

interface MaibEnvelope<T> {
  result: T | null;
  ok: boolean;
  errors?: { code?: string; message?: string }[] | null;
}

interface MaibToken {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface MaibCheckoutItem {
  externalId: string;
  title: string;
  amount: number;
  currency: "MDL";
  quantity: number;
  displayOrder: number;
}

export interface CreateMaibCheckoutInput {
  amount: number;
  orderId: string;
  description: string;
  orderAmount: number;
  deliveryAmount: number;
  items: MaibCheckoutItem[];
  payer: {
    name: string;
    email: string;
    phone: string;
    ip?: string;
    userAgent?: string;
  };
  language: "ro" | "ru" | "en";
  callbackUrl: string;
  successUrl: string;
  failUrl: string;
}

export interface MaibCheckoutDetails {
  id: string;
  status: "WaitingForInit" | "Initialized" | "PaymentMethodSelected" | "Completed" | "Expired" | "Abandoned" | "Cancelled" | "Failed";
  amount: number;
  currency: string;
  completedAt?: string | null;
  order?: { id?: string | null } | null;
  payment?: {
    id?: string | null;
    status?: string | null;
    amount?: number | null;
    currency?: string | null;
  } | null;
}

export class MaibApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "MaibApiError";
  }
}

let cachedToken: { authorization: string; expiresAt: number } | null = null;

function getMaibConfig() {
  const clientId = process.env.MAIB_CLIENT_ID?.trim();
  const clientSecret = process.env.MAIB_CLIENT_SECRET?.trim();
  const baseUrl = (process.env.MAIB_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");
  if (!clientId || !clientSecret) throw new Error("MAIB credentials missing from environment");
  return { clientId, clientSecret, baseUrl };
}

async function readMaibResponse<T>(response: Response) {
  const body = await response.json().catch(() => null) as MaibEnvelope<T> | null;
  if (!response.ok || !body?.ok || !body.result) {
    const providerMessage = body?.errors?.[0]?.message;
    throw new MaibApiError(providerMessage || "Cererea către maib a eșuat.", response.status);
  }
  return body.result;
}

async function getAuthorization(forceRefresh = false) {
  if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.authorization;
  }

  const { clientId, clientSecret, baseUrl } = getMaibConfig();
  const response = await fetch(`${baseUrl}/v2/auth/token`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ clientId, clientSecret }),
    cache: "no-store",
  });
  const token = await readMaibResponse<MaibToken>(response);
  cachedToken = {
    authorization: `${token.tokenType || "Bearer"} ${token.accessToken}`,
    expiresAt: Date.now() + Math.max(0, Number(token.expiresIn) || 0) * 1000,
  };
  return cachedToken.authorization;
}

async function maibRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const { baseUrl } = getMaibConfig();
  const authorization = await getAuthorization();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
      authorization,
    },
    cache: "no-store",
  });

  if (response.status === 401 && retry) {
    cachedToken = null;
    await getAuthorization(true);
    return maibRequest<T>(path, init, false);
  }
  return readMaibResponse<T>(response);
}

export async function createMaibCheckout(input: CreateMaibCheckoutInput) {
  return maibRequest<{ checkoutId: string; checkoutUrl: string }>("/v2/checkouts", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amount,
      currency: "MDL",
      orderInfo: {
        id: input.orderId,
        description: input.description.slice(0, 125),
        date: new Date().toISOString(),
        orderAmount: input.orderAmount,
        orderCurrency: "MDL",
        deliveryAmount: input.deliveryAmount,
        deliveryCurrency: "MDL",
        items: input.items,
      },
      payerInfo: input.payer,
      language: input.language,
      callbackUrl: input.callbackUrl,
      successUrl: input.successUrl,
      failUrl: input.failUrl,
    }),
  });
}

export async function getMaibCheckout(checkoutId: string) {
  return maibRequest<MaibCheckoutDetails>(`/v2/checkouts/${encodeURIComponent(checkoutId)}`);
}

export async function cancelMaibCheckout(checkoutId: string) {
  return maibRequest<{ checkoutId: string; status: "Cancelled" }>(
    `/v2/checkouts/${encodeURIComponent(checkoutId)}/cancel`,
    { method: "POST", body: "{}" },
  );
}

export function verifyMaibCallback(rawBody: string, signatureHeader: string | null, timestamp: string | null) {
  const signatureKey = process.env.MAIB_SIGNATURE_KEY?.trim();
  if (!signatureKey || !signatureHeader || !timestamp || !/^\d{10,16}$/.test(timestamp)) return false;

  const timestampMs = Number(timestamp);
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > SIGNATURE_MAX_AGE_MS) return false;

  const received = signatureHeader.replace(/^sha256=/i, "").trim();
  const digest = createHmac("sha256", signatureKey)
    .update(`${rawBody}.${timestamp}`, "utf8")
    .digest();
  const candidates = [digest.toString("base64"), digest.toString("hex")];

  return candidates.some((candidate) => {
    const expectedBuffer = Buffer.from(candidate);
    const receivedBuffer = Buffer.from(received);
    return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
  });
}
