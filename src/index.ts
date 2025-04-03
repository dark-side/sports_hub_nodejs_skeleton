import { serve } from '@hono/node-server';
import { config } from 'dotenv';
import routes from './routes';
import { initializeDatabase } from './database/config';

// Load environment variables
config();

const port = process.env.PORT || 3000;

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');

    serve({
      fetch: routes.fetch,
      port: Number(port),
    });

    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
