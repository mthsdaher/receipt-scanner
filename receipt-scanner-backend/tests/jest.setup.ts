process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/receipt_scanner_test";
process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";
