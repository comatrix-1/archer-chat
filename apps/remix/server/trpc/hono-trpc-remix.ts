import { trpcServer } from '@hono/trpc-server';
import { createTrpcContext } from '@project/trpc/server/context';
import { appRouter } from '@project/trpc/server/router';

export const reactRouterTrpcServer = trpcServer({
  router: appRouter,
  endpoint: '/api/trpc',
  createContext: async (_, c) => {
    return createTrpcContext({ c, requestSource: 'apiV1' });
  },
  });