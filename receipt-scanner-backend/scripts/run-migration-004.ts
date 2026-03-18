/**
 * Run migration 004 (idempotency & duplicate support) against the database.
 * Use when the DB was created before this migration was added.
 *
 * Usage: npm run migrate:004
 */
import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

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
  const sqlPath = join(__dirname, "../database/migrations/004_idempotency_and_duplicate_support.sql");
  const sql = readFileSync(sqlPath, "utf8");

  try {
    await pool.query(sql);
    console.log("[migration] 004_idempotency_and_duplicate_support.sql applied successfully.");
    console.log("[migration] Idempotency key and duplicate detection are now available.");
  } catch (err) {
    console.error("[migration] Failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
