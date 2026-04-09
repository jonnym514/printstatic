/**
 * Reviews tRPC Router
 * - getReviews: public — get reviews for a product
 * - submitReview: protected — verified buyers only
 * - getStats: public — average rating + count for a product
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createReview, getReviewsByProductId, getReviewStats,
  getUserReviewForProduct, getOrdersByUserId, getAllReviews,
} from "../db";

export const reviewsRouter = router({
  getReviews: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      return getReviewsByProductId(input.productId);
    }),

  getStats: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      return getReviewStats(input.productId);
    }),

  /** Batch stats — fetch avg rating + count for multiple products in one call */
  getStatsBatch: publicProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .query(async ({ input }) => {
      const results: Record<string, { avg: number; count: number }> = {};
      for (const id of input.productIds) {
        results[id] = await getReviewStats(id);
      }
      return results;
    }),

  submitReview: protectedProcedure
    .input(z.object({
      productId: z.string(),
      rating: z.number().int().min(1).max(5),
      title: z.string().max(255).optional(),
      body: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already reviewed this product
      const existing = await getUserReviewForProduct(ctx.user.id, input.productId);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You have already reviewed this product." });
      }

      // Check if user has purchased this product (verified buyer)
      const userOrders = await getOrdersByUserId(ctx.user.id);
      const hasPurchased = userOrders.some((o) => {
        const ids = o.productIds as string[];
        return ids.includes(input.productId);
      });

      await createReview({
        productId: input.productId,
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Anonymous",
        rating: input.rating,
        title: input.title,
        body: input.body,
        verified: hasPurchased,
      });

      return { success: true };
    }),

  // Admin: get all reviews
  getAllReviews: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return getAllReviews();
  }),
});
