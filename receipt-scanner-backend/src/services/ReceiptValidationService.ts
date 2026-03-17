/**
 * ReceiptValidationService - Financial integrity validation.
 *
 * WHY THIS MATTERS (Fintech):
 * - Subtotal + tax must equal total. Inconsistencies indicate:
 *   • OCR extraction errors
 *   • Manual entry mistakes
 *   • Potential fraud or tampering
 * - Companies like Amex, Visa, Stripe flag inconsistent receipts for review
 * - Auditors require financial data to reconcile
 *
 * HOW COMPANIES DETECT INCONSISTENCIES:
 * - Rule-based checks: |(subtotal + tax) - total| > tolerance
 * - ML models trained on historical data to spot anomalies
 * - Reconciliation workflows for invalid receipts
 */

/** Tolerance for floating-point comparison (2 decimal places = 1 cent) */
const TOLERANCE = 0.01;

export type ValidationStatus = "valid" | "invalid" | "not_validated";

export interface ValidationResult {
  status: ValidationStatus;
  reason?: string;
}

/**
 * Rounds a number to 2 decimal places for financial comparison.
 * Avoids floating-point drift (e.g. 10.1 + 0.2 !== 10.3 in IEEE 754).
 */
function toCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Validates that subtotal + tax equals total (within tolerance).
 *
 * @param subtotal - Pre-tax amount (optional)
 * @param tax - Tax amount in currency (optional)
 * @param total - Total amount (required)
 * @returns ValidationResult with status and optional reason
 */
export function validateReceiptTotals(
  subtotal: number | undefined,
  tax: number | undefined,
  total: number
): ValidationResult {
  // No breakdown provided: cannot validate, mark as not_validated
  if (subtotal === undefined && tax === undefined) {
    return { status: "not_validated" };
  }

  // If only one of subtotal/tax is provided, we cannot validate the equation
  if (subtotal === undefined || tax === undefined) {
    return {
      status: "not_validated",
      reason: "Both subtotal and tax must be provided to validate, or neither.",
    };
  }

  // Ensure non-negative
  if (subtotal < 0 || tax < 0 || total < 0) {
    return {
      status: "invalid",
      reason: "Subtotal, tax, and total must be non-negative.",
    };
  }

  const expectedTotal = toCents(subtotal + tax);
  const actualTotal = toCents(total);
  const diff = Math.abs(expectedTotal - actualTotal);

  if (diff <= TOLERANCE) {
    return { status: "valid" };
  }

  return {
    status: "invalid",
    reason: `Subtotal ($${subtotal.toFixed(2)}) + tax ($${tax.toFixed(2)}) = $${expectedTotal.toFixed(2)}, but total is $${actualTotal.toFixed(2)}. Difference: $${diff.toFixed(2)}.`,
  };
}
