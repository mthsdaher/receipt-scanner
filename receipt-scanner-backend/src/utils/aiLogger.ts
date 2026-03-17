import { appLogger } from "../middleware/logger";

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
 * Use for RAG, agent, categorization, and embedding flows.
 */
export function logAiOperation(meta: AiLogMeta): void {
  const event = meta.success ? "ai_operation_success" : "ai_operation_failed";
  const logMeta: Record<string, unknown> = { ...meta };
  if (meta.success) {
    appLogger.info(event, logMeta);
  } else {
    appLogger.warn(event, logMeta);
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
