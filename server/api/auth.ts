import prisma from '~/utils/prisma';
import jwt from 'jsonwebtoken';
import app from 'server/router';
import { Hono } from 'hono';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';

// Helper for session creation (placeholder)
async function createUserSession(userId: string, redirectTo: string) {
  // Implement session logic here (e.g., set cookie)
  return { success: true, userId, redirectTo };
}

export const authRoute = new Hono()
  // POST /api/auth/register
  .post('/register', async (c) => {
    const { email, password, confirmPassword, name, role } = await c.req.json();
    if (!email || !password || !confirmPassword || !name || !role) {
      return c.json({ error: 'All fields are required' }, 400);
    }
    if (password !== confirmPassword) {
      return c.json({ error: 'Passwords do not match' }, 400);
    }
    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return c.json({ error: 'A user with this email already exists' }, 400);
      }
      const user = await prisma.user.create({ data: { email, password, name, role } });
      const session = await createUserSession(user.id, '/');
      return c.json({ success: true, user });
    } catch (error: any) {
      if (error.message && error.message.includes('Unique constraint')) {
        return c.json({ error: 'A user with this email already exists' }, 400);
      }
      return c.json({ error: 'An error occurred during registration' }, 500);
    }
  })
  // POST /api/auth/login
  .post('/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: 'Please provide both email and password' }, 400);
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }
    // Sign JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return c.json({ success: true, user, token });
  });
