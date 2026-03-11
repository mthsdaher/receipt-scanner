# Receipt Scanner Backend Operations Runbook

## Purpose
This document is a practical production runbook for operating the backend API safely:
- startup/shutdown behavior
- required environment configuration
- health checks and readiness
- incident triage and rollback basics

## Runtime Entry Points
- Development: `npm run dev`
- Production build: `npm run build`
- Production start: `npm start`

The process includes graceful shutdown handlers for `SIGINT`, `SIGTERM`, `unhandledRejection`, and `uncaughtException`.

## Required Environment Variables
- `JWT_SECRET` (required)
- `DATABASE_URL` (required)

## Core Runtime Environment Variables
- `PORT` (default `3002`)
- `TRUST_PROXY` (`true`/`false`, default `false`)
- `TRUST_PROXY_HOPS` (default `1`)
- `REQUEST_TIMEOUT_MS` (default `30000`)
- `OCR_SERVICE_URL` (default `http://localhost:8000`)
- `OCR_UPSTREAM_TIMEOUT_MS` (default `45000`)
- `FRONTEND_URL` (default `http://localhost:3000`)
- `FRONTEND_URLS` (optional comma-separated allowlist for multiple frontend origins)

## Database Pool Tuning
- `DB_POOL_MAX` (default `10`)
- `DB_IDLE_TIMEOUT_MS` (default `30000`)
- `DB_CONNECTION_TIMEOUT_MS` (default `10000`)

Notes:
- numeric variables are validated at startup and must be valid positive/non-negative integers
- invalid values fail fast during boot

## Health Endpoints
- Liveness: `GET /health`
  - expected `200` when process is alive
- Readiness: `GET /ready`
  - expected `200` when DB is reachable
  - returns `503` if dependencies are unavailable

Use readiness checks for deployment gates and autoscaling decisions.

## Error and Logging Contract
- API error payload standard:
  - `status`
  - `code`
  - `message`
  - `requestId`
  - optional `details` (non-production)
- Structured JSON logs include request lifecycle and fatal process events.

When debugging:
1. capture `requestId` from API response
2. search backend logs by `requestId`
3. correlate with upstream OCR errors (`OCR_UPSTREAM_TIMEOUT`, `OCR_UPSTREAM_UNAVAILABLE`, `OCR_UPSTREAM_ERROR`)

## Security and Traffic Controls
- Helmet enabled
- CORS allowlist enforced from env
- Auth/OCR/receipt-specific rate limiting enabled
- Upload restrictions on OCR endpoint:
  - max file size 5MB
  - allowed mime types: JPG, PNG, WEBP

## Deployment Checklist
1. Set required env vars (`JWT_SECRET`, `DATABASE_URL`)
2. Set production CORS allowlist (`FRONTEND_URLS`)
3. Validate OpenAPI: `npm run check:openapi`
4. Run tests: `npm test`
5. Build: `npm run build`
6. Start service: `npm start`
7. Verify `/health` and `/ready`

## Incident Triage Quick Guide
- **Spike in 429**: tune rate limits and inspect traffic source pattern
- **Spike in 503/504 on OCR**: verify OCR service status, latency, and timeout config
- **Readiness failing**: validate DB connectivity and pool timeout settings
- **Frequent CORS blocks**: verify `FRONTEND_URLS` against real origin values

## Rollback Strategy
If a release is unstable:
1. rollback to previous stable image/commit
2. confirm `GET /ready` returns `200`
3. monitor error rate and latency before reattempting rollout
