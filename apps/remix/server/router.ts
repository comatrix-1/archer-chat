import { Hono } from "hono";
import { generateUUID } from "~/utils/security";
import { authRoute } from "./api/auth";
import { resumeRoute } from "./api/resume-basic";

const app = new Hono();
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
app.route("/api/auth", authRoute);
app.route("/api/resume", resumeRoute);

export default app;
