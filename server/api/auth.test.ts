import bcrypt from "bcrypt";
import { Hono } from "hono";
import { authRoute } from "server/api/auth";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import prisma from "~/utils/prisma";

process.env.JWT_SECRET = "test-jwt-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";

describe("Auth API Tests", () => {
  let app: Hono;
  let testUser: any;
  const testEmail = "test@example.com";
  const testPassword = "password123";
  const testName = "Test User";
  beforeAll(async () => {
    app = new Hono();
    app.route("/auth", authRoute);
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    testUser = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: testName,
        role: "JOBSEEKER",
      },
    });
  });
  afterAll(async () => {
    await prisma.user.delete({
      where: {
        id: testUser.id,
      },
    });
    await prisma.$disconnect();
  });
  describe("POST /auth/register", () => {
    test("should register a new user", async () => {
      const newUserEmail = "newuser@example.com";
      const response = await app.request("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: "newpassword",
          confirmPassword: "newpassword",
          name: "New User",
        }),
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.user.email).toBe(newUserEmail);
      await prisma.user.delete({ where: { email: newUserEmail } });
    });
    test("should return an error if email already exists", async () => {
      const response = await app.request("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: "anotherpassword",
          confirmPassword: "anotherpassword",
          name: "Another User",
        }),
      });
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Email already exists");
    });
    test("should return an error if any required field is missing", async () => {
      const response = await app.request("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "missingfield@example.com",
          password: "password",
          name: "Missing Field User",
        }),
      });
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("All fields are required");
    });
  });
  describe("POST /auth/login", () => {
    test("should login an existing user", async () => {
      const response = await app.request("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.user.email).toBe(testEmail);
      expect(body).toHaveProperty("accessToken");
      expect(response.headers.get("Set-Cookie")).toContain("refreshToken");
    });
    test("should return an error for invalid credentials", async () => {
      const response = await app.request("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: "wrongpassword",
        }),
      });
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Invalid credentials");
    });
    test("should return an error if email or password is missing", async () => {
      const response = await app.request("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
        }),
      });
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe("Email and password are required");
    });
  });
  describe("POST /auth/refresh", () => {
    test("should refresh the access token", async () => {
      const loginResponse = await app.request("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });
      expect(loginResponse.status).toBe(200);
      const loginBody = await loginResponse.json();
      expect(loginBody.success).toBe(true);
      const refreshToken = loginResponse.headers
        .get("Set-Cookie")
        ?.split(";")
        .find((cookie) => cookie.trim().startsWith("refreshToken="))
        ?.split("=")[1];
      expect(refreshToken).toBeDefined();
      const refreshResponse = await app.request("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refreshToken=${refreshToken}`,
        },
      });
      expect(refreshResponse.status).toBe(200);
      const refreshBody = await refreshResponse.json();
      expect(refreshBody.success).toBe(true);
      expect(refreshBody).toHaveProperty("accessToken");
    });
    test("should return an error if no refresh token is provided", async () => {
      const response = await app.request("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("No refresh token provided");
    });
    test("should return an error for an invalid refresh token", async () => {
      const response = await app.request("/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "refreshToken=invalid_refresh_token",
        },
      });
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe("Invalid refresh token");
    });
  });
  describe("POST /auth/logout", () => {
    test("should clear the refreshToken cookie on logout", async () => {
      const response = await app.request("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      expect(response.status).toBe(200);
      expect(response.headers.get("Set-Cookie")).toContain(
        "refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure"
      );
    });
  });
});
