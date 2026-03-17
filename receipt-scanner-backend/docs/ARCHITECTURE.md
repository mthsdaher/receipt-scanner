# Backend Architecture

## Layered Architecture (Step 1)

The backend follows a clean layered architecture for maintainability and testability.

```
┌─────────────────────────────────────────────────────────────────┐
│  CONTROLLERS (HTTP boundary)                                     │
│  • Extract req.body, req.params                                   │
│  • Validate input (express-validator)                             │
│  • Map to DTOs                                                    │
│  • Call Service → Format response                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  SERVICES (Business logic)                                       │
│  • Business rules, validation, normalization                     │
│  • Authorization (e.g. assertCanAccess)                          │
│  • Orchestrate: Repository + other services                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  REPOSITORIES (Data access)                                      │
│  • Pure persistence: create, find, update                         │
│  • Maps DTOs ↔ database                                          │
│  • No business logic                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DB (PostgreSQL)                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Receipt Flow (Example)

| Layer        | File                    | Responsibility                          |
|-------------|-------------------------|-----------------------------------------|
| Controller  | `receiptController.ts`   | Map `req.body` → `CreateReceiptDto`     |
| Service     | `ReceiptService.ts`     | Validate, normalize, orchestrate AI jobs |
| Repository  | `ReceiptRepository.ts`  | `create()`, `findByUserId()`             |
| DTOs        | `dtos/receipt/`         | `CreateReceiptDto`, `ReceiptDto`         |

## Folder Structure

```
src/
├── controllers/     # HTTP handlers
├── services/        # Business logic
├── repositories/    # Data access (wraps db/)
├── dtos/            # Data Transfer Objects
│   └── receipt/
├── db/              # Low-level DB (pool, raw queries)
├── middleware/
├── routes/
├── config/
└── errors/
```
