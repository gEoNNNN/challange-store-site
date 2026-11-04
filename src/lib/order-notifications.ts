export interface OrderNotificationItem {
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderNotification {
  code: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  comment: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderNotificationItem[];
}

export type NotificationChannel = "email" | "telegram";

const moneyFormatter = new Intl.NumberFormat("ro-MD", {
  style: "currency",
  currency: "MDL",
  minimumFractionDigits: 2,
});

function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} missing from environment`);
  return value;
}

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanTelegramText(value: string, maxLength = 240) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}…` : clean;
}

function createEmailHtml(order: OrderNotification) {
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e8ece9;color:#2b2b2b;">${escapeHtml(item.name)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #e8ece9;text-align:center;color:#6b7280;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e8ece9;text-align:right;color:#2b2b2b;font-weight:600;">${escapeHtml(formatMoney(item.unitPrice * item.quantity))}</td>
    </tr>`).join("");

  return `<!doctype html>
<html lang="ro">
  <body style="margin:0;background:#f5f7f6;font-family:Arial,sans-serif;color:#2b2b2b;">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
      <div style="background:#071a0d;border-radius:20px 20px 0 0;padding:28px 32px;color:#fff;">
        <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7ee2aa;">Challenge Store</div>
        <h1 style="margin:10px 0 6px;font-size:28px;line-height:1.2;">Comanda ta a fost înregistrată</h1>
        <p style="margin:0;color:#b9c8bf;line-height:1.5;">Îți mulțumim, ${escapeHtml(order.customerName)}. Te vom contacta pentru confirmarea livrării.</p>
      </div>
      <div style="background:#fff;padding:28px 32px;border:1px solid #e3e8e5;border-top:0;border-radius:0 0 20px 20px;">
        <div style="margin-bottom:24px;padding:16px 18px;background:#eff8f2;border-radius:12px;">
          <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;">Numărul comenzii</div>
          <div style="margin-top:4px;font-size:22px;font-weight:800;color:#01934a;">#${escapeHtml(order.code)}</div>
        </div>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr>
              <th style="padding:0 0 10px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;">Produs</th>
              <th style="padding:0 8px 10px;text-align:center;color:#6b7280;font-size:12px;text-transform:uppercase;">Cant.</th>
              <th style="padding:0 0 10px;text-align:right;color:#6b7280;font-size:12px;text-transform:uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="margin-top:20px;margin-left:auto;max-width:280px;font-size:14px;">
          <div style="display:flex;justify-content:space-between;padding:6px 0;color:#6b7280;"><span>Subtotal</span><span>${escapeHtml(formatMoney(order.subtotal))}</span></div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;color:#6b7280;"><span>Livrare</span><span>${order.shipping === 0 ? "Gratuit" : escapeHtml(formatMoney(order.shipping))}</span></div>
          <div style="display:flex;justify-content:space-between;padding:12px 0 0;margin-top:6px;border-top:1px solid #e8ece9;font-size:18px;font-weight:800;"><span>Total</span><span>${escapeHtml(formatMoney(order.total))}</span></div>
        </div>
        <div style="margin-top:28px;padding-top:22px;border-top:1px solid #e8ece9;font-size:14px;line-height:1.6;color:#6b7280;">
          <strong style="color:#2b2b2b;">Livrare la:</strong><br>
          ${escapeHtml(order.address)}, ${escapeHtml(order.city)}<br>
          Telefon: ${escapeHtml(order.phone)}
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function createEmailText(order: OrderNotification) {
  const items = order.items
    .map((item) => `${item.quantity} × ${item.name} — ${formatMoney(item.unitPrice * item.quantity)}`)
    .join("\n");

  return [
    `Bună, ${order.customerName}!`,
    "",
    `Comanda #${order.code} a fost înregistrată. Te vom contacta pentru confirmarea livrării.`,
    "",
    items,
    "",
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Livrare: ${order.shipping === 0 ? "Gratuit" : formatMoney(order.shipping)}`,
    `Total: ${formatMoney(order.total)}`,
    "",
    `Livrare la: ${order.address}, ${order.city}`,
    `Telefon: ${order.phone}`,
  ].join("\n");
}

async function sendCustomerEmail(order: OrderNotification) {
  const apiKey = requireEnv("BREVO_API_KEY");
  const senderEmail = requireEnv("ORDER_FROM_EMAIL");
  const senderName = process.env.ORDER_FROM_NAME?.trim() || "Challenge Store";
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ name: order.customerName, email: order.email }],
      subject: `Confirmare comandă #${order.code} | Challenge Store`,
      htmlContent: createEmailHtml(order),
      textContent: createEmailText(order),
    }),
  });

  if (!response.ok) throw new Error(`Brevo request failed with status ${response.status}`);
}

function splitTelegramMessage(lines: string[], maxLength = 3900) {
  const chunks: string[] = [];
  let current = "";

  for (const sourceLine of lines) {
    let line = sourceLine;
    while (line.length > maxLength) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      chunks.push(line.slice(0, maxLength));
      line = line.slice(maxLength);
    }
    const next = current ? `${current}\n${line}` : line;
    if (next.length > maxLength) {
      chunks.push(current);
      current = line;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

async function sendTelegramOrder(order: OrderNotification) {
  const token = requireEnv("TELEGRAM_BOT_TOKEN");
  const chatId = requireEnv("TELEGRAM_ADMIN_CHAT_ID");
  const itemLines = order.items.map((item, index) =>
    `${index + 1}. ${item.quantity} × ${cleanTelegramText(item.name)} — ${formatMoney(item.unitPrice * item.quantity)}`,
  );
  const lines = [
    `COMANDĂ NOUĂ #${cleanTelegramText(order.code)}`,
    "",
    `Client: ${cleanTelegramText(order.customerName)}`,
    `Telefon: ${cleanTelegramText(order.phone)}`,
    `Email: ${cleanTelegramText(order.email)}`,
    `Adresă: ${cleanTelegramText(order.address)}, ${cleanTelegramText(order.city)}`,
    "",
    "Produse:",
    ...itemLines,
    "",
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Livrare: ${order.shipping === 0 ? "Gratuit" : formatMoney(order.shipping)}`,
    `TOTAL: ${formatMoney(order.total)}`,
    ...(order.comment ? ["", `Comentariu: ${cleanTelegramText(order.comment, 500)}`] : []),
  ];

  for (const text of splitTelegramMessage(lines)) {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!response.ok) throw new Error(`Telegram request failed with status ${response.status}`);
  }
}

export async function sendOrderNotifications(
  order: OrderNotification,
  channels: NotificationChannel[] = ["email", "telegram"],
) {
  const notifications = [
    { name: "email" as const, send: () => sendCustomerEmail(order) },
    { name: "telegram" as const, send: () => sendTelegramOrder(order) },
  ].filter(({ name }) => channels.includes(name as NotificationChannel));
  const results = await Promise.allSettled(notifications.map(({ send }) => send()));
  return results.flatMap((result, index) =>
    result.status === "rejected" ? [notifications[index].name as NotificationChannel] : [],
  );
}
