import { Pool } from "pg";
import { env } from "./env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_CONNECTION_TIMEOUT_MS,
});

export const query = pool.query.bind(pool);

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
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

export const closeDB = async (): Promise<void> => {
  await pool.end();
};

export default pool;
