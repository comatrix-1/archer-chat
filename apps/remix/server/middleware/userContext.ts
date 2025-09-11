import type { Context } from 'hono';

import prisma from "@project/remix/app/utils/prisma";
import { logger } from '@project/logging/src/index';

type UserWithPassword = {
  id: string;
  email: string;
  name: string | null;
  password: string;
};

export async function userContextMiddleware(c: Context, next: () => Promise<void>) {
  const payload = c.get("jwtPayload") as
    | { userId: string; iat?: number; exp?: number }
    | undefined;

  if (payload?.userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      }) as UserWithPassword | null;

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        c.set("user", userWithoutPassword);
      } else {
        logger.warn({ userId: payload.userId }, 'User not found for userId in JWT');
      }
    } catch (error) {
      logger.error({ error }, 'Error fetching user in userContextMiddleware');
    }
  } else {
    logger.warn('No userId found in JWT payload');
  }
  await next();
}
