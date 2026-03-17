import OpenAI from "openai";
import { z } from "zod";
import { env } from "../config/env";
import { ServiceUnavailableError } from "../errors/AppError";

const CATEGORIES = [
  "food",
  "grocery",
  "transport",
  "health",
  "entertainment",
  "other",
] as const;

const categorySchema = z.object({
  category: z.enum(CATEGORIES),
  reasoning: z.string().min(1, "Reasoning is required"),
});

export type CategorizationResult = z.infer<typeof categorySchema>;

/**
 * Suggests a category for a receipt using LLM with structured output.
 * Returns category and reasoning (explainability).
 *
 * @throws ServiceUnavailableError if OPENAI_API_KEY is not set
 */
export async function categorizeReceipt(
  description: string,
  amount?: number
): Promise<CategorizationResult> {
  if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.trim() === "") {
    throw new ServiceUnavailableError(
      "AI features require OPENAI_API_KEY for auto-categorization."
    );
  }

  const normalizedDesc = description.trim();
  if (!normalizedDesc) {
    return { category: "other", reasoning: "No description provided" };
  }

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const amountHint = amount !== undefined ? ` Amount: $${Number(amount).toFixed(2)}.` : "";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You categorize receipts. Return JSON with "category" (one of: ${CATEGORIES.join(", ")}) and "reasoning" (brief explanation). Be concise.`,
      },
      {
        role: "user",
        content: `Categorize this receipt: "${normalizedDesc}".${amountHint}`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 150,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    return { category: "other", reasoning: "Could not categorize" };
  }

  try {
    const parsed = JSON.parse(content);
    const rawCategory = (parsed.category ?? "other").toString().toLowerCase();
    const category = CATEGORIES.includes(rawCategory as (typeof CATEGORIES)[number])
      ? (rawCategory as (typeof CATEGORIES)[number])
      : "other";
    const reasoning = String(parsed.reasoning ?? "No reasoning provided").trim() || "Categorized as other";
    return categorySchema.parse({ category, reasoning });
  } catch {
    return { category: "other", reasoning: "Invalid LLM response" };
  }
}
