/**
 * Stripe Webhook Handler
 * Registered BEFORE express.json() so raw body is available for signature verification.
 * Route: POST /api/stripe/webhook
 */

import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { createOrder, getOrderBySessionId, getFilesByProductId } from "./db";
import { getProductById } from "../shared/products";
import { storageGet } from "./storage";
import { triggerPostPurchaseEmails } from "./postPurchaseEmails";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;

      try {
        if (!webhookSecret) {
          console.warn("[Webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
          event = JSON.parse(req.body.toString()) as Stripe.Event;
        } else {
          event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Webhook] Signature verification failed:", message);
        return res.status(400).json({ error: `Webhook Error: ${message}` });
      }

      // ── Test event passthrough (required for Stripe webhook verification) ──
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session);
            break;
          }
          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Webhook] Error processing event:", err);
        return res.status(500).json({ error: "Internal server error processing webhook" });
      }

      return res.json({ received: true });
    }
  );
}

/**
 * Get the first available signed download URL for a set of product IDs.
 * Falls back to the order-success page if no files are found.
 */
async function getFirstDownloadUrl(productIds: string[], fallbackSessionId?: string): Promise<string> {
  for (const productId of productIds) {
    const files = await getFilesByProductId(productId);
    if (files.length > 0) {
      try {
        const { url } = await storageGet(files[0].s3Key);
        return url;
      } catch {
        // continue to next product
      }
    }
  }
  if (fallbackSessionId) {
    return `https://printstatic.com/order-success?session_id=${fallbackSessionId}`;
  }
  return "https://printstatic.com/orders";
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Idempotency check — skip if already processed
  const existing = await getOrderBySessionId(session.id);
  if (existing) {
    console.log(`[Webhook] Order already exists for session ${session.id}, skipping`);
    return;
  }

  const metadata = session.metadata ?? {};
  const customerEmail = session.customer_details?.email ?? metadata.customer_email ?? "";
  const customerName = session.customer_details?.name ?? metadata.customer_name ?? null;
  const userId = metadata.user_id ? parseInt(metadata.user_id) : null;

  // Extract product IDs from metadata
  let productIds: string[] = [];
  try {
    productIds = metadata.product_ids ? JSON.parse(metadata.product_ids) : [];
  } catch {
    productIds = [];
  }

  await createOrder({
    stripeSessionId: session.id,
    stripePaymentIntentId: typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null),
    userId: userId,
    customerEmail,
    customerName,
    productIds,
    amountTotal: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    status: "completed",
  });

  console.log(`[Webhook] Order created for session ${session.id} — ${customerEmail}`);

  // ── Trigger post-purchase email sequence ──────────────────────────────────
  try {
    const downloadUrl = await getFirstDownloadUrl(productIds, session.id);
    const order = await getOrderBySessionId(session.id);
    const orderId = order?.id ?? 0;

    await triggerPostPurchaseEmails({
      orderId,
      customerEmail,
      customerName: customerName ?? undefined,
      productIds,
      downloadUrl,
    });

    console.log(`[Webhook] Post-purchase email sequence queued for ${customerEmail}`);
  } catch (err) {
    // Don't fail the webhook if email enqueue fails — order is already saved
    console.error("[Webhook] Failed to trigger post-purchase emails:", err);
  }
}
