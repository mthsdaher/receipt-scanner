import * as receiptEmbeddingsDb from "../db/receiptEmbeddings";
import * as userDb from "../db/users";
import type { CreateReceiptDto, ReceiptDto } from "../dtos/receipt";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/AppError";
import type { CreateReceiptData } from "../repositories/ReceiptRepository";
import * as receiptRepository from "../repositories/ReceiptRepository";
import { env } from "../config/env";
import { logAiOperation } from "../utils/aiLogger";
import { categorizeReceipt } from "./CategorizationService";
import { generateEmbedding, receiptToEmbeddableText } from "./EmbeddingService";
import {
  validateReceiptTotals,
  type ValidationStatus,
} from "./ReceiptValidationService";

/**
 * ReceiptService: business logic for receipts.
 *
 * Separation of concerns:
 * - Controllers: HTTP boundary (params, body, response)
 * - Service: business rules, validation, orchestration (this layer)
 * - Repository: data access (ReceiptRepository)
 *
 * The service orchestrates: Repository (persistence) + EmbeddingService + CategorizationService.
 */
export interface CreateReceiptInput {
  userId: string;
  dto: CreateReceiptDto;
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

/** Normalizes optional financial field. Returns undefined if not provided or invalid. */
const normalizeOptionalAmount = (value: number | undefined): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (!Number.isFinite(value) || value < 0) {
    throw new BadRequestError("Subtotal and tax must be non-negative numbers when provided");
  }
  return Number(value.toFixed(2));
};

export const ReceiptService = {
  /**
   * Creates a receipt after validating user exists and normalizing input.
   * Triggers background jobs for embedding and LLM categorization when OpenAI is configured.
   */
  async create(input: CreateReceiptInput): Promise<ReceiptDto> {
    const user = await userDb.findUserById(input.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const description = normalizeText(input.dto.description);
    if (description.length === 0) {
      throw new BadRequestError("Description is required");
    }

    const amount = normalizeAmount(input.dto.amount);
    const subtotal = normalizeOptionalAmount(input.dto.subtotal);
    const tax = normalizeOptionalAmount(input.dto.tax);

    // Financial validation: subtotal + tax must equal total when both are provided
    const validation = validateReceiptTotals(subtotal, tax, amount);

    // Reject invalid receipts - fintech best practice: do not persist inconsistent data
    if (validation.status === "invalid") {
      throw new BadRequestError(
        validation.reason ?? "Receipt totals are inconsistent. Subtotal + tax must equal total."
      );
    }

    const createData: CreateReceiptData = {
      amount,
      date: normalizeDate(input.dto.date),
      description,
      category: normalizeCategory(input.dto.category),
      subtotal,
      tax,
      validationStatus: validation.status as ValidationStatus,
      validationReason: undefined,
    };

    const receipt = await receiptRepository.create(input.userId, createData);

    // Background: embedding + auto-categorization (non-blocking, fire-and-forget)
    if (env.OPENAI_API_KEY?.trim()) {
      void this.runBackgroundAiJobs(receipt);
    }

    return receipt;
  },

  /**
   * Runs AI jobs (categorization, embedding) in the background.
   * Failures are logged but do not affect the create response.
   */
  async runBackgroundAiJobs(receipt: ReceiptDto): Promise<void> {
    try {
      let category = receipt.category ?? "uncategorized";
      let reasoning: string | undefined;

      // 1. Auto-categorize if uncategorized
      if (category === "uncategorized") {
        try {
          const catResult = await categorizeReceipt(
            receipt.description,
            receipt.amount
          );
          category = catResult.category;
          reasoning = catResult.reasoning;
          await receiptRepository.updateCategoryAndReasoning(
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

      // 2. Generate embedding for RAG/semantic search
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
  },

  async findByUserId(userId: string): Promise<ReceiptDto[]> {
    return receiptRepository.findByUserId(userId);
  },

  /** Ensures requester can only access their own receipts */
  assertCanAccess(requestedUserId: string, currentUserId: string | undefined): void {
    if (!currentUserId || currentUserId !== requestedUserId) {
      throw new ForbiddenError("You cannot view receipts of other users.");
    }
  },
};
