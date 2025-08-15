import { router } from './trpc';
import { apiTokenRouter } from './api-token-router/router';
import { testRouter } from './test-router/router';
import { resumeRouter } from './resume-router/router';

export const appRouter = router({
  apiToken: apiTokenRouter,
  test: testRouter,
  resume: resumeRouter,
});

export type AppRouter = typeof appRouter;