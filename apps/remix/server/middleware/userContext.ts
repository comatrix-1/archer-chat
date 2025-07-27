import type { Context, Next } from "hono";
import prisma from "@project/remix/app/utils/prisma";

export async function userContextMiddleware(c: Context, next: Next) {
  const payload = c.get("jwtPayload") as
    | { userId: string; iat?: number; exp?: number }
    | undefined;

  if (payload?.userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (user) {
        const { password, ...userWithoutPassword } = user;
        c.set("user", userWithoutPassword);
      } else {
        console.warn(`User not found for userId in JWT: ${payload.userId}`);
      }
    } catch (error) {
      console.error("Error fetching user in userContextMiddleware:", error);
    }
  } else {
    console.warn("No userId found in JWT payload");
  }
  await next();
}
