import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import prisma from '~/utils/prisma';
import { generateUUID } from '~/utils/security';
import bcrypt from 'bcrypt';
import type { Context } from 'hono';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_secret_here';

// Helper functions
const createTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret) as { userId: string };
  } catch (error) {
    return null;
  }
};

// Middleware for token validation
const validateToken = async (c: Context) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token, JWT_SECRET);
  
  if (!decoded) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  c.set('userId', decoded.userId);
  return true;
};

export const authRoute = new Hono()
  // GET /api/auth/check-csrf - Endpoint to get CSRF token
  .get('/check-csrf', async (c) => {
    // This endpoint just returns success - the CSRF token will be set by the middleware
    return c.json({ success: true });
  })

  // POST /api/auth/register
  .post('/register', async (c) => {
    try {
      const { email, password, confirmPassword, name, role } = await c.req.json();
      if (!email || !password || !confirmPassword || !name || !role) {
        return c.json({ error: 'All fields are required' }, 400);
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return c.json({ error: 'Email already exists' }, 400);
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: await bcrypt.hash(password, 10),
          name,
          role,
        },
      });

      const { accessToken, refreshToken } = createTokens(user.id);
      
      // Set refresh token as HTTP-only cookie
      c.header('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}`);
      
      return c.json({ success: true, user: { ...user, password: undefined }, accessToken });
    } catch (error) {
      console.error('Registration error:', error);
      return c.json({ error: 'Failed to register user' }, 500);
    }
  })

  // POST /api/auth/login
  .post('/login', async (c) => {
    try {
      const { email, password } = await c.req.json();
      if (!email || !password) {
        return c.json({ error: 'Email and password are required' }, 400);
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      const { accessToken, refreshToken } = createTokens(user.id);
      
      // Set refresh token as HTTP-only cookie
      c.header('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}`);
      
      return c.json({ success: true, user: { ...user, password: undefined }, accessToken });
    } catch (error) {
      console.error('Login error:', error);
      return c.json({ error: 'Failed to login' }, 500);
    }
  })

  // POST /api/auth/refresh
  .post('/refresh', async (c) => {
    try {
      const refreshToken = c.req.header('Cookie')?.split(';')
        .find(cookie => cookie.trim().startsWith('refreshToken='))
        ?.split('=')[1];

      if (!refreshToken) {
        return c.json({ error: 'No refresh token provided' }, 401);
      }

      const decoded = verifyToken(refreshToken, REFRESH_TOKEN_SECRET);
      if (!decoded) {
        return c.json({ error: 'Invalid refresh token' }, 401);
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        return c.json({ error: 'User not found' }, 401);
      }

      const { accessToken } = createTokens(user.id);
      return c.json({ success: true, user: { ...user, password: undefined }, accessToken });
    } catch (error) {
      console.error('Refresh error:', error);
      return c.json({ error: 'Failed to refresh token' }, 500);
    }
  })

  // POST /api/auth/logout
  .post('/logout', async (c) => {
    // Clear refresh token cookie
    c.header('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0');
    return c.json({ success: true });
  });
