import { config as loadDotenv } from "dotenv";
import fs from "fs";
import path from "path";

const nodeEnv = process.env.NODE_ENV ?? "development";
const envFileCandidates =
  nodeEnv === "production"
    ? [".env.production", ".env"]
    : [".env.development", ".env"];

const resolvedEnvPath = envFileCandidates
  .map((fileName) => path.resolve(process.cwd(), fileName))
  .find((candidatePath) => fs.existsSync(candidatePath));

if (resolvedEnvPath) {
  loadDotenv({ path: resolvedEnvPath });
}

const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL"] as const;

for (const variableName of requiredEnvVars) {
  if (!process.env[variableName]) {
    throw new Error(`${variableName} environment variable must be defined`);
  }
}

const parsePositiveInteger = (
  rawValue: string | undefined,
  defaultValue: number,
  variableName: string
): number => {
  if (rawValue === undefined || rawValue.trim() === "") {
    return defaultValue;
  }

  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${variableName} must be a positive integer`);
  }

  return parsed;
};

const parseNonNegativeInteger = (
  rawValue: string | undefined,
  defaultValue: number,
  variableName: string
): number => {
  if (rawValue === undefined || rawValue.trim() === "") {
    return defaultValue;
  }

  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${variableName} must be a non-negative integer`);
  }

  return parsed;
};

const parseStringList = (rawValue: string | undefined): string[] => {
  if (!rawValue || rawValue.trim() === "") {
    return [];
  }
  return rawValue
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const env = {
  NODE_ENV: nodeEnv,
  PORT: parsePositiveInteger(process.env.PORT, 3002, "PORT"),
  TRUST_PROXY: process.env.TRUST_PROXY === "true",
  TRUST_PROXY_HOPS: parsePositiveInteger(
    process.env.TRUST_PROXY_HOPS,
    1,
    "TRUST_PROXY_HOPS"
  ),
  REQUEST_TIMEOUT_MS: parsePositiveInteger(
    process.env.REQUEST_TIMEOUT_MS,
    30000,
    "REQUEST_TIMEOUT_MS"
  ),
  DB_POOL_MAX: parsePositiveInteger(process.env.DB_POOL_MAX, 10, "DB_POOL_MAX"),
  DB_IDLE_TIMEOUT_MS: parseNonNegativeInteger(
    process.env.DB_IDLE_TIMEOUT_MS,
    30000,
    "DB_IDLE_TIMEOUT_MS"
  ),
  DB_CONNECTION_TIMEOUT_MS: parsePositiveInteger(
    process.env.DB_CONNECTION_TIMEOUT_MS,
    10000,
    "DB_CONNECTION_TIMEOUT_MS"
  ),
  OCR_UPSTREAM_TIMEOUT_MS: parsePositiveInteger(
    process.env.OCR_UPSTREAM_TIMEOUT_MS,
    45000,
    "OCR_UPSTREAM_TIMEOUT_MS"
  ),
  JWT_SECRET: process.env.JWT_SECRET as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  OCR_SERVICE_URL: process.env.OCR_SERVICE_URL ?? "http://localhost:8000",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  FRONTEND_URLS: parseStringList(process.env.FRONTEND_URLS),
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  BACKEND_PUBLIC_URL: process.env.BACKEND_PUBLIC_URL ?? "http://localhost:3002",
  /** OpenAI API key for AI features (RAG, embeddings, agentic). Optional at startup; required when calling AI endpoints. */
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",

  /**
   * Duplicate detection: amount tolerance in currency units (e.g. 0.01 = 1 cent).
   * Two receipts with same userId, date, and similar description are duplicates if |amount1 - amount2| <= this.
   */
  DUPLICATE_AMOUNT_TOLERANCE: parseFloat(process.env.DUPLICATE_AMOUNT_TOLERANCE ?? "0.01") || 0.01,

  /**
   * Duplicate detection: date window in hours. Receipts within this window are considered same-day.
   * E.g. 24 = same calendar day; 1 = within 1 hour.
   */
  DUPLICATE_DATE_WINDOW_HOURS: parsePositiveInteger(
    process.env.DUPLICATE_DATE_WINDOW_HOURS ?? "24",
    24,
    "DUPLICATE_DATE_WINDOW_HOURS"
  ),

  /**
   * Idempotency key TTL in hours. Keys expire after this period.
   * Stripe uses 24h; we default to 24 for consistency.
   */
  IDEMPOTENCY_KEY_TTL_HOURS: parsePositiveInteger(
    process.env.IDEMPOTENCY_KEY_TTL_HOURS ?? "24",
    24,
    "IDEMPOTENCY_KEY_TTL_HOURS"
  ),
} as const;

