/**
 * Post-Purchase Email Helper
 * Extracted from the marketing router so the webhook can call it directly
 * without going through tRPC.
 */


import { enqueueEmail, logAgentAction } from "./db";
import { buildEmailHtml } from "./routers/marketing";
import { ALL_PRODUCTS as products } from "../shared/products";


interface PostPurchaseInput {
  orderId: number;
  customerEmail: string;
  customerName?: string;
  productIds: string[];
  downloadUrl: string;
}


export async function triggerPostPurchaseEmails(input: PostPurchaseInput): Promise<void> {
  const name = input.customerName?.split(" ")[0] ?? "there";
  const productNames = input.productIds
    .map(id => products.find(p => p.id === id)?.name ?? id)
    .join(", ");


  const now = new Date();


  // Email 1: Immediate download confirmation
  await enqueueEmail({
    toEmail: input.customerEmail,
    toName: input.customerName ?? undefined,
    emailType: "purchase_confirm",
    subject: "✅ Your files are ready — Print Static",
    htmlBody: buildEmailHtml({
      title: "Your files are ready",
      preheader: `Download your ${productNames} now`,
      body: `<h2 style="margin:0 0 16px;font-size:24px;">Hi ${name}, your files are ready! 🎉</h2>/**
 * Post-Purchase Email Helper
 * Extracted from the marketing router so the webhook can call it directly
 * without going through tRPC.
 */

import { enqueueEmail, logAgentAction } from "./db";
import { buildEmailHtml } from "./routers/marketing";
import { products } from "../../client/src/lib/products";

interface PostPurchaseInput {
  orderId: number;
  customerEmail: string;
  customerName?: string;
  productIds: string[];
  downloadUrl: string;
}

export async function triggerPostPurchaseEmails(input: PostPurchaseInput): Promise<void> {
  const name = input.customerName?.split(" ")[0] ?? "there";
  const productNames = input.productIds
    .map(id => products.find(p => p.id === id)?.name ?? id)
    .join(", ");

  const now = new Date();

  // Email 1: Immediate download confirmation
  await enqueueEmail({
    toEmail: input.customerEmail,
    toName: input.customerName ?? undefined,
    emailType: "purchase_confirm",
    subject: "✅ Your files are ready — Print Static",
    htmlBody: buildEmailHtml({
      title: "Your files are ready",
      preheader: `Download your ${productNames} now`,
      body: `<h2 style="margin:0 0 16px;font-size:24px;">Hi ${name}, your files are ready! 🎉</h2>
<p>Thank you for your purchase. Your download is waiting for you:</p>
<p><strong>${productNames}</strong></p>
<p>Click the button below to access your files. You can re-download them anytime from your Order History.</p>`,
      ctaText: "Download Your Files →",
      ctaUrl: input.downloadUrl,
    }),
    orderId: input.orderId,
    sendAt: now,
  });

  // Email 2: Tips & tricks (24 hours later)
  const tips24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  await enqueueEmail({
    toEmail: input.customerEmail,
    toName: input.customerName ?? undefined,
    emailType: "tips_followup",
    subject: "🖨️ 5 tips for perfect home printing — Print Static",
    htmlBody: buildEmailHtml({
      title: "5 tips for perfect home printing",
      preheader: "Get the best results from your new templates",
      body: `<h2 style="margin:0 0 16px;font-size:22px;">Get the most from your templates</h2>
<p>Hi ${name}! Here are 5 quick tips to get perfect prints every time:</p>
<ol style="padding-left:20px;">
  <li style="margin-bottom:10px;"><strong>Use "Fit to Page"</strong> in your print dialog to avoid cropping.</li>
  <li style="margin-bottom:10px;"><strong>Print on 80–90gsm paper</strong> for crisp, professional results.</li>
  <li style="margin-bottom:10px;"><strong>Select "Best Quality"</strong> in your printer settings for sharp text.</li>
  <li style="margin-bottom:10px;"><strong>Use a PDF reader</strong> (Adobe Acrobat or Preview) rather than your browser for printing.</li>
  <li style="margin-bottom:10px;"><strong>Print a test page first</strong> on plain paper before using premium stock.</li>
</ol>
<p>Need help? Reply to this email and we'll get back to you within 24 hours.</p>`,
      ctaText: "Browse More Templates →",
      ctaUrl: "https://printstatic.com/shop",
    }),
    orderId: input.orderId,
    sendAt: tips24h,
  });

  // Email 3: Upsell (3 days later)
  const upsell3d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  await enqueueEmail({
    toEmail: input.customerEmail,
    toName: input.customerName ?? undefined,
    emailType: "upsell",
    subject: "🎁 Customers who bought this also loved... — Print Static",
    htmlBody: buildEmailHtml({
      title: "You might also love these",
      preheader: "Handpicked templates based on your purchase",
      body: `<h2 style="margin:0 0 16px;font-size:22px;">Hi ${name}, here's what customers like you also love</h2>
<p>Based on your recent purchase, we think you'd love these:</p>
<ul style="padding-left:20px;">
  <li style="margin-bottom:10px;"><strong>Habit Tracker</strong> — Build better habits with our 30-day tracker</li>
  <li style="margin-bottom:10px;"><strong>Budget Planner</strong> — Take control of your finances</li>
  <li style="margin-bottom:10px;"><strong>Goal Workbook</strong> — Turn your goals into action plans</li>
</ul>
<p>All available as instant downloads. Use code <strong>RETURN10</strong> for 10% off your next order.</p>`,
      ctaText: "Shop Now →",
      ctaUrl: "https://printstatic.com/shop",
    }),
    orderId: input.orderId,
    sendAt: upsell3d,
  });

  await logAgentAction({
    agentType: "marketing",
    action: "post_purchase_sequence_queued",
    payload: { orderId: input.orderId, email: input.customerEmail, emails: 3 },
    status: "success",
  });

  console.log(`[PostPurchase] 3-email sequence queued for order #${input.orderId} (${input.customerEmail})`);
}
