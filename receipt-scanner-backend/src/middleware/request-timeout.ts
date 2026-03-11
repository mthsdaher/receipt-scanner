import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { appLogger } from "./logger";

/**
 * Enforces a maximum request lifetime to avoid hung connections.
 */
export const requestTimeout = (req: Request, res: Response, next: NextFunction): void => {
  res.setTimeout(env.REQUEST_TIMEOUT_MS, () => {
    if (res.headersSent) return;

    const requestId = req.requestId ?? "unknown";
    appLogger.warn("http_request_timed_out", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      timeoutMs: env.REQUEST_TIMEOUT_MS,
    });

    res.status(503).json({
      status: "error",
      code: "REQUEST_TIMEOUT",
      message: "Request timed out",
      requestId,
    });
  });

  next();
};

