import pool, { pgvector } from "../config/database";

export interface ReceiptWithSimilarity {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  description: string;
  category?: string;
  similarity: number;
}

/**
 * Updates the embedding vector for a receipt.
 * Used after creating or updating a receipt for RAG/semantic search.
 */
export async function updateReceiptEmbedding(
  receiptId: string,
  embedding: number[]
): Promise<void> {
  const embeddingSql = pgvector.toSql(embedding);
  await pool.query(
    "UPDATE receipts SET embedding = $1::vector WHERE id = $2",
    [embeddingSql, receiptId]
  );
}

/**
 * Finds receipts most similar to the query embedding (cosine similarity).
 * Returns receipts ordered by similarity, highest first.
 *
 * @param userId - Filter by user
 * @param queryEmbedding - Embedding vector of the search query
 * @param limit - Max number of results (default 5)
 */
export async function findSimilarReceipts(
  userId: string,
  queryEmbedding: number[],
  limit: number = 5
): Promise<ReceiptWithSimilarity[]> {
  const embeddingSql = pgvector.toSql(queryEmbedding);

  const res = await pool.query(
    `SELECT id, user_id, amount, date, description, category,
            1 - (embedding <=> $1::vector) AS similarity
     FROM receipts
     WHERE user_id = $2 AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $3`,
    [embeddingSql, userId, limit]
  );

  return res.rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    amount: Number(r.amount),
    date: r.date,
    description: r.description,
    category: r.category ?? undefined,
    similarity: Number(r.similarity),
  }));
}
