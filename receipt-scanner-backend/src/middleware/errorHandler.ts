import { NextFunction, Request, Response } from "express";
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/AppError";
import { env } from "../config/env";
import { appLogger } from "./logger";

const getAppErrorCode = (error: AppError): string => {
  if (error instanceof BadRequestError) return "BAD_REQUEST";
  if (error instanceof UnauthorizedError) return "UNAUTHORIZED";
  if (error instanceof ForbiddenError) return "FORBIDDEN";
  if (error instanceof NotFoundError) return "NOT_FOUND";
  if (error instanceof ConflictError) return "CONFLICT";
  return "APP_ERROR";
};

/**
 * Centralized error handling middleware.
 *
 * Principles:
 * - Operational errors (AppError) return structured JSON with statusCode
 * - Programming errors (unexpected) return 500; details hidden in production
 * - Validation errors (express-validator) transformed to 400 with field details
 *
 * Placed last in middleware chain so any unhandled error bubbles here.
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.requestId ?? "unknown";
  const isProd = env.NODE_ENV === "production";

  // Known application errors
  if (err instanceof AppError) {
    appLogger.warn("http_request_failed", {
      requestId,
      path: req.originalUrl,
      method: req.method,
      statusCode: err.statusCode,
      code: getAppErrorCode(err),
      message: err.message,
    });

    res.status(err.statusCode).json({
      status: "error",
      code: getAppErrorCode(err),
      message: err.message,
      requestId,
    });
    return;
  }

  // express-validator validation errors
  if (
    err &&
    typeof err === "object" &&
    "array" in err &&
    typeof (err as { array: unknown }).array === "function"
  ) {
    const validationErr = err as { array: () => { msg: string; path: string }[] };
    const details = validationErr.array();

    appLogger.warn("http_request_failed_validation", {
      requestId,
      path: req.originalUrl,
      method: req.method,
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details,
    });

    res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details,
      requestId,
    });
    return;
  }

  // Unknown errors - do not leak internals in production
  const statusCode = 500;
  const message = isProd
    ? "Internal server error"
    : err instanceof Error
      ? err.message
      : "Unknown error";
  const details = !isProd && err instanceof Error ? { stack: err.stack } : undefined;

  appLogger.error("http_request_failed_unexpected", {
    requestId,
    path: req.originalUrl,
    method: req.method,
    statusCode,
    code: "INTERNAL_ERROR",
    message: err instanceof Error ? err.message : "Unknown error",
    ...(details ? { details } : {}),
  });

  res.status(statusCode).json({
    status: "error",
    code: "INTERNAL_ERROR",
    message,
    ...(details ? { details } : {}),
    requestId,
  });
};
