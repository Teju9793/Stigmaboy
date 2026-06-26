// supabase/functions/send-email/index.ts
// Deploy with: supabase functions deploy send-email

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "STIGMABOY <hello@stigmaboy.com>";

interface EmailPayload {
  type: "order_confirmation" | "welcome" | "resource_download";
  to: string;
  data: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload: EmailPayload = await req.json();

    let subject = "";
    let html = "";

    switch (payload.type) {
      case "order_confirmation": {
        const { order_id, items, total, name } = payload.data as {
          order_id: string;
          items: Array<{ title: string; price: number }>;
          total: number;
          name: string;
        };
        subject = `Order Confirmed — #${String(order_id).slice(-8).toUpperCase()}`;
        html = orderConfirmationEmail({ name, order_id, items, total });
        break;
      }

      case "welcome": {
        const { name } = payload.data as { name: string };
        subject = "Welcome to STIGMABOY 🎬";
        html = welcomeEmail({ name });
        break;
      }

      case "resource_download": {
        const { resource_title, download_url } = payload.data as {
          resource_title: string;
          download_url: string;
        };
        subject = `Your download is ready — ${resource_title}`;
        html = resourceDownloadEmail({ resource_title, download_url });
        break;
      }

      default:
        return new Response("Unknown email type", { status: 400 });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [payload.to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend error:", error);
      return new Response("Email send failed", { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response("Internal error", { status: 500 });
  }
});

// ============================================================
// EMAIL TEMPLATES
// ============================================================

function baseEmail(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background: #0A0A0F; font-family: 'Inter', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo-text { font-size: 24px; font-weight: 900; color: #A78BFA; letter-spacing: -0.02em; }
    .card { background: #111118; border: 1px solid #2A2A35; border-radius: 16px; padding: 32px; }
    h1 { color: #F0F0F8; font-size: 24px; font-weight: 800; margin: 0 0 12px; line-height: 1.2; }
    p { color: #A0A0B8; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
    .cta { display: block; text-align: center; background: #7C3AED; color: #ffffff;
           text-decoration: none; padding: 14px 28px; border-radius: 12px;
           font-weight: 700; font-size: 15px; margin: 24px 0; }
    .divider { border: none; border-top: 1px solid #2A2A35; margin: 24px 0; }
    .item-row { display: flex; justify-content: space-between; padding: 10px 0;
                border-bottom: 1px solid #2A2A35; }
    .item-title { color: #F0F0F8; font-size: 14px; font-weight: 500; }
    .item-price { color: #A78BFA; font-size: 14px; font-weight: 700; }
    .total-row { display: flex; justify-content: space-between; padding: 14px 0 0; }
    .total-label { color: #F0F0F8; font-size: 15px; font-weight: 700; }
    .total-amount { color: #FCD34D; font-size: 18px; font-weight: 900; }
    .footer { text-align: center; color: #5A5A72; font-size: 12px; margin-top: 32px; }
    .footer a { color: #7C3AED; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo">
      <span class="logo-text">STIGMABOY</span>
    </div>
    <div class="card">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} STIGMABOY · <a href="https://stigmaboy.com">stigmaboy.com</a></p>
      <p>You received this because you made a purchase or signed up on STIGMABOY.</p>
    </div>
  </div>
</body>
</html>`;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function orderConfirmationEmail({
  name,
  order_id,
  items,
  total,
}: {
  name: string;
  order_id: string;
  items: Array<{ title: string; price: number }>;
  total: number;
}): string {
  const itemRows = items
    .map(
      (item) => `
    <div class="item-row">
      <span class="item-title">${item.title}</span>
      <span class="item-price">${formatPrice(item.price)}</span>
    </div>`
    )
    .join("");

  return baseEmail(`
    <h1>Payment confirmed ✅</h1>
    <p>Hey ${name}, your order is confirmed and your content is ready to access.</p>
    <p style="color: #5A5A72; font-size: 12px;">
      Order #${String(order_id).slice(-8).toUpperCase()}
    </p>
    <hr class="divider">
    ${itemRows}
    <div class="total-row">
      <span class="total-label">Total paid</span>
      <span class="total-amount">${formatPrice(total)}</span>
    </div>
    <a href="https://stigmaboy.com/dashboard" class="cta">Go to Dashboard →</a>
    <p style="font-size: 12px; color: #5A5A72; text-align: center;">
      All your purchases are available in your dashboard anytime.
    </p>
  `);
}

function welcomeEmail({ name }: { name: string }): string {
  return baseEmail(`
    <h1>Welcome to STIGMABOY 🎬</h1>
    <p>Hey ${name}! Your account is active and you're ready to start learning.</p>
    <p>Browse our courses, grab free resources, and level up your editing game.</p>
    <a href="https://stigmaboy.com/courses" class="cta">Start Browsing Courses →</a>
    <hr class="divider">
    <p style="font-size: 12px; color: #5A5A72; text-align: center;">
      Questions? Reply to this email anytime.
    </p>
  `);
}

function resourceDownloadEmail({
  resource_title,
  download_url,
}: {
  resource_title: string;
  download_url: string;
}): string {
  return baseEmail(`
    <h1>Your download is ready 📦</h1>
    <p>Here's the download link for <strong style="color: #F0F0F8;">${resource_title}</strong>.</p>
    <p style="color: #5A5A72; font-size: 12px;">
      ⚠ This link expires in 15 minutes for security.
    </p>
    <a href="${download_url}" class="cta">Download Now →</a>
    <p style="font-size: 12px; color: #5A5A72; text-align: center;">
      If the link expired, visit your dashboard to get a fresh one.
    </p>
  `);
}
