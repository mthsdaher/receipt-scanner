-- Receipt Scanner - Financial Validation (Step 2)
-- Adds subtotal, tax, and validation_status for fintech-grade receipt integrity.
--
-- Why: In financial systems, subtotal + tax must equal total. Inconsistencies
-- indicate OCR errors, manual entry mistakes, or potential fraud. Companies like
-- Amex flag such receipts for review.

-- Add optional subtotal (pre-tax amount)
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2) CHECK (subtotal >= 0);

-- Add optional tax amount (in currency, not percentage)
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS tax DECIMAL(12, 2) CHECK (tax >= 0);

-- validation_status: 'valid' | 'invalid' | 'not_validated'
-- - not_validated: only total (amount) provided, no breakdown to check
-- - valid: subtotal + tax = total (within tolerance)
-- - invalid: subtotal + tax != total
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS validation_status VARCHAR(20) NOT NULL DEFAULT 'not_validated'
  CHECK (validation_status IN ('valid', 'invalid', 'not_validated'));

-- Optional: store reason when invalid (e.g. "subtotal + tax (100.50) != total (99.99)")
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS validation_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_receipts_validation_status ON receipts(validation_status);
