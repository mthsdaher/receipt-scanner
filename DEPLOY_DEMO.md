# Demo Deploy (Docker Compose)

This project can run as a full demo stack with one command:

```bash
docker compose up --build
```

## Services

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:3002](http://localhost:3002)
- Swagger: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- OCR service: [http://localhost:8000](http://localhost:8000)
- PostgreSQL: `localhost:5432`

## What the compose stack includes

- `postgres` with automatic schema initialization from:
  - `receipt-scanner-backend/database/migrations/001_initial_schema.sql`
- `ocr` Python FastAPI service (`ocr_service.py`)
- `backend` Node/Express API
- `frontend` React app served by Nginx

## Useful commands

Start in background:

```bash
docker compose up --build -d
```

Stop services:

```bash
docker compose down
```

Stop and remove DB data volume (clean reset):

```bash
docker compose down -v
```

View logs:

```bash
docker compose logs -f
```

## Notes

- The default JWT secret in compose is for demo only.
- OCR image build can take longer on first run due to Python dependencies.
- Frontend calls the backend through Nginx proxy (`/api`), so browser CORS stays simple.
