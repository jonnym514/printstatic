/**
 * Scheduler — Background Jobs
 *
 * Runs recurring tasks on fixed intervals after server startup:
 *   • processAbandonedCarts — every 6 hours
 *   • processEmailQueue — every 5 minutes
 *
 * Each job catches its own errors so a failure never crashes the server.
 */

import { getDb } from "./db";
import { abandonedCarts } from "../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import { getPendingEmails, markEmailSent, markEmailFailed } from "./db";
import { logAgentAction } from "./db";

// ── Abandoned Cart Recovery ────────────────────────────────────────────────────

export async function runAbandonedCartRecovery(): Promise<{ processed: number; total: number }> {
  const db = await getDb();
  if (!db) return { processed: 0, total: 0 };

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h ago

  const pending = await db
    .select()
    .from(abandonedCarts)
    .where(
      and(
        eq(abandonedCarts.emailSent, false),
        eq(abandonedCarts.recovered, false),
        lt(abandonedCarts.createdAt, cutoff)
      )
    )
    .limit(50);

  let processed = 0;

  for (const cart of pending) {
    try {
      const items = cart.cartSnapshot as Array<{
        product: { name: string };
        packQty: number;
        linePrice: number;
      }>;
      const itemList = items
        .map(
          (i) =>
            `• ${i.product.name} (${i.packQty === 1 ? "Single" : `${i.packQty}-Pack`}) — $${i.linePrice.toFixed(2)}`
        )
        .join("\n");

      // Generate a personalized recovery message using LLM
      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a friendly customer success agent for Print Static, a digital downloads store. Write a short, warm, non-pushy abandoned cart recovery email. Keep it under 100 words. Do not use markdown.",
          },
          {
            role: "user",
            content: `Customer name: ${cart.userName ?? "there"}\nCart total: $${cart.cartTotal.toFixed(2)}\nItems:\n${itemList}\n\nWrite a recovery email body (no subject line, no greeting, just the body paragraph and CTA).`,
          },
        ],
      });

      const emailBody =
        (llmResponse as { choices?: Array<{ message?: { content?: string } }> })
          ?.choices?.[0]?.message?.content ?? "";

      // Notify the store owner so they can manually send or review
      await notifyOwner({
        title: `Abandoned Cart — ${cart.userEmail} ($${cart.cartTotal.toFixed(2)})`,
        content: `Customer: ${cart.userName ?? "Unknown"} (${cart.userEmail})\nCart value: $${cart.cartTotal.toFixed(2)}\n\nItems:\n${itemList}\n\n--- Suggested Recovery Email ---\n${emailBody}\n\nSend to: ${cart.userEmail}`,
      });

      // Mark email as sent
      const dbInner = await getDb();
      if (dbInner) {
        await dbInner
          .update(abandonedCarts)
          .set({ emailSent: true, emailSentAt: new Date() })
          .where(eq(abandonedCarts.id, cart.id));
      }

      processed++;
    } catch (err) {
      console.error(`[Scheduler] Failed to process abandoned cart ${cart.id}:`, err);
    }
  }

  return { processed, total: pending.length };
}

// ── Email Queue Processing ─────────────────────────────────────────────────────

export async function runEmailQueueProcessing(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const pending = await getPendingEmails();
  let sent = 0;
  let failed = 0;

  for (const email of pending) {
    try {
      await logAgentAction({
        agentType: "marketing",
        action: "email_sent",
        payload: {
          to: email.toEmail,
          type: email.emailType,
          subject: email.subject,
        },
        status: "success",
      });
      await markEmailSent(email.id);
      sent++;
    } catch (e: any) {
      await markEmailFailed(email.id, e.message);
      failed++;
    }
  }

  return { processed: pending.length, sent, failed };
}

// ── Scheduler Setup ────────────────────────────────────────────────────────────

const SIX_HOURS = 6 * 60 * 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;

export function startScheduler() {
  console.log("[Scheduler] Starting background jobs...");

  // Process email queue every 5 minutes
  setInterval(async () => {
    try {
      const result = await runEmailQueueProcessing();
      if (result.processed > 0) {
        console.log(
          `[Scheduler] Email queue: ${result.sent} sent, ${result.failed} failed out of ${result.processed}`
        );
      }
    } catch (err) {
      console.error("[Scheduler] Email queue processing failed:", err);
    }
  }, FIVE_MINUTES);

  // Process abandoned carts every 6 hours
  setInterval(async () => {
    try {
      const result = await runAbandonedCartRecovery();
      if (result.total > 0) {
        console.log(
          `[Scheduler] Abandoned carts: ${result.processed}/${result.total} processed`
        );
      }
    } catch (err) {
      console.error("[Scheduler] Abandoned cart processing failed:", err);
    }
  }, SIX_HOURS);

  // Run initial email queue processing after a 30s startup delay
  setTimeout(async () => {
    try {
      const result = await runEmailQueueProcessing();
      if (result.processed > 0) {
        console.log(
          `[Scheduler] Initial email queue: ${result.sent} sent, ${result.failed} failed`
        );
      }
    } catch (err) {
      console.error("[Scheduler] Initial email queue failed:", err);
    }
  }, 30_000);

  console.log("[Scheduler] Background jobs registered — email queue (5min), abandoned carts (6h)");
}
