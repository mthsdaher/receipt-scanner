import OpenAI from "openai";
import { env } from "../config/env";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIM = 1536;

/**
 * Generates an embedding vector for the given text.
 * Used for RAG and semantic search over receipts.
 *
 * @throws Error if OPENAI_API_KEY is not set or text is empty
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.trim() === "") {
    throw new Error("OPENAI_API_KEY is required for embedding generation");
  }

  const normalized = text.trim();
  if (!normalized) {
    throw new Error("Cannot embed empty text");
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: normalized,
  });

  const embedding = response.data[0]?.embedding;
  if (!embedding || embedding.length !== EMBEDDING_DIM) {
    throw new Error("Invalid embedding response from OpenAI");
  }

  return embedding;
}

/**
 * Builds a text representation of a receipt for embedding.
 * Combines description, category, amount, and date for semantic search.
 */
export function receiptToEmbeddableText(receipt: {
  description: string;
  category?: string;
  amount: number;
  date: Date;
}): string {
  const dateStr =
    receipt.date instanceof Date
      ? receipt.date.toISOString().split("T")[0]
      : String(receipt.date);
  const parts = [
    receipt.description,
    receipt.category ?? "uncategorized",
    `$${Number(receipt.amount).toFixed(2)}`,
    dateStr,
  ];
  return parts.join(" | ");
}
