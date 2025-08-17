import { router, publicProcedure, protectedProcedure } from "../trpc";

export const testRouter = router({
  // Public endpoint - no auth required
  publicHello: publicProcedure.query(() => ({
    message: "Hello from public endpoint!",
    timestamp: new Date().toISOString(),
  })),

  // Protected endpoint - requires authentication
  protectedHello: protectedProcedure.query(({ ctx }) => ({
    message: "Hello from protected endpoint!",
    userId: ctx.user?.id,
    timestamp: new Date().toISOString(),
  })),

  // Test endpoint that returns the current user's info
  getMe: protectedProcedure.query(({ ctx }) => ({
    user: ctx.user,
    timestamp: new Date().toISOString(),
  })),
});
