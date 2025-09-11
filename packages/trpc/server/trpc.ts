import { initTRPC, TRPCError } from "@trpc/server";
import superjson from 'superjson';
import {
  type BaseContext,
  type Context,
  type ProtectedContext
} from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});
const { createCallerFactory } = t;

const isAuthed = t.middleware(async ({ ctx, next }) => {
  console.log("middleware ctx.user: ", ctx.user);
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const protectedCtx: ProtectedContext = {
    ...ctx,
    user: ctx.user,
  };

  return next({
    ctx: protectedCtx,
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);

export type { BaseContext, Context, ProtectedContext };