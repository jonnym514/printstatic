/**
 * Loyalty Points tRPC Router
 * - getBalance: returns the current user's loyalty points balance
 * - getHistory: returns the loyalty ledger entries for the current user
 */

import { protectedProcedure, router } from "../_core/trpc";
import { getUserById, getLoyaltyHistory } from "../db";

export const loyaltyRouter = router({
  /**
   * Get the current user's loyalty points balance.
   * Returns { points, tier, nextTierPoints, nextTier }
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    const points = user?.loyaltyPoints ?? 0;

    // Tier thresholds
    const tiers = [
      { name: "Bronze", min: 0, max: 499, color: "#cd7f32" },
      { name: "Silver", min: 500, max: 1499, color: "#c0c0c0" },
      { name: "Gold", min: 1500, max: 2999, color: "#ffd700" },
      { name: "Platinum", min: 3000, max: Infinity, color: "#e5e4e2" },
    ];

    const currentTier = tiers.find((t) => points >= t.min && points <= t.max) ?? tiers[0];
    const nextTier = tiers[tiers.indexOf(currentTier) + 1] ?? null;

    return {
      points,
      tier: currentTier.name,
      tierColor: currentTier.color,
      nextTier: nextTier?.name ?? null,
      pointsToNextTier: nextTier ? nextTier.min - points : 0,
      progressPercent: nextTier
        ? Math.round(((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
        : 100,
    };
  }),

  /**
   * Get the current user's loyalty ledger history.
   */
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const history = await getLoyaltyHistory(ctx.user.id);
    return history.map((entry) => ({
      id: entry.id,
      points: entry.points,
      reason: entry.reason,
      createdAt: entry.createdAt,
    }));
  }),
});
