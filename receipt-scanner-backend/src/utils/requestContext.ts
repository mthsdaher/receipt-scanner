/**
 * Request context propagation via AsyncLocalStorage.
 *
 * WHY: In financial systems, every log must be traceable to a request.
 * Correlation ID (requestId) enables:
 * - Debugging: grep logs by requestId to see full request flow
 * - Auditing: trace who did what and when
 * - Distributed tracing: same ID across services (future)
 *
 * Services don't receive req - they get requestId from this context.
 */
import { AsyncLocalStorage } from "async_hooks";
import { createRequestLogger, logger } from "./logger";

export interface RequestContext {
  requestId: string;
  userId?: string;
}

const requestStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Runs the given callback within the request context.
 * Call from the first middleware that has requestId.
 */
export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return requestStorage.run(context, fn);
}

/**
 * Gets the current request context, or undefined if not in a request.
 */
export function getRequestContext(): RequestContext | undefined {
  return requestStorage.getStore();
}

/**
 * Updates the request context with userId. Call from auth middleware after setting req.currentUser.
 */
export function setRequestContextUserId(userId: string | undefined): void {
  const store = requestStorage.getStore();
  if (store) {
    store.userId = userId;
  }
}

/**
 * Gets a logger with requestId (and userId if available) from the current context.
 * Use in services that don't have access to req.
 * Falls back to component-scoped logger if no context (e.g. background jobs).
 */
export function getContextLogger(component: string) {
  const ctx = getRequestContext();
  if (ctx) {
    return createRequestLogger({
      requestId: ctx.requestId,
      userId: ctx.userId,
      component,
    });
  }
  return logger.child({ component });
}
