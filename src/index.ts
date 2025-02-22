import express, { Request, Response } from 'express';
import connectDB from './config/database';
import userRoutes from './routes/userRoutes';

// Initialize Express app
const app = express();
const port = 3002;

// Middleware to parse JSON requests
app.use(express.json());

// Mount user routes
app.use('/api/users', userRoutes);

// Test route
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Server is running!' });
});

// Function to start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    // Start the server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Run the server
startServer();