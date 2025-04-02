import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from './auth';
import articleRoutes from './articles';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());

// API routes group
const api = new Hono();

// Mount route groups
api.route('/auth', authRoutes);
api.route('/articles', articleRoutes);

// Mount all API routes under /api
app.route('/api', api);

export default app;
