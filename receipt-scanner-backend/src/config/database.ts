import { Pool } from "pg";
import pgvector from "pgvector/pg";
import { env } from "./env";
import { appLogger } from "../utils/logger";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
});

// Register pgvector types for each new connection (required for vector columns)
pool.on("connect", (client) => {
  pgvector.registerTypes(client).catch((err) => {
    appLogger.error(
      { event: "database_pgvector_registration_failed", error: (err as Error).message },
      "pgvector registration failed"
    );
  });
});

export const query = pool.query.bind(pool);
export { pgvector };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      try {
        await pgvector.registerTypes(client);
      } catch (pgvErr) {
        appLogger.warn(
          {
            event: "database_pgvector_unavailable",
            message: (pgvErr as Error).message,
          },
          "pgvector not available (run migration 002 if using AI features)"
        );
      }
      client.release();
      appLogger.info({ event: "database_connected" }, "PostgreSQL Connected!");
      return;
    } catch (error) {
      appLogger.error(
        {
          event: "database_connection_failed",
          attempt,
          retries,
          error: error instanceof Error ? error.message : String(error),
        },
        `PostgreSQL connection failed (attempt ${attempt}/${retries})`
      );
      if (attempt === retries) throw error;
      const delay = attempt * 2000;
      appLogger.info({ event: "database_retry", delayMs: delay }, `Retrying in ${delay / 1000}s...`);
      await sleep(delay);
    }
  }
};

export const isDatabaseHealthy = async (): Promise<boolean> => {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
};

export const isPgVectorAvailable = async (): Promise<boolean> => {
  try {
    const res = await pool.query(
      "SELECT 1 FROM pg_extension WHERE extname = 'vector' LIMIT 1"
    );
    return res.rowCount !== null && res.rowCount > 0;
  } catch {
    return false;
  }
};

export const closeDB = async (): Promise<void> => {
  await pool.end();
};

export default pool;
