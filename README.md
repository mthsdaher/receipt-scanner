# Receipt Scanner

Receipt Scanner is a full-stack application that converts receipt images into structured financial data using OCR, then presents insights through history views and dashboards.

---

## 1. Project Overview

Receipt Scanner helps users manage expenses by turning unstructured receipt photos into searchable, analyzable records.

### What it does
- Authenticates users and protects personal data routes
- Uploads receipt images for OCR processing
- Extracts key fields (store, amount, date)
- Lets users review/edit extracted data
- Stores receipts in PostgreSQL
- Displays spending history and analytics dashboards

### Problem it solves
- Receipts are usually unstructured (paper/images), hard to query, and difficult to analyze over time.

### Who it is for
- Individuals tracking expenses
- Developers studying full-stack architecture
- Recruiters/interviewers evaluating production-style engineering decisions

### Why it is useful
- Demonstrates real-world engineering practices: modular architecture, security hardening, validation, testing, CI, and deployment readiness.

---

## 2. Features

- **OCR Receipt Scanning**
  - Upload images and process them through a dedicated OCR service.
- **Automatic Field Extraction**
  - Extracts structured fields from OCR text (store, total, date).
- **Manual Data Correction**
  - Users can edit extracted values before saving.
- **Authentication & Protected Routes**
  - JWT-based auth and route protection for user-specific pages.
- **Receipt History**
  - Retrieve and browse stored receipts by user.
- **Dashboard Analytics**
  - Visual spending insights (trends, categories, top purchases).
- **Hardened API**
  - Validation, rate limits, standardized error payloads, upload constraints.
- **Operational Readiness**
  - Health/readiness endpoints, graceful shutdown, timeout middleware.
- **Docker & Compose Support**
  - One-command demo environment and production-style compose profile.

---

## 3. Tech Stack

### Frontend
- **React + TypeScript**
- **React Router**
- **Styled-components**
- **Recharts**

**Why:** strong component model, typed code, maintainable UI architecture, and clear data visualization.

### Backend
- **Node.js + Express + TypeScript**
- **express-validator**
- **helmet**
- **express-rate-limit**

**Why:** fast API development with robust middleware ecosystem and strong security/control primitives.

### Database
- **PostgreSQL**
- **pg (node-postgres)**

**Why:** reliable relational model for transactional data and analytical querying.

### OCR Processing
- **FastAPI (Python)**
- **PaddleOCR**

**Why:** Python ecosystem is strong for OCR/ML workloads; separating OCR as a service improves scalability and fault isolation.

### Authentication
- **JWT**

**Why:** stateless auth for SPA + API architecture.

### Styling
- **styled-components**

**Why:** scoped styles, reusable design tokens/patterns, and modular UI structure.

---

## 4. System Architecture

The system is split into four main components:

1. **Frontend (React SPA)**: UI, auth state, form flows, charts
2. **Backend API (Express)**: business logic, validation, security, persistence orchestration
3. **OCR Service (FastAPI + PaddleOCR)**: text extraction and receipt parsing
4. **PostgreSQL**: persistent storage for users and receipts

### Data flow
1. User uploads a receipt in frontend.
2. Frontend sends image to backend OCR proxy endpoint.
3. Backend validates auth + upload constraints.
4. Backend forwards file to OCR service.
5. OCR returns parsed fields.
6. User reviews/edits data in UI.
7. Frontend saves structured receipt via backend.
8. Backend normalizes/validates and stores in PostgreSQL.
9. Dashboard and history endpoints query and render insights.

---

## 5. Project Structure

