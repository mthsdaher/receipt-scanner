import { Router, Request, Response } from "express";
import { env } from "../config/env";
import { isDatabaseHealthy } from "../config/database";

const router = Router();
const startedAt = Date.now();

/**
 * Liveness: minimal check that the process is running.
 * Used by orchestrators (Kubernetes, Railway) to restart unhealthy containers.
 */
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    data: {
      service: "receipt-scanner-backend",
      env: env.NODE_ENV,
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    },
  });
});

/**
 * Readiness: checks if the service can accept traffic (e.g. DB connected).
 * Returns 503 if not ready so load balancers stop sending requests.
 */
router.get("/ready", async (_req: Request, res: Response) => {
  const dbHealthy = await isDatabaseHealthy();
  const statusCode = dbHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: dbHealthy ? "success" : "error",
    code: dbHealthy ? undefined : "SERVICE_UNAVAILABLE",
    message: dbHealthy ? "Service is ready" : "Service is not ready",
    data: {
      database: dbHealthy ? "up" : "down",
    },
  });
});

export default router;
