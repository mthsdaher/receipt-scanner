import { getContextLogger } from "./requestContext";

type AiOperation =
  | "embedding"
  | "rag_query"
  | "agent_chat"
  | "categorization";

interface AiLogMeta {
  operation: AiOperation;
  userId?: string;
  durationMs?: number;
  success: boolean;
  error?: string;
  sourcesCount?: number;
  toolCalls?: number;
}

/**
 * Logs AI operations for monitoring and debugging.
 * Uses request context when available (adds requestId for tracing).
 */
export function logAiOperation(meta: AiLogMeta): void {
  const log = getContextLogger("ai");
  const event = meta.success ? "ai_operation_success" : "ai_operation_failed";
  const logMeta = { event, ...meta };
  if (meta.success) {
    log.info(logMeta, event);
  } else {
    log.warn(logMeta, event);
  }
}

/**
 * Wraps an async function and logs duration + success/failure.
 */
export async function withAiLogging<T>(
  operation: AiOperation,
  fn: () => Promise<T>,
  meta?: { userId?: string; sourcesCount?: number; toolCalls?: number }
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    logAiOperation({
      operation,
      ...meta,
      durationMs: Date.now() - start,
      success: true,
    });
    return result;
  } catch (err) {
    logAiOperation({
      operation,
      ...meta,
      durationMs: Date.now() - start,
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
