/**
 * HTTP request logging middleware.
 *
 * Logs:
 * - Incoming request (method, path, ip)
 * - Completed request (statusCode, durationMs, userId)
 *
 * Attaches requestId to req and runs the rest of the chain within AsyncLocalStorage
 * so services can access requestId via getContextLogger().
 */

import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { appLogger, createRequestLogger } from "../utils/logger";
import { runWithContext } from "../utils/requestContext";

export { appLogger };

const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const incomingRequestId = req.header("x-request-id");
  const requestId =
    incomingRequestId && incomingRequestId.trim().length > 0
      ? incomingRequestId.trim()
      : randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  const reqLogger = createRequestLogger({
    requestId,
    component: "http",
  });

  reqLogger.info(
    {
      event: "http_request_started",
      method: req.method,
      path: req.originalUrl,
      ip: req.ip,
    },
    "Request started"
  );

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    reqLogger.info(
      {
        event: "http_request_finished",
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs,
        userId: req.currentUser?.id ?? null,
        userAgent: req.header("user-agent") ?? null,
      },
      "Request finished"
    );
  });

  // Run rest of chain within request context so services get requestId
  runWithContext({ requestId }, () => next());
};

export default loggerMiddleware;
