import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { initializeDatabase } from './database/config';
import articlesRoutes from './routes/articles';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Simple test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Debug routes
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/v1/articles', articlesRoutes);

// Initialize database and start server
initializeDatabase()
  .then(() => {
    console.log('Database connection established successfully');

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API Documentation: http://localhost:${port}/api-docs`);
      console.log(`Articles endpoint: http://localhost:${port}/api/v1/articles`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
