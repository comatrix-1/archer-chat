import { initTRPC, TRPCError } from "@trpc/server";
import type { BaseContext, ProtectedContext, Context } from "./context";

// Initialize tRPC with base context type
const t = initTRPC.context<Context>().create();

// Middleware for protected procedures
const isAuthed = t.middleware(async ({ ctx, next }) => {
  console.log("middleware ctx.user: ", ctx.user);
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Create a new context with the required properties for protected procedures
  const protectedCtx: ProtectedContext = {
    ...ctx,
    user: ctx.user,
  };

  return next({
    ctx: protectedCtx,
  });
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

export type { Context, BaseContext, ProtectedContext };
