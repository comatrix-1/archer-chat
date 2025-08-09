import { router, protectedProcedure } from '../trpc';
import { getApiTokens, createApiToken, deleteTokenById } from './service';
import { ZCreateTokenMutationSchema, ZDeleteTokenMutationSchema } from './schema';
import type { ProtectedContext } from '../context';

export const apiTokenRouter = router({
  getTokens: protectedProcedure.query(async ({ ctx }: { ctx: ProtectedContext }) => {
    return await getApiTokens({
      userId: ctx.user.id,
      teamId: ctx.teamId,
    });
  }),

  createToken: protectedProcedure
    .input(ZCreateTokenMutationSchema)
    .mutation(async ({ input, ctx }: { input: { tokenName: string; teamId: string; expirationDate?: Date }; ctx: ProtectedContext }) => {
      const { tokenName, teamId } = input;
      const expiresIn = input.expirationDate
        ? input.expirationDate.getTime() - Date.now()
        : undefined;

      return await createApiToken({
        userId: ctx.user.id,
        teamId,
        tokenName,
        expiresIn,
      });
    }),

  deleteToken: protectedProcedure
    .input(ZDeleteTokenMutationSchema)
    .mutation(async ({ input, ctx }: { input: { id: string; teamId: string }; ctx: ProtectedContext }) => {
      return await deleteTokenById({
        id: input.id,
        teamId: input.teamId,
        userId: ctx.user.id,
      });
    }),
});

export type ApiTokenRouter = typeof apiTokenRouter;
