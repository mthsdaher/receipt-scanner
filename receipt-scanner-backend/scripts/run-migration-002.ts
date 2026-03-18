/**
 * Run migration 002 (pgvector extension) against the database.
 * Use when the DB was created before init scripts or pgvector is missing.
 *
 * Usage: npm run migrate:002
 */
import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

// Load .env.development or .env (same as app)
const devPath = resolve(process.cwd(), ".env.development");
const envPath = existsSync(devPath) ? devPath : resolve(process.cwd(), ".env");
config({ path: envPath });

import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/receipt_scanner";

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const sqlPath = join(__dirname, "../database/migrations/002_add_embeddings.sql");
  const sql = readFileSync(sqlPath, "utf8");

  try {
    await pool.query(sql);
    console.log("[migration] 002_add_embeddings.sql applied successfully.");
    console.log("[migration] pgvector extension is now available.");
  } catch (err) {
    console.error("[migration] Failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
