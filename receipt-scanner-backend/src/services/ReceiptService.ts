import * as receiptDb from "../db/receipts";
import * as userDb from "../db/users";
import { NotFoundError, ForbiddenError } from "../errors/AppError";

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

export const ReceiptService = {
  async create(input: CreateReceiptInput) {
    const user = await userDb.findUserById(input.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return receiptDb.createReceipt({
      userId: input.userId,
      amount: input.amount,
      date: input.date,
      description: input.description,
      category: input.category,
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
