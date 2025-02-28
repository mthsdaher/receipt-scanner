/**
 * Calculates the total value of a receipt by adding the product value and taxes (as a percentage).
 * 
 * @param productValue - The value of the product before taxes (in currency units, e.g., dollars).
 * @param taxRate - The tax rate in percentage (e.g., 10 for 10%).
 * @returns The total value of the receipt.
 * @throws Error if inputs are not numbers or are negative.
 */
export const calculateReceiptTotal = (productValue: number, taxRate: number): number => {
    // Validate that inputs are numbers and non-negative
    if (typeof productValue !== 'number' || typeof taxRate !== 'number') {
      throw new Error('Product value and tax rate must be numbers');
    }
    if (productValue < 0 || taxRate < 0) {
      throw new Error('Product value and tax rate cannot be negative');
    }
  
    // Calculate tax amount based on percentage and add to product value
    const taxAmount = productValue * (taxRate / 100);
    return productValue + taxAmount;
  };