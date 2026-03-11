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

export const env = {
  NODE_ENV: nodeEnv,
  PORT: Number(process.env.PORT ?? 3002),
  TRUST_PROXY: process.env.TRUST_PROXY === "true",
  TRUST_PROXY_HOPS: Number(process.env.TRUST_PROXY_HOPS ?? 1),
  REQUEST_TIMEOUT_MS: Number(process.env.REQUEST_TIMEOUT_MS ?? 30000),
  JWT_SECRET: process.env.JWT_SECRET as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  OCR_SERVICE_URL: process.env.OCR_SERVICE_URL ?? "http://localhost:8000",
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
} as const;

