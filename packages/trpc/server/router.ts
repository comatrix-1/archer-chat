import { router } from './trpc';
import { apiTokenRouter } from './api-token-router/router';
import { testRouter } from './test-router/router';
import { resumeRouter } from './resume-router/router';
import { jobApplicationRouter } from './job-application-router/router';
import { aiRouter } from './ai-router/router';
import { authRouter } from './auth-router/router';

export const appRouter = router({
  auth: authRouter,
  apiToken: apiTokenRouter,
  test: testRouter,
  resume: resumeRouter,
  jobApplication: jobApplicationRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;