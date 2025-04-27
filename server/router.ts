import { Hono } from 'hono';
import { profileRoute } from './api/profile';
import { authRoute } from './api/auth';
import { resumeRoute } from './api/resume';

const app = new Hono();

// Mount your API routes
app.route('/api/profile', profileRoute);
app.route('/api/auth', authRoute);
app.route('/api/resume', resumeRoute);

// You can add more routes here as needed

export default app;
