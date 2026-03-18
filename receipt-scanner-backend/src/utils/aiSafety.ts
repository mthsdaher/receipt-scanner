/**
 * AI call safety: timeout and retry.
 *
 * WHY AI MUST BE NON-CRITICAL IN FINANCIAL PIPELINES:
 * - OpenAI is an external dependency; outages must not block core flows.
 * - Receipt creation NEVER waits on AI (background jobs).
 * - RAG/Agent endpoints fail gracefully with clear errors.
 *
 * Production systems isolate external dependencies with timeouts and retries.
 */
import { env } from "../config/env";
import { getContextLogger } from "./requestContext";

const log = getContextLogger("ai_safety");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps a promise with a timeout. Rejects if the promise doesn't resolve in time.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`AI call timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);
}

/**
 * Executes an async AI operation with timeout and retry.
 * Logs failures and degraded mode.
 *
 * @param operation - Name for logging (e.g. "embedding", "categorization")
 * @param fn - The async operation to execute
 * @returns The result of fn()
 * @throws The last error after all retries exhausted
 */
export async function callWithAiSafety<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const timeoutMs = env.AI_TIMEOUT_MS;
  const maxRetries = env.AI_MAX_RETRIES;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await withTimeout(fn(), timeoutMs);
      if (attempt > 0) {
        log.info(
          { event: "ai_safety_retry_success", operation, attempt: attempt + 1 },
          "AI call succeeded after retry"
        );
      }
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      log.warn(
        {
          event: "ai_safety_failed",
          operation,
          attempt: attempt + 1,
          maxRetries,
          error: lastError.message,
        },
        "AI call failed (degraded mode)"
      );

      if (attempt < maxRetries) {
        const delayMs = 1000 * (attempt + 1);
        log.debug(
          { event: "ai_safety_retry_scheduled", operation, delayMs },
          "Retrying AI call"
        );
        await sleep(delayMs);
      }
    }
  }

  log.error(
    {
      event: "ai_safety_exhausted",
      operation,
      error: lastError?.message,
    },
    "AI call failed after all retries"
  );
  throw lastError ?? new Error("AI operation failed");
}
