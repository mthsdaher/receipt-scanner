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
├── controllers/     # HTTP handlers (extract body, validate, call service)
├── services/        # Business logic (orchestrate, validate, authorize)
├── repositories/    # Data access (wraps db/, maps DTOs)
├── dtos/            # Data Transfer Objects (contracts between layers)
│   └── receipt/
├── db/              # Low-level DB (pool, raw SQL, snake_case)
├── middleware/      # Auth, logging, rate limit, error handler
├── routes/          # Route definitions + express-validator
├── config/          # env, database config
├── errors/          # AppError hierarchy (400, 401, 403, 404, 409, 503)
└── utils/           # aiSafety, aiLogger, requestContext, logger
```

## Naming Conventions

| Layer | DB columns | API/DTOs |
|-------|------------|----------|
| Database | snake_case (validation_status, user_id) | — |
| DTOs | — | camelCase (validationStatus, userId) |
| Repository | Maps between DB and DTO |

## Error Handling

All errors flow to `errorHandler` middleware. Use `AppError` subclasses:

- `BadRequestError` (400): Invalid input
- `UnauthorizedError` (401): Not authenticated
- `ForbiddenError` (403): Authenticated but not allowed
- `NotFoundError` (404): Resource not found
- `ConflictError` (409): Duplicate resource
- `ServiceUnavailableError` (503): External service down
