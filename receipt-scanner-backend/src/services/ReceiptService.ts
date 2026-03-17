import * as receiptDb from "../db/receipts";
import * as receiptEmbeddingsDb from "../db/receiptEmbeddings";
import * as userDb from "../db/users";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/AppError";
import { env } from "../config/env";
import { logAiOperation } from "../utils/aiLogger";
import { categorizeReceipt } from "./CategorizationService";
import { generateEmbedding, receiptToEmbeddableText } from "./EmbeddingService";

/**
 * ReceiptService: business logic for receipts.
 *
 * Separation of concerns: Controllers handle HTTP (params, body, res).
 * Service handles authorization, validation, and orchestrates data access.
 * DB layer handles persistence.
 */
export interface CreateReceiptInput {
  userId: string;
  amount: number;
  date: Date;
  description: string;
  category?: string;
}

const normalizeText = (value: string): string => {
  return value.trim().replace(/\s+/g, " ");
};

const normalizeCategory = (value: string | undefined): string => {
  if (!value) return "uncategorized";
  const cleaned = normalizeText(value).toLowerCase();
  return cleaned.length > 0 ? cleaned : "uncategorized";
};

const normalizeAmount = (value: number): number => {
  if (!Number.isFinite(value) || value < 0) {
    throw new BadRequestError("Amount must be a non-negative number");
  }
  // Keep financial values stable at cent precision.
  return Number(value.toFixed(2));
};

const normalizeDate = (value: Date): Date => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new BadRequestError("Date must be a valid ISO date");
  }
  return value;
};

export const ReceiptService = {
  async create(input: CreateReceiptInput) {
    const user = await userDb.findUserById(input.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const description = normalizeText(input.description);
    if (description.length === 0) {
      throw new BadRequestError("Description is required");
    }

    const receipt = await receiptDb.createReceipt({
      userId: input.userId,
      amount: normalizeAmount(input.amount),
      date: normalizeDate(input.date),
      description,
      category: normalizeCategory(input.category),
    });

    // Background: embedding + auto-categorization (non-blocking)
    if (env.OPENAI_API_KEY?.trim()) {
      void (async () => {
        try {
          // 1. Auto-categorize if uncategorized
          let category = receipt.category;
          let reasoning: string | undefined;
          if (category === "uncategorized") {
            try {
              const catResult = await categorizeReceipt(
                receipt.description,
                receipt.amount
              );
              category = catResult.category;
              reasoning = catResult.reasoning;
              await receiptDb.updateReceiptCategoryAndReasoning(
                receipt.id,
                category,
                reasoning
              );
            } catch (err) {
              logAiOperation({
                operation: "categorization",
                userId: receipt.userId,
                success: false,
                error: (err as Error).message,
              });
            }
          }

          // 2. Generate embedding (use updated category if we categorized)
          const text = receiptToEmbeddableText({
            description: receipt.description,
            category,
            amount: receipt.amount,
            date: receipt.date,
          });
          const embedding = await generateEmbedding(text);
          await receiptEmbeddingsDb.updateReceiptEmbedding(receipt.id, embedding);
        } catch (err) {
          logAiOperation({
            operation: "embedding",
            userId: receipt.userId,
            success: false,
            error: (err as Error).message,
          });
        }
      })();
    }

    return receipt;
  },

  async findByUserId(userId: string) {
    return receiptDb.findReceiptsByUserId(userId);
  },

  /** Ensures requester can only access their own receipts */
  assertCanAccess(requestedUserId: string, currentUserId: string | undefined): void {
    if (!currentUserId || currentUserId !== requestedUserId) {
      throw new ForbiddenError("You cannot view receipts of other users.");
    }
  },
};
