import { Hono } from 'hono';
import { reactRouterTrpcServer } from './trpc/hono-trpc-remix';

export interface HonoEnv {
  Variables: {
    user?: { id: string };
  };
}

const app = new Hono<HonoEnv>();

app.use('*', async (c, next) => {
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  await next();
});

app.use('/api/trpc/*', reactRouterTrpcServer);

export default app;
