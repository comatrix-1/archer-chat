import { Hono } from "hono";
import { generateUUID } from "~/utils/security";
import { authRoute } from "./api/auth";
import { resumeRoute } from "./api/resume";
import type { RequestIdVariables } from 'hono/request-id';
import { reactRouterTrpcServer } from "./trpc/hono-trpc-remix";
import { appMiddleware } from "./middleware";

export interface HonoEnv {
  Variables: RequestIdVariables & {
    user: { id: string };
    jwtPayload: { userId: string;[key: string]: unknown };
  };
}

const app = new Hono<HonoEnv>();
app.use("*", async (c, next) => {
  c.header("X-Frame-Options", "DENY");
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'",
  );
  await next();
});
app.use("*", async (c, next) => {
  const csrfToken = generateUUID();
  c.header("X-CSRF-Token", csrfToken);
  c.header("Set-Cookie", `csrfToken=${csrfToken}; Path=/; SameSite=Strict`);
  await next();
});
app.use('*', appMiddleware);
app.route("/api/auth", authRoute);
app.route("/api/resume", resumeRoute);
app.use('/api/trpc/*', reactRouterTrpcServer);

export default app;
