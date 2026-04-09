/**
 * Abandoned Cart Router
 *
 * Handles logging cart state for logged-in users and triggering
 * recovery email notifications via the owner notification system.
 *
 * Flow:
 * 1. Frontend calls `saveCart` whenever a logged-in user's cart changes.
 * 2. A scheduled job (or agent) calls `processAbandonedCarts` to find carts
 *    older than 24h with no checkout and no email sent yet.
 * 3. For each abandoned cart, an owner notification is sent and emailSent is set.
 * 4. When a user completes checkout, the Stripe webhook calls `markRecovered`.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { abandonedCarts } from "../../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { invokeLLM } from "../_core/llm";
import { runAbandonedCartRecovery } from "../scheduler";

const CartItemSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    image: z.string().optional(),
  }),
  packQty: z.number(),
  linePrice: z.number(),
});

export const abandonedCartRouter = router({
  /**
   * Save or update the current cart snapshot for a logged-in user.
   * Called from the frontend whenever the cart changes.
   */
  saveCart: protectedProcedure
    .input(
      z.object({
        items: z.array(CartItemSchema),
        cartTotal: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { saved: false };

      if (input.items.length === 0) {
        // Cart cleared — mark any existing record as recovered
        await db
          .update(abandonedCarts)
          .set({ recovered: true, recoveredAt: new Date() })
          .where(
            and(
              eq(abandonedCarts.userId, ctx.user.id),
              eq(abandonedCarts.recovered, false)
            )
          );
        return { saved: false };
      }

      const existing = await db
        .select()
        .from(abandonedCarts)
        .where(
          and(
            eq(abandonedCarts.userId, ctx.user.id),
            eq(abandonedCarts.recovered, false)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing record
        await db
          .update(abandonedCarts)
          .set({
            cartSnapshot: input.items,
            cartTotal: input.cartTotal,
            emailSent: false,
          })
          .where(eq(abandonedCarts.id, existing[0].id));
      } else {
        // Create new record
        await db.insert(abandonedCarts).values({
          userId: ctx.user.id,
          userEmail: ctx.user.email ?? "",
          userName: ctx.user.name ?? undefined,
          cartSnapshot: input.items,
          cartTotal: input.cartTotal,
          emailSent: false,
          recovered: false,
        });
      }

      return { saved: true };
    }),

  /**
   * Mark a user's cart as recovered (called after successful Stripe checkout).
   */
  markRecovered: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { ok: false };
    await db
      .update(abandonedCarts)
      .set({ recovered: true, recoveredAt: new Date() })
      .where(
        and(
          eq(abandonedCarts.userId, ctx.user.id),
          eq(abandonedCarts.recovered, false)
        )
      );
    return { ok: true };
  }),

  /**
   * Admin: process abandoned carts older than 24h and send recovery notifications.
   * Also runs automatically via the background scheduler every 6 hours.
   */
  processAbandonedCarts: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return runAbandonedCartRecovery();
  }),

  /**
   * Admin: list all abandoned carts with stats.
   */
  listAbandonedCarts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) return { carts: [], stats: { total: 0, pendingCount: 0, emailSentCount: 0, recoveredCount: 0, totalValue: 0 } };

    const rows = await db
      .select()
      .from(abandonedCarts)
      .orderBy(abandonedCarts.createdAt)
      .limit(input.limit)
      .offset(input.offset);

      const total = rows.length;
      const pendingCount = rows.filter((r: typeof rows[number]) => !r.recovered && !r.emailSent).length;
      const emailSentCount = rows.filter((r: typeof rows[number]) => r.emailSent && !r.recovered).length;
      const recoveredCount = rows.filter((r: typeof rows[number]) => r.recovered).length;
      const totalValue = rows
        .filter((r: typeof rows[number]) => !r.recovered)
        .reduce((sum: number, r: typeof rows[number]) => sum + r.cartTotal, 0);

      return {
        carts: rows,
        stats: { total, pendingCount, emailSentCount, recoveredCount, totalValue },
      };
    }),
});
