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
 */
export interface CreateReceiptDto {
  amount: number;
  date: Date;
  description: string;
  category?: string;
}

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
  createdAt: Date;
  updatedAt: Date;
}
