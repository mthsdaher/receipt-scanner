// Import Zod for schema validation
import { z } from 'zod';

/**
 * Calculates the total value of a receipt by adding the product value and taxes (as a percentage).
 * 
 * @param productValue - The value of the product before taxes (in currency units, e.g., dollars).
 * @param taxRate - The tax rate in percentage (e.g., 10 for 10%).
 * @returns The total value of the receipt.
 * @throws TypeError if inputs are not numbers.
 * @throws RangeError if inputs are negative.
 */
export const calculateReceiptTotal = (productValue: number, taxRate: number): number => {
  // Validate that inputs are numbers and non-negative
  if (typeof productValue !== 'number' || typeof taxRate !== 'number') {
    throw new TypeError('Product value and tax rate must be numbers');
  }
  if (productValue < 0 || taxRate < 0) {
    throw new RangeError('Product value and tax rate cannot be negative');
  }

  // Calculate tax amount based on percentage and add to product value
  const taxAmount = productValue * (taxRate / 100);
  return productValue + taxAmount;
};

// Define a schema for receipt data validation using Zod
export const receiptSchema = z.object({
  productValue: z.number().min(0, 'Product value must be non-negative'),
  taxRate: z.number().min(0, 'Tax rate must be non-negative'),
});