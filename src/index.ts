import express, { Request, Response } from 'express';
import connectDB from './config/database';

const app = express();
const port = 3000;

app.use(express.json()); // for parsing application/json

// Start the Express server
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Server working!' });
});

// Inicianting MongoDB connection and starting the server
const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });
}

startServer();