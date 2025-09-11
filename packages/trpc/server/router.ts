import { router } from './trpc';
import { testRouter } from './test-router/router';
import { resumeRouter } from './resume-router/router';
import { jobApplicationRouter } from './job-application-router/router';
import { aiRouter } from './ai-router/router';

export const appRouter = router({
  test: testRouter,
  resume: resumeRouter,
  jobApplication: jobApplicationRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;