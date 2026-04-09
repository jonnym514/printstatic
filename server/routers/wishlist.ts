/**
 * Wishlist tRPC Router
 * - getWishlist: protected — get current user's wishlist
 * - toggle: protected — add or remove a product
 * - isInWishlist: protected — check if a product is wishlisted
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { addToWishlist, removeFromWishlist, getWishlistByUserId, isInWishlist } from "../db";

export const wishlistRouter = router({
  getWishlist: protectedProcedure.query(async ({ ctx }) => {
    return getWishlistByUserId(ctx.user.id);
  }),

  toggle: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const inList = await isInWishlist(ctx.user.id, input.productId);
      if (inList) {
        await removeFromWishlist(ctx.user.id, input.productId);
        return { wishlisted: false };
      } else {
        await addToWishlist({ userId: ctx.user.id, productId: input.productId });
        return { wishlisted: true };
      }
    }),

  check: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const inList = await isInWishlist(ctx.user.id, input.productId);
      return { wishlisted: inList };
    }),
});
