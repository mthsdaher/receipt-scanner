/**
 * DuplicateDetectionService - Prevents duplicate receipts.
 *
 * WHY IDEMPOTENCY MATTERS (Fintech):
 * - Retries (network failures, timeouts) must not create duplicate transactions.
 * - Stripe, PayPal use idempotency keys: same key within TTL = same result.
 * - Real-world: user double-clicks "Submit", payment gateway retries - one receipt only.
 *
 * Duplicate strategy: same userId + amount (within tolerance) + date (within window) + similar description.
 */
import * as receiptDb from "../db/receipts";
import { env } from "../config/env";
import type { ReceiptDto } from "../dtos/receipt";

/** Normalize description for comparison: trim, lowercase, collapse whitespace */
function normalizeDescription(description: string): string {
  return description
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Checks idempotency key first. If valid key provided and we find existing receipt, return it.
 */
export async function findExistingByIdempotencyKey(
  rawKey: string,
  userId: string
): Promise<ReceiptDto | null> {
  if (!rawKey || rawKey.trim().length === 0) return null;

  const keyHash = receiptDb.hashIdempotencyKey(rawKey);
  const receipt = await receiptDb.findReceiptByIdempotencyKey(
    keyHash,
    userId,
    env.IDEMPOTENCY_KEY_TTL_HOURS
  );
  return receipt as ReceiptDto | null;
}

/**
 * Checks for potential duplicate by content (userId, amount, date, description).
 * Returns existing receipt if found.
 */
export async function findPotentialDuplicate(
  userId: string,
  amount: number,
  date: Date,
  description: string
): Promise<ReceiptDto | null> {
  const normalized = normalizeDescription(description);
  const receipt = await receiptDb.findPotentialDuplicateReceipt(
    userId,
    amount,
    date,
    normalized,
    env.DUPLICATE_AMOUNT_TOLERANCE,
    env.DUPLICATE_DATE_WINDOW_HOURS
  );
  return receipt as ReceiptDto | null;
}
