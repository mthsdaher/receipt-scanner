// src/index.ts
import express from 'express';
import userRoutes from './routes/userRoutes';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import 'dotenv/config'; // Load environment variables

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve Swagger UI
const openapiPath = path.resolve(__dirname, 'openapi.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(require(openapiPath)));

// Mount user routes
app.use('/api/users', userRoutes);

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});