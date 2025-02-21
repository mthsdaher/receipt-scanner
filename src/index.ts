import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.use(express.json()); // for parsing application/json

// Start the Express server
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// Start the Express server
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});

