import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { stripeRouter } from "./routers/stripe";
import { filesRouter } from "./routers/files";
import { reviewsRouter } from "./routers/reviews";
import { wishlistRouter } from "./routers/wishlist";
import { flashSalesRouter } from "./routers/flashSales";
import { agentRouter } from "./routers/agent";
import { abandonedCartRouter } from "./routers/abandonedCart";
import { loyaltyRouter } from "./routers/loyalty";
import { referralRouter } from "./routers/referral";
import { marketingRouter } from "./routers/marketing";
import { pinterestRouter } from "./routers/pinterest";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  stripe: stripeRouter,
  files: filesRouter,
  reviews: reviewsRouter,
  wishlist: wishlistRouter,
  flashSales: flashSalesRouter,
  agent: agentRouter,
  abandonedCart: abandonedCartRouter,
  loyalty: loyaltyRouter,
  referral: referralRouter,
  marketing: marketingRouter,
  pinterest: pinterestRouter,
});

export type AppRouter = typeof appRouter;
