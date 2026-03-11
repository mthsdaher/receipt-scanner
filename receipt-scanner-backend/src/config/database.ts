import { Pool } from "pg";
import { env } from "./env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
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

export default pool;
