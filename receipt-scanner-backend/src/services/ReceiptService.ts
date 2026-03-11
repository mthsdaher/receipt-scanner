import * as receiptDb from "../db/receipts";
import * as userDb from "../db/users";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/AppError";

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

    return receiptDb.createReceipt({
      userId: input.userId,
      amount: normalizeAmount(input.amount),
      date: normalizeDate(input.date),
      description,
      category: normalizeCategory(input.category),
    });
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
