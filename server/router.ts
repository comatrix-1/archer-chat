import { Hono } from 'hono';
import { resumeRoute } from './api/resume';
import { authRoute } from './api/auth';

const app = new Hono();

// Mount your API routes
app.route('/api/auth', authRoute);
app.route('/api/resume', resumeRoute);

// You can add more routes here as needed

export default app;
