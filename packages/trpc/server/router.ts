import { router } from './trpc';
import { apiTokenRouter } from './api-token-router/router';
import { testRouter } from './test-router/router';

export const appRouter = router({
  apiToken: apiTokenRouter,
  test: testRouter,
});

export type AppRouter = typeof appRouter;