```text
receipt-scanner/
  receipt-scanner-frontend/
    src/
      components/        # shared UI (Navbar, Layout, etc.)
      contexts/          # auth context
      pages/             # route-level modules (index/controller/styles/types)
      services/          # api client and request handling
      config/            # frontend runtime env
  receipt-scanner-backend/
    src/
      routes/            # express routes + middleware chains
      controllers/       # HTTP boundary logic
      services/          # business rules
      db/                # SQL access helpers
      middleware/        # auth, errors, logging, timeout, rate limit
      config/            # env/database config
      errors/            # custom error classes
      openapi.json       # API contract
    database/
      migrations/        # SQL schema migration scripts
  docker-compose.yml
  docker-compose.prod.yml
  DEPLOY_DEMO.md
  DEPLOY_PROD.md
```

---

## 6. Installation Guide (Local Development)

### 1) Clone repository
```bash
git clone <YOUR_REPO_URL>
cd receipt-scanner
```

### 2) Install backend dependencies
```bash
cd receipt-scanner-backend
npm install
```

### 3) Install frontend dependencies
```bash
cd ../receipt-scanner-frontend
npm install
```

### 4) Configure environment variables
- Backend: create `.env.development` in `receipt-scanner-backend/`
- Frontend: create `.env` in `receipt-scanner-frontend/` (or use existing setup)

### 5) Start backend
```bash
cd ../receipt-scanner-backend
npm run dev
```

### 6) Start frontend (new terminal)
```bash
cd receipt-scanner-frontend
npm start
```

### 7) (Optional) Start OCR service
Use your local Python environment for `ocr_service.py`, or run via Docker Compose.

---

## 7. Environment Variables

### Backend (`receipt-scanner-backend/.env.development`)
- `PORT` - API server port (default: `3002`)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `OCR_SERVICE_URL` - OCR service base URL
- `FRONTEND_URL` - allowed frontend origin
- `FRONTEND_URLS` - comma-separated allowed origins
- `TRUST_PROXY` - enable proxy trust (`true/false`)
- `TRUST_PROXY_HOPS` - proxy hop count
- `REQUEST_TIMEOUT_MS` - global request timeout
- `DB_POOL_MAX` - DB pool size
- `DB_IDLE_TIMEOUT_MS` - DB idle timeout
- `DB_CONNECTION_TIMEOUT_MS` - DB connection timeout
- `OCR_UPSTREAM_TIMEOUT_MS` - backend->OCR timeout
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - optional email reset flow

### Frontend (`receipt-scanner-frontend/.env`)
- `REACT_APP_API_URL` - backend API URL (e.g. `http://localhost:3002`)

---

## 8. How To Use the Application

1. Create an account.
2. Sign in.
3. Open **Insert Receipt**.
4. Upload receipt image (or manually fill fields).
5. Wait for OCR extraction.
6. Review/edit extracted data.
7. Save receipt.
8. Open **Dashboard** for analytics.
9. Open **History** to browse saved receipts.

---

## 9. Development Notes

- **Modular frontend page pattern**
  - `index` (view), `controller` (state/logic), `styles`, and optional `types`.
- **Layered backend architecture**
  - route/controller/service/db separation improves maintainability and testing.
- **OCR parsing strategy**
  - heuristic extraction from OCR lines with normalization and user correction.
- **Data quality**
  - backend validation + normalization before persistence.
- **Consistency**
  - standardized success and error response contracts.
- **Operational maturity**
  - health/readiness checks, graceful shutdown, structured logging, CI tests.

---

## 10. Future Improvements

- AI-based category classification
- Improved OCR confidence scoring and fallback models
- Advanced search/filtering over receipts
- Pagination for large history datasets
- Deeper financial analytics (forecasting, anomaly detection)
- Mobile-first UX and native app integration
- Multi-user teams and role-based permissions

---

## 11. Docker / Deployment Quick Start

### Demo stack (one command)
```bash
cp .env.docker.example .env.docker
docker compose --env-file .env.docker up --build
```

### Production-style profile
```bash
docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

More details:
- `DEPLOY_DEMO.md`
- `DEPLOY_PROD.md`

---

## 12. License

This project is released under the **MIT License**.  
If you plan to distribute it publicly, add a `LICENSE` file with MIT text in the repository root.

