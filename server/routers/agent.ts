
  subscribeEmail: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().optional(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      await addEmailSubscriber({
        email: input.email,
        name: input.name,
        source: input.source ?? "newsletter",
        active: true,
      });
      return { success: true };
    }),

  getSubscribers: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    return getEmailSubscribers();
  }),

  getSubscriberCount: publicProcedure.query(async () => {
    return getSubscriberCount();
  }),

  // ── Flash sales (admin) ────────────────────────────────────────────────────

  createFlashSale: protectedProcedure
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