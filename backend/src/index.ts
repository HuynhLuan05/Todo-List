import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import todoRouter from './routes/todo.routes';
import { errorHandler } from './middlewares/error.middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start the Server
app.listen(PORT, () => {
  console.log(`[Server]: Backend running on http://localhost:${PORT}`);
  console.log(`[Server]: Health check available at http://localhost:${PORT}/health`);
});
