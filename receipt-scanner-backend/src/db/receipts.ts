import pool from "../config/database";

export interface ReceiptRow {
  id: string;
  user_id: string;
  amount: number;
  date: Date;
  description: string;
  category?: string;
  categorization_reasoning?: string;
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
}) {
  const res = await pool.query<ReceiptRow>(
    `INSERT INTO receipts (user_id, amount, date, description, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.userId,
      data.amount,
      data.date,
      data.description.trim(),
      data.category?.trim() ?? null,
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
