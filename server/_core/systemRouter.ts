/**
 * System router — health check and app info.
 * Replaces the Manus-provided systemRouter.
 */

import { publicProcedure, router } from "./trpc";

export const systemRouter = router({
  health: publicProcedure.query(() => ({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })),
});
