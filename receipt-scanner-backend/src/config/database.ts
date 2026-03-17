import { Pool } from "pg";
import pgvector from "pgvector/pg";
import { env } from "./env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
});

// Register pgvector types for each new connection (required for vector columns)
pool.on("connect", (client) => {
  pgvector.registerTypes(client).catch((err) => {
    console.error("[database] pgvector registration failed:", err);
  });
});

export const query = pool.query.bind(pool);
export { pgvector };

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    try {
      await pgvector.registerTypes(client);
    } catch (pgvErr) {
      console.warn("[database] pgvector not available (run migration 002 if using AI features):", (pgvErr as Error).message);
    }
    client.release();
    console.log("PostgreSQL Connected!");
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
    throw error;
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
