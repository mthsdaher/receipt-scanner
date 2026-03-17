import OpenAI from "openai";
import { env } from "../config/env";
import { generateEmbedding } from "./EmbeddingService";
import { findSimilarReceipts } from "../db/receiptEmbeddings";
import { ServiceUnavailableError } from "../errors/AppError";

const RAG_CONTEXT_LIMIT = 5;

function formatReceiptForContext(r: {
  description: string;
  category?: string;
  amount: number;
  date: Date;
}): string {
  const dateStr =
    r.date instanceof Date ? r.date.toISOString().split("T")[0] : String(r.date);
  return `- ${r.description} | ${r.category ?? "uncategorized"} | $${Number(r.amount).toFixed(2)} | ${dateStr}`;
}

/**
 * Answers a natural-language question about the user's receipts using RAG.
 * Retrieves relevant receipts via semantic search and sends them to the LLM as context.
 *
 * @throws ServiceUnavailableError if OPENAI_API_KEY is not set
 */
export async function queryReceipts(
  userId: string,
  question: string
): Promise<{ answer: string; sourcesCount: number }> {
  if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.trim() === "") {
    throw new ServiceUnavailableError(
      "AI features require OPENAI_API_KEY. Add it to your .env to enable RAG."
    );
  }

  const normalizedQuestion = question.trim();
  if (!normalizedQuestion) {
    throw new ServiceUnavailableError("Question cannot be empty");
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  // 1. Generate embedding for the question
  const queryEmbedding = await generateEmbedding(normalizedQuestion);

  // 2. Retrieve similar receipts
  const similarReceipts = await findSimilarReceipts(
    userId,
    queryEmbedding,
    RAG_CONTEXT_LIMIT
  );

  // 3. Build context
  const contextText =
    similarReceipts.length > 0
      ? similarReceipts.map(formatReceiptForContext).join("\n")
      : "No receipts found matching your question.";

  const systemPrompt = `You are a helpful financial assistant. Answer questions about the user's receipts based ONLY on the context provided. If the context says "No receipts found", say you don't have access to their receipt data yet. Keep answers concise and factual.`;

  const userPrompt = `Context (user's receipts):
${contextText}

Question: ${normalizedQuestion}

Answer:`;

  // 4. Call LLM
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 300,
  });

  const answer =
    completion.choices[0]?.message?.content?.trim() ??
    "I couldn't generate an answer. Please try again.";

  return {
    answer,
    sourcesCount: similarReceipts.length,
  };
}
