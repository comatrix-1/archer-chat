import { Hono } from 'hono';
import prisma from '../../app/utils/prisma';

export const profileRoute = new Hono()
  // GET /api/profile?email=...
  .get(async (c) => {
    const email = c.req.query('email');
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }
    const profile = await prisma.profile.findUnique({ where: { email } });
    if (!profile) return c.json({ error: 'Profile not found' }, 404);
    return c.json(profile);
  })
  // POST /api/profile
  .post(async (c) => {
    const { email, name, role } = await c.req.json();
    if (!email || !name || !role) {
      return c.json({ error: 'Missing fields' }, 400);
    }
    const profile = await prisma.profile.create({ data: { email, name, role } });
    return c.json(profile, 201);
  })
  // PUT /api/profile
  .put(async (c) => {
    const { id, name, role } = await c.req.json();
    if (!id) return c.json({ error: 'ID is required' }, 400);
    const updated = await prisma.profile.update({ where: { id }, data: { name, role } });
    return c.json(updated);
  });

export default profileRoute;
