import { env } from "./config/env";
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { apiRateLimiter } from "./middleware/rate-limiters";
import userRoutes from "./routes/userRoutes";
import receiptRoutes from "./routes/receiptRoutes";
import ocrProxy from "./routes/ocrProxy";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// Security headers baseline hardening.
app.use(helmet());

// Global payload limits to reduce request amplification abuse.
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Broad per-IP API rate limit.
app.use("/api", apiRateLimiter);

const openapiPath = path.resolve(__dirname, "openapi.json");
// eslint-disable-next-line @typescript-eslint/no-require-imports
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(require(openapiPath)));

app.use("/api/users", userRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/paddle", ocrProxy);

/** Centralized error handling - must be last */
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Swagger UI available at /api-docs`);
    });
  })
  .catch((err: unknown) => {
    console.error("Failed to start server:", err);
  });
