import { Hono } from 'hono';
import { profileRoute } from './api/profile';

const app = new Hono();

// Mount your API routes
app.route('/api/profile', profileRoute);

// You can add more routes here as needed

export default app;
