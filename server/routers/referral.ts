import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { referrals, loyaltyLedger } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

/** Generate a random 8-char alphanumeric referral code */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export const referralRouter = router({
  /** Get or create the current user's referral code */
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const existing = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, ctx.user.id));

    if (existing.length > 0) {
      return {
        code: existing[0].code,
        conversions: existing.filter((r) => r.converted).length,
        totalPointsEarned: existing.reduce((sum, r) => sum + r.pointsAwarded, 0),
      };
    }

    // Create a new unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const clash = await db.select().from(referrals).where(eq(referrals.code, code)).limit(1);
      if (clash.length === 0) break;
      code = generateCode();
      attempts++;
    }

    await db.insert(referrals).values({
      referrerId: ctx.user.id,
      code,
    });

    return { code, conversions: 0, totalPointsEarned: 0 };
  }),

  /** Get stats for the current user's referrals */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const rows = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, ctx.user.id));

    return {
      totalReferrals: rows.length,
      converted: rows.filter((r) => r.converted).length,
      pending: rows.filter((r) => !r.converted).length,
      totalPointsEarned: rows.reduce((sum, r) => sum + r.pointsAwarded, 0),
      referrals: rows.map((r) => ({
        id: r.id,
        code: r.code,
        converted: r.converted,
        convertedAt: r.convertedAt,
        pointsAwarded: r.pointsAwarded,
        createdAt: r.createdAt,
      })),
    };
  }),

  /** Called when a new user lands on the site via a referral link — validates the code */
  trackVisit: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { valid: false };
      const ref = await db
        .select()
        .from(referrals)
        .where(eq(referrals.code, input.code.toUpperCase()))
        .limit(1);
      return { valid: ref.length > 0 };
    }),

  /** Award referrer points when a referred user makes their first purchase */
  convertReferral: protectedProcedure
    .input(z.object({ code: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const ref = await db
        .select()
        .from(referrals)
        .where(and(eq(referrals.code, input.code.toUpperCase()), eq(referrals.converted, false)))
        .limit(1);

      if (ref.length === 0) return { success: false, message: "Code not found or already converted" };

      const referral = ref[0];
      if (referral.referrerId === ctx.user.id) {
        return { success: false, message: "Cannot use your own referral code" };
      }

      const REFERRAL_POINTS = 100;

      // Mark referral as converted
      await db
        .update(referrals)
        .set({
          converted: true,
          convertedAt: new Date(),
          referredUserId: ctx.user.id,
          pointsAwarded: REFERRAL_POINTS,
        })
        .where(eq(referrals.id, referral.id));

      // Award points to referrer via ledger
      await db.insert(loyaltyLedger).values({
        userId: referral.referrerId,
        points: REFERRAL_POINTS,
        reason: "Referral conversion bonus",
        orderId: null,
      });

      // Increment referrer's loyalty balance
      await db.execute(
        sql`UPDATE users SET loyaltyPoints = loyaltyPoints + ${REFERRAL_POINTS} WHERE id = ${referral.referrerId}`
      );

      return { success: true, pointsAwarded: REFERRAL_POINTS };
    }),
});
