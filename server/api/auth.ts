import bcrypt from "bcrypt";
import { Hono } from "hono";
import jwt from "jsonwebtoken";
import prisma from "~/utils/prisma";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "server/config/secrets";

const createTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET!, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret) as { userId: string };
  } catch (error) {
    return null;
  }
};

export const authRoute = new Hono()
  .get("/check-csrf", async (c) => {
    return c.json({ success: true });
  })
  .post("/register", async (c) => {
    try {
      const { email, password, confirmPassword, name } = await c.req.json();
      if (!email || !password || !confirmPassword || !name) {
        return c.json({ error: "All fields are required" }, 400);
      }
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return c.json({ error: "Email already exists" }, 400);
      }
      const user = await prisma.user.create({
        data: {
          email,
          password: await bcrypt.hash(password, 10),
          name,
          role: "JOBSEEKER",
        },
      });
      const { accessToken, refreshToken } = createTokens(user.id);
      c.header(
        "Set-Cookie",
        `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${
          60 * 60 * 24 * 7
        }; SameSite=Lax; Secure`
      );
      return c.json({
        success: true,
        user: { ...user, password: undefined },
        accessToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return c.json({ error: "Failed to register user" }, 500);
    }
  })
  .post("/login", async (c) => {
    try {
      const { email, password } = await c.req.json();
      if (!email || !password) {
        return c.json({ error: "Email and password are required" }, 400);
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return c.json({ error: "Invalid credentials" }, 401);
      }
      const { accessToken, refreshToken } = createTokens(user.id);
      c.header(
        "Set-Cookie",
        `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${
          60 * 60 * 24 * 7
        }; SameSite=Lax; Secure`
      );
      return c.json({
        success: true,
        user: { ...user, password: undefined },
        accessToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      return c.json({ error: "Failed to login" }, 500);
    }
  })
  .post("/refresh", async (c) => {
    try {
      const refreshToken = c.req
        .header("Cookie")
        ?.split(";")
        .find((cookie) => cookie.trim().startsWith("refreshToken="))
        ?.split("=")[1];
      if (!refreshToken) {
        return c.json({ error: "No refresh token provided" }, 401);
      }
      const decoded = verifyToken(refreshToken, REFRESH_TOKEN_SECRET!);
      if (!decoded) {
        return c.json({ error: "Invalid refresh token" }, 401);
      }
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) {
        return c.json({ error: "User not found" }, 401);
      }
      const { accessToken } = createTokens(user.id);
      return c.json({
        success: true,
        user: { ...user, password: undefined },
        accessToken,
      });
    } catch (error) {
      console.error("Refresh error:", error);
      return c.json({ error: "Failed to refresh token" }, 500);
    }
  })
  .post("/logout", async (c) => {
    c.header(
      "Set-Cookie",
      "refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure"
    );
    return c.json({ success: true });
  });
