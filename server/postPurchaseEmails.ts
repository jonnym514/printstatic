/**
 * Post-Purchase Email Helper
 * Extracted from the marketing router so the webhook can call it
 * without going through tRPC (webhooks don't have user sessions).
 */

import { db } from "./_core/db";
import { emailQueue } from "./_core/schema";
import { ALL_PRODUCTS } from "../shared/products";

// ── Types ──────────────────────────────────────────────────────────────────────

interface OrderItem {
  productId: string;
  quantity: number;
  selectedColor?: string;
  selectedStyle?: string;
}

// ── Email Trigger ──────────────────────────────────────────────────────────────

/**
 * Called by the Stripe webhook after a successful checkout.
 * Enqueues three emails in the email_queue table:
 *   1. Immediate download-confirmation email
 *   2. 24-hour tips & tricks follow-up
 *   3. 3-day upsell / review-request email
 *
 * The scheduler picks these up and sends them via Resend.
 */
export async function triggerPostPurchaseEmails(
  customerEmail: string,
  customerName: string,
  orderId: number,
  items: OrderItem[],
  downloadUrl: string
) {
  const productNames = items
    .map((i) => {
      const product = ALL_PRODUCTS.find((p) => p.id === i.productId);
      return product?.name ?? i.productId;
    })
    .join(", ");

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in3d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Immediate: download confirmation
  await db.insert(emailQueue).values({
    toEmail: customerEmail,
    subject: "Your Print Static order is ready!",
    htmlBody: immediateEmail(customerName, productNames, downloadUrl),
    scheduledFor: now,
  });

  // 24 hours later: tips & tricks
  await db.insert(emailQueue).values({
    toEmail: customerEmail,
    subject: "Tips for getting the most out of your purchase",
    htmlBody: tipsEmail(customerName, productNames),
    scheduledFor: in24h,
  });

  // 3 days later: review request + upsell
  await db.insert(emailQueue).values({
    toEmail: customerEmail,
    subject: "How are you enjoying your purchase?",
    htmlBody: reviewEmail(customerName, productNames),
    scheduledFor: in3d,
  });
}

// ── Email Templates (simple inline HTML) ──────────────────────────────────────

function immediateEmail(name: string, products: string, downloadUrl: string) {
  return "<h2>Hi " + name + "!</h2>" +
    "<p>Thank you for your purchase from <strong>Print Static</strong>.</p>" +
    "<p>You ordered: <strong>" + products + "</strong></p>" +
    '<p><a href="' + downloadUrl + '" style="display:inline-block;padding:12px 24px;background:#00c4a7;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Download Your Files</a></p>' +
    '<p style="color:#888;font-size:13px;">This link expires in 7 days. You can always re-download from your account.</p>';
}

function tipsEmail(name: string, products: string) {
  return "<h2>Hey " + name + "!</h2>" +
    "<p>We hope you are enjoying <strong>" + products + "</strong>!</p>" +
    "<p>Here are a few tips:</p>" +
    "<ul>" +
    "<li>Print at 300 DPI for the sharpest results</li>" +
    "<li>Use thick cardstock for invitations and cards</li>" +
    '<li>Check out our <a href="https://printstatic.com/blog">blog</a> for design inspiration</li>' +
    "</ul>" +
    "<p>Happy creating!</p>";
}

function reviewEmail(name: string, products: string) {
  return "<h2>Hi " + name + "!</h2>" +
    "<p>How are you enjoying <strong>" + products + "</strong>?</p>" +
    "<p>We would love to hear your thoughts - reviews help other creators discover Print Static.</p>" +
    '<p><a href="https://printstatic.com/shop" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Leave a Review</a></p>' +
    "<p>Looking for more? Check out our latest bundles and save up to 50%!</p>";
}
