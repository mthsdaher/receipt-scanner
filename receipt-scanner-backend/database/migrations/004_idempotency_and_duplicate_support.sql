-- Receipt Scanner - Idempotency & Duplicate Protection (Step 2)
--
-- WHY IDEMPOTENCY MATTERS (Fintech):
-- - Retries (network failures, timeouts) must not create duplicate transactions.
-- - Stripe, PayPal, Adyen use idempotency keys: same key = same result.
-- - Auditors require traceability: one payment attempt = one record.
--
-- idempotency_key_hash: optional column on receipts. When provided, same key returns existing receipt.

ALTER TABLE receipts ADD COLUMN IF NOT EXISTS idempotency_key_hash VARCHAR(64);

-- Unique per user: one idempotency key = one receipt. Partial index for non-null keys only.
CREATE UNIQUE INDEX IF NOT EXISTS idx_receipts_idempotency_key
    ON receipts(user_id, idempotency_key_hash)
    WHERE idempotency_key_hash IS NOT NULL;
