# Financial Validation (Step 2)

## Why This Matters in Fintech

In financial systems, **subtotal + tax must equal total**. Inconsistencies indicate:

- **OCR extraction errors** – misread numbers from receipt images
- **Manual entry mistakes** – typos when entering amounts
- **Potential fraud or tampering** – altered receipts

Companies like American Express, Visa, and Stripe flag inconsistent transactions for review. Auditors require financial data to reconcile.

## How Companies Detect Inconsistencies

1. **Rule-based checks** – `|(subtotal + tax) - total| > tolerance` (e.g. 1 cent)
2. **ML models** – trained on historical data to spot anomalies
3. **Reconciliation workflows** – invalid receipts go to manual review queues

## Implementation

### Validation Rule

When **both** `subtotal` and `tax` are provided:

```
subtotal + tax = total  (within 0.01 tolerance for floating-point)
```

### Status Field

| Status         | Meaning                                              |
|----------------|------------------------------------------------------|
| `valid`        | subtotal + tax = total                               |
| `invalid`      | subtotal + tax ≠ total → **request rejected** (400)  |
| `not_validated`| Only total provided; no breakdown to validate        |

### API Behavior

- **Valid or not_validated** → Receipt is created, returns 201
- **Invalid** → `400 Bad Request` with message explaining the mismatch

### Request Body (POST /api/receipts)

```json
{
  "amount": 110.00,
  "date": "2024-01-15",
  "description": "Office supplies",
  "category": "office",
  "subtotal": 100.00,
  "tax": 10.00
}
```

- `amount` = total (required)
- `subtotal`, `tax` = optional; when both provided, validation runs

### Response (Receipt)

```json
{
  "id": "...",
  "amount": 110.00,
  "subtotal": 100.00,
  "tax": 10.00,
  "validationStatus": "valid",
  "validationReason": null,
  ...
}
```

## Migration

Run `003_financial_validation.sql` to add columns:

- `subtotal` (optional)
- `tax` (optional)
- `validation_status` (default: 'not_validated')
- `validation_reason` (when invalid)
