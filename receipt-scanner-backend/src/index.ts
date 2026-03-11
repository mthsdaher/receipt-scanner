import { env } from "./config/env";
import express from "express";
import { Server } from "http";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { closeDB, connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import logger, { appLogger } from "./middleware/logger";
import { apiRateLimiter } from "./middleware/rate-limiters";
import userRoutes from "./routes/userRoutes";
import receiptRoutes from "./routes/receiptRoutes";
import ocrProxy from "./routes/ocrProxy";
import healthRoutes from "./routes/healthRoutes";

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
app.use(logger);

// Broad per-IP API rate limit.
app.use("/api", apiRateLimiter);

const openapiPath = path.resolve(__dirname, "openapi.json");
// eslint-disable-next-line @typescript-eslint/no-require-imports
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(require(openapiPath)));

app.use("/api/users", userRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/paddle", ocrProxy);
app.use("/", healthRoutes);

/** Centralized error handling - must be last */
app.use(errorHandler);

let server: Server | undefined;
let shuttingDown = false;

const gracefulShutdown = async (signal: string, exitCode: number): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;

  appLogger.warn("server_shutdown_started", { signal });

  try {
    await new Promise<void>((resolve, reject) => {
      if (!server) {
        resolve();
        return;
      }
      server.close((error?: Error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    await closeDB();
    appLogger.info("server_shutdown_completed", { signal });
    process.exit(exitCode);
  } catch (error) {
    appLogger.error("server_shutdown_failed", {
      signal,
      message: error instanceof Error ? error.message : "Unknown shutdown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
};

const registerProcessHandlers = (): void => {
  process.on("SIGINT", () => {
    void gracefulShutdown("SIGINT", 0);
  });
  process.on("SIGTERM", () => {
    void gracefulShutdown("SIGTERM", 0);
  });
  process.on("unhandledRejection", (reason) => {
    appLogger.error("process_unhandled_rejection", {
      message: reason instanceof Error ? reason.message : "Unhandled rejection",
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    void gracefulShutdown("unhandledRejection", 1);
  });
  process.on("uncaughtException", (error) => {
    appLogger.error("process_uncaught_exception", {
      message: error.message,
      stack: error.stack,
    });
    void gracefulShutdown("uncaughtException", 1);
  });
};

const bootstrap = async (): Promise<void> => {
  try {
    await connectDB();
    server = app.listen(env.PORT, () => {
      appLogger.info("server_started", {
        port: env.PORT,
        nodeEnv: env.NODE_ENV,
        docsPath: "/api-docs",
      });
    });
  } catch (err: unknown) {
    appLogger.error("server_startup_failed", {
      message: err instanceof Error ? err.message : "Failed to start server",
      stack: err instanceof Error ? err.stack : undefined,
    });
    process.exit(1);
  }
};

registerProcessHandlers();
void bootstrap();
