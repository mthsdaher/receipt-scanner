import express, { Request, Response, NextFunction } from 'express';
import connectDB from './config/database';
import userRoutes from './routes/userRoutes';
import receiptRoutes from './routes/receiptRoutes';
import logger from './middleware/logger';

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Apply middleware
app.use(logger); // Log requests
app.use(express.json()); // Parse JSON bodies
app.use('/api/users', userRoutes); // User routes
app.use('/api/receipts', receiptRoutes); // Receipt routes

// Optional: Simple global error-handling middleware for unhandled errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'An unexpected server error occurred',
  });
});

// Test route
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Server is running!' });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();