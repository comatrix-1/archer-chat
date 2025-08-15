import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { TSignInSchema, TSignUpSchema } from './schema';
import { authService } from './service';

export const authRouter = router({
  signIn: publicProcedure
    .input(TSignInSchema)
    .mutation(async ({ ctx, input }) => {
      // Call your existing auth service
      return await authService.signIn(input);
    }),

  signUp: publicProcedure
    .input(TSignUpSchema)
    .mutation(async ({ ctx, input }) => {
      return await authService.signUp(input);
    }),
});