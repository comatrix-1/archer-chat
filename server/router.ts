import { Hono } from 'hono';
import { profileRoute } from './api/profile';
import { authRoute } from './api/auth';

const app = new Hono();

// Mount your API routes
app.route('/api/profile', profileRoute);
app.route('/api/auth', authRoute);

// You can add more routes here as needed

export default app;
