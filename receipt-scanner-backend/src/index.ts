import express from 'express';
import userRoutes from './routes/userRoutes';
import receiptRoutes from './routes/userRoutes';
import swaggerUi from 'swagger-ui-express';
import path from 'path';  
import cors from 'cors';
import 'dotenv/config'; 

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // allow requests from the frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // allow these HTTP methods
  credentials: true, // allow cookies or credentials if needed
}));

// middleware to parse JSON bodies
app.use(express.json());

// Serve Swagger UI
const openapiPath = path.resolve(__dirname, 'openapi.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(require(openapiPath)));

// Mount user routes
app.use('/api/users', userRoutes);

app.use('/api/receipts', receiptRoutes);

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});