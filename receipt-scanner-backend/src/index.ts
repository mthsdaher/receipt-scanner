import { env } from "./config/env";
import { Server } from "http";
import { closeDB, connectDB } from "./config/database";
import app from "./app";
import { appLogger } from "./middleware/logger";

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
