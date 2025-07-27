import { Hono } from 'hono';
import { z } from 'zod';

const resumeRoute = new Hono();

const resumeSchema = z.object({
    name: z.string(),
    summary: z.string(),
    experiences: z.array(z.object({
        company: z.string(),
        role: z.string(),
        duration: z.string(),
    })),
});

let mockDB = {
    resume: null as any,
};

resumeRoute.get('/', (c) => {
    return c.json({ resume: mockDB.resume || null });
});

resumeRoute.post('/', async (c) => {
    const body = await c.req.json();
    const parsed = resumeSchema.safeParse(body);

    if (!parsed.success) {
        return c.json({ error: 'Invalid resume format', issues: parsed.error.format() }, 400);
    }

    mockDB.resume = parsed.data;

    return c.json({ message: 'Resume saved', resume: mockDB.resume });
});

export { resumeRoute };
