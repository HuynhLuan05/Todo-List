import express from 'express';
import cors from 'cors';
import todoRouter from './routes/todo.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// Enable CORS
app.use(cors());

// Enable parsing JSON request bodies
app.use(express.json());

// API Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Register API Routes
app.use('/api/v1/todos', todoRouter);

// Global Error Handler (must be registered last)
app.use(errorHandler);

export default app;
