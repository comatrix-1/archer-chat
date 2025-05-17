import { Hono } from 'hono';
import { resumeRoute } from './api/resume';
import { authRoute } from './api/auth';
import { generateUUID } from '~/utils/security';

const app = new Hono();

// Security headers middleware
app.use('*', async (c, next) => {
  c.header('X-Frame-Options', 'DENY');
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'");
  await next();
});

// CSRF protection middleware
app.use('*', async (c, next) => {
  const csrfToken = generateUUID();
  c.header('X-CSRF-Token', csrfToken);
  // Set CSRF token in a cookie that's accessible to JavaScript
  c.header('Set-Cookie', `csrfToken=${csrfToken}; Path=/; SameSite=Strict`);
  await next();
});

// Mount your API routes
app.route('/api/auth', authRoute);
app.route('/api/resume', resumeRoute);

// You can add more routes here as needed

export default app;
