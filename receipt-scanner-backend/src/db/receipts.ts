import pool from "../config/database";

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
}) {
  const res = await pool.query<ReceiptRow>(
    `INSERT INTO receipts (user_id, amount, date, description, category, subtotal, tax, validation_status, validation_reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
    ]
  );
  return rowToReceipt(res.rows[0]);
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
