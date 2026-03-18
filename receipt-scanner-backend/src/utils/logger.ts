/**
 * Structured logging with Pino.
 *
 * Why Pino?
 * - Fast: minimal overhead, async by default
 * - JSON: machine-parseable for log aggregators (Datadog, ELK, CloudWatch)
 * - Child loggers: add requestId/context without repeating
 *
 * Observability in production:
 * - Logs feed into monitoring (errors, latency, throughput)
 * - Request IDs enable tracing across services
 * - Structured fields enable filtering and alerting
 */

import pino from "pino";
import { env } from "../config/env";

const isProd = env.NODE_ENV === "production";

/**
 * Base logger. Use child() to create request-scoped loggers with requestId.
 * Output is always JSON; pipe to `pino-pretty` for human-readable dev logs.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Creates a child logger with bound context (e.g. requestId, userId).
 * Use for request-scoped logging so all logs in a request share the same context.
 */
export function createRequestLogger(context: {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}) {
  return logger.child(context);
}

/**
 * Application-level logger for non-request events (startup, cron, etc.)
 */
export const appLogger = logger.child({ component: "app" });
