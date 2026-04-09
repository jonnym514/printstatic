/**
 * Flash Sales tRPC Router
 * - getActive: public — get currently active flash sales
 * - create: admin only — create a new flash sale
 * - delete: admin only — remove a flash sale
 * - getAll: admin only — list all flash sales
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getActiveFlashSales, getAllFlashSales, createFlashSale, deleteFlashSale } from "../db";

export const flashSalesRouter = router({
  getActive: publicProcedure.query(async () => {
    const sales = await getActiveFlashSales();
    return sales.map((s) => ({
      id: s.id,
      name: s.name,
      productIds: s.productIds as string[],
      discountPercent: s.discountPercent,
      endsAt: s.endsAt,
    }));
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    return getAllFlashSales();
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      productIds: z.array(z.string()).min(1),
      discountPercent: z.number().int().min(1).max(99),
      startsAt: z.date(),
      endsAt: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await createFlashSale({
        name: input.name,
        productIds: input.productIds,
        discountPercent: input.discountPercent,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        active: true,
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      await deleteFlashSale(input.id);
      return { success: true };
    }),
});
