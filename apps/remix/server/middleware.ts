import { rateLimiter } from 'hono-rate-limiter';

export const rateLimitMiddleware = rateLimiter({
    windowMs: 60 * 1000,
    limit: 60,
    keyGenerator: (c) => c.req.header('x-forwarded-for') || 'unknown',
    message: { error: 'Too many requests' },
});