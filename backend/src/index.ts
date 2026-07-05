import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start the Server
app.listen(PORT, () => {
  console.log(`[Server]: Backend running on http://localhost:${PORT}`);
  console.log(`[Server]: Health check available at http://localhost:${PORT}/health`);
});
