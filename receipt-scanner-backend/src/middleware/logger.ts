import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

declare module "express" {
  interface Request {
    requestId?: string;
  }
}

type LogLevel = "info" | "warn" | "error";

interface LogMeta {
  [key: string]: unknown;
}

const writeLog = (level: LogLevel, event: string, meta: LogMeta = {}): void => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...meta,
  };
  console.log(JSON.stringify(payload));
};

export const appLogger = {
  info: (event: string, meta?: LogMeta) => writeLog("info", event, meta),
  warn: (event: string, meta?: LogMeta) => writeLog("warn", event, meta),
  error: (event: string, meta?: LogMeta) => writeLog("error", event, meta),
};

const logger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const incomingRequestId = req.header("x-request-id");
  const requestId =
    incomingRequestId && incomingRequestId.trim().length > 0
      ? incomingRequestId.trim()
      : randomUUID();

  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  appLogger.info("http_request_started", {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  res.on("finish", () => {
    const durationMs = Date.now() - startTime;
    appLogger.info("http_request_finished", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      userId: req.currentUser?.id ?? null,
      userAgent: req.header("user-agent") ?? null,
    });
  });

  next();
};

export default logger;