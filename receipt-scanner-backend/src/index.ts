import express from "express";
import userRoutes from "./routes/userRoutes";
import receiptRoutes from "./routes/receiptRoutes";
import swaggerUi from "swagger-ui-express";
import path from "path";
import cors from "cors";
import connectDB from "./config/database";
import ocrProxy from "./routes/ocrProxy"; // Import the OCR proxy routes
import { env } from "./config/env";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // allow these HTTP methods
    credentials: true, // allow cookies or credentials if needed
  })
);

// middleware to parse JSON bodies
app.use(express.json());

// Serve Swagger UI
const openapiPath = path.resolve(__dirname, "openapi.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(require(openapiPath)));

// Mount user routes
app.use("/api/users", userRoutes);

app.use("/api/receipts", receiptRoutes);

// Mount OCR proxy routes
app.use("/api/paddle", ocrProxy);

// Start the server
connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Swagger UI available at /api-docs`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });
