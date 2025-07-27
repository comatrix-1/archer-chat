import type { MiddlewareHandler } from 'hono';
import { getIpAddress } from './utils/get-ip-address';

export type AppContext = {
    user: { id: string; email: string } | null;
    requestMetadata: {
        ipAddress: string;
        userAgent: string;
    };
};

export const appContext: MiddlewareHandler<{ Variables: { context: AppContext } }> = async (c, next) => {
    const ip = getIpAddress(c.req.raw);
    const userAgent = c.req.header('user-agent') ?? '';

    c.set('context', {
        user: null, // replace with real session auth later
        requestMetadata: { ipAddress: ip, userAgent },
    });

    await next();
};
