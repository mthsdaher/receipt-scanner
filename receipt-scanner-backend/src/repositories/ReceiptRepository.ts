/**
 * ReceiptRepository - Data access layer for receipts.
 *
 * Responsibility: Pure persistence operations. No business logic.
 * - Maps between DTOs and database representation
 * - Encapsulates all SQL/queries for receipts
 * - Used by ReceiptService; never by controllers directly
 *
 * Why a repository?
 * - Single place to change if we switch databases
 * - Easy to mock in unit tests
 * - Clear separation: Service = what to do, Repository = how to store
 */

import * as receiptDb from "../db/receipts";
import type { CreateReceiptDto, ReceiptDto, ReceiptValidationStatus } from "../dtos/receipt";

/**
 * Data passed to create - includes validation result computed by the service.
 * Validation status is never trusted from the client; always computed server-side.
 */
export interface CreateReceiptData extends CreateReceiptDto {
  validationStatus: ReceiptValidationStatus;
  validationReason?: string;
}

/**
 * Creates a new receipt in the database.
 * @param userId - Owner of the receipt
 * @param data - Receipt data including validation result (from service layer)
 * @returns The created receipt as ReceiptDto
 */
export async function create(
  userId: string,
  data: CreateReceiptData
): Promise<ReceiptDto> {
  const row = await receiptDb.createReceipt({
    userId,
    amount: data.amount,
    date: data.date,
    description: data.description,
    category: data.category,
    subtotal: data.subtotal,
    tax: data.tax,
    validation_status: data.validationStatus,
    validation_reason: data.validationReason,
  });
  return row as ReceiptDto;
}

/**
 * Finds all receipts for a user, ordered by date descending.
 * @param userId - User ID to filter by
 * @returns Array of receipts
 */
export async function findByUserId(userId: string): Promise<ReceiptDto[]> {
  const rows = await receiptDb.findReceiptsByUserId(userId);
  return rows as ReceiptDto[];
}

/**
 * Updates the category and AI reasoning for a receipt.
 * Used after LLM categorization in the background job.
 *
 * @param receiptId - Receipt to update
 * @param category - New category
 * @param reasoning - AI explanation for the categorization
 */
export async function updateCategoryAndReasoning(
  receiptId: string,
  category: string,
  reasoning: string
): Promise<void> {
  await receiptDb.updateReceiptCategoryAndReasoning(
    receiptId,
    category,
    reasoning
  );
}
