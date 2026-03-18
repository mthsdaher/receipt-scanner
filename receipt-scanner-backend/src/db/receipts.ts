import { createHash } from "crypto";
import pool from "../config/database";

/** Hash idempotency key for storage (privacy, avoid long strings) */
export function hashIdempotencyKey(rawKey: string): string {
  return createHash("sha256").update(rawKey.trim()).digest("hex");
}

export interface ReceiptRow {
  id: string;
  user_id: string;
  amount: number;
  date: Date;
  description: string;
  category?: string;
  categorization_reasoning?: string;
  subtotal?: number;
  tax?: number;
  validation_status?: string;
  validation_reason?: string;
  idempotency_key_hash?: string;
  created_at: Date;
  updated_at: Date;
}

function rowToReceipt(row: ReceiptRow) {
  return {
    id: row.id,
    userId: row.user_id,
    amount: Number(row.amount),
    date: row.date,
    description: row.description,
    category: row.category ?? undefined,
    categorizationReasoning: row.categorization_reasoning ?? undefined,
    subtotal: row.subtotal != null ? Number(row.subtotal) : undefined,
    tax: row.tax != null ? Number(row.tax) : undefined,
    validationStatus: (row.validation_status ?? "not_validated") as "valid" | "invalid" | "not_validated",
    validationReason: row.validation_reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createReceipt(data: {
  userId: string;
  amount: number;
  date: Date;
  description: string;
  category?: string;
  subtotal?: number;
  tax?: number;
  validation_status: string;
  validation_reason?: string;
  idempotency_key_hash?: string;
}) {
  const res = await pool.query<ReceiptRow>(
    `INSERT INTO receipts (user_id, amount, date, description, category, subtotal, tax, validation_status, validation_reason, idempotency_key_hash)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      data.userId,
      data.amount,
      data.date,
      data.description.trim(),
      data.category?.trim() ?? null,
      data.subtotal ?? null,
      data.tax ?? null,
      data.validation_status,
      data.validation_reason ?? null,
      data.idempotency_key_hash ?? null,
    ]
  );
  return rowToReceipt(res.rows[0]);
}

/**
 * Finds a receipt by idempotency key (within TTL).
 * Used to return existing receipt on retry instead of creating duplicate.
 */
export async function findReceiptByIdempotencyKey(
  keyHash: string,
  userId: string,
  ttlHours: number
): Promise<ReturnType<typeof rowToReceipt> | null> {
  const res = await pool.query<ReceiptRow>(
    `SELECT * FROM receipts
     WHERE user_id = $1 AND idempotency_key_hash = $2
       AND created_at > NOW() - ($3 || ' hours')::INTERVAL
     LIMIT 1`,
    [userId, keyHash, ttlHours]
  );
  return res.rows[0] ? rowToReceipt(res.rows[0]) : null;
}

/**
 * Finds a potential duplicate receipt: same user, amount within tolerance,
 * date within window, and similar (normalized) description.
 */
export async function findPotentialDuplicateReceipt(
  userId: string,
  amount: number,
  date: Date,
  normalizedDescription: string,
  amountTolerance: number,
  dateWindowHours: number
): Promise<ReturnType<typeof rowToReceipt> | null> {
  const dateFrom = new Date(date);
  dateFrom.setHours(dateFrom.getHours() - dateWindowHours);
  const dateTo = new Date(date);
  dateTo.setHours(dateTo.getHours() + dateWindowHours);

  const res = await pool.query<ReceiptRow>(
    `SELECT * FROM receipts
     WHERE user_id = $1
       AND amount BETWEEN $2 AND $3
       AND date BETWEEN $4 AND $5
       AND LOWER(TRIM(REGEXP_REPLACE(description, E'\\\\s+', ' ', 'g'))) = $6
     ORDER BY created_at DESC
     LIMIT 1`,
    [
      userId,
      amount - amountTolerance,
      amount + amountTolerance,
      dateFrom,
      dateTo,
      normalizedDescription,
    ]
  );
  return res.rows[0] ? rowToReceipt(res.rows[0]) : null;
}

export async function findReceiptsByUserId(userId: string) {
  const res = await pool.query<ReceiptRow>(
    "SELECT * FROM receipts WHERE user_id = $1 ORDER BY date DESC",
    [userId]
  );
  return res.rows.map(rowToReceipt);
}

export async function updateReceiptCategoryAndReasoning(
  receiptId: string,
  category: string,
  reasoning: string
): Promise<void> {
  await pool.query(
    "UPDATE receipts SET category = $1, categorization_reasoning = $2 WHERE id = $3",
    [category.trim(), reasoning.trim(), receiptId]
  );
}
