import { Hono } from 'hono';
import { reactRouterTrpcServer } from './trpc/hono-trpc-remix';
import { logger } from '@project/logging/src/index';
export interface HonoEnv {
  Variables: {
    user?: { id: string };
    requestId: string;
  };
}

const app = new Hono<HonoEnv>();

// Helper to extract request ID from headers
function getRequestId(headers: Headers): string {
  return headers.get('x-request-id') || Math.random().toString(36).substring(2, 10);
}

// Request logging middleware
app.use('*', async (c, next) => {
  const requestId = getRequestId(c.req.raw.headers);
  c.set('requestId', requestId);

  // Add security headers
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Request-ID', requestId);

  const startTime = Date.now();

  // Log request
  logger.info({
    type: 'request',
    method: c.req.method,
    path: c.req.path,
    requestId,
  }, 'Request received');

  try {
    await next();

    // Log successful response
    const responseTime = Date.now() - startTime;
    logger.info({
      type: 'response',
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      responseTime: `${responseTime}ms`,
      requestId,
    }, 'Request completed');

  } catch (error) {
    // Log error with request context
    logger.error({
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      requestId,
      path: c.req.path,
      method: c.req.method,
    }, 'Request failed');

    // Re-throw to let error boundaries handle it
    throw error;
  }
});

// TRPC routes
app.use('/api/trpc/*', reactRouterTrpcServer);

// Global error handler
app.onError((error, c) => {
  const requestId = c.get('requestId') || 'unknown';
  const statusCode = 'status' in error ? (error.status as number) : 500;

  logger.error({
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error,
    requestId,
    path: c.req.path,
    method: c.req.method,
  }, 'Request failed');

  return new Response(
    JSON.stringify({
      success: false,
      error: 'Internal Server Error',
      requestId,
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
});

export default app;
