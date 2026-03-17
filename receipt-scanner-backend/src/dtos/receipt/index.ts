/**
 * Data Transfer Objects (DTOs) for Receipt domain.
 *
 * DTOs define the contract between layers:
 * - Controllers receive/send DTOs
 * - Services operate on DTOs and domain types
 * - Repositories persist and return DTOs
 *
 * This ensures type safety and clear boundaries across the architecture.
 */

/**
 * Input DTO for creating a new receipt.
 * Used by the controller when mapping from HTTP request body.
 *
 * Financial validation: when both subtotal and tax are provided,
 * the service validates subtotal + tax = amount (total).
 */
export interface CreateReceiptDto {
  /** Total amount (required). Must equal subtotal + tax when both are provided. */
  amount: number;
  date: Date;
  description: string;
  category?: string;
  /** Pre-tax subtotal (optional). Required for validation when tax is provided. */
  subtotal?: number;
  /** Tax amount in currency (optional). Required for validation when subtotal is provided. */
  tax?: number;
}

/**
 * Validation status for financial integrity.
 * - valid: subtotal + tax = total
 * - invalid: subtotal + tax != total
 * - not_validated: no breakdown provided
 */
export type ReceiptValidationStatus = "valid" | "invalid" | "not_validated";

/**
 * Output DTO representing a receipt in API responses.
 * Maps 1:1 with the receipt entity returned from the database.
 */
export interface ReceiptDto {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  description: string;
  category?: string;
  categorizationReasoning?: string;
  /** Pre-tax subtotal (when provided) */
  subtotal?: number;
  /** Tax amount (when provided) */
  tax?: number;
  /** Financial validation result */
  validationStatus: ReceiptValidationStatus;
  /** Reason when validationStatus is 'invalid' */
  validationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
