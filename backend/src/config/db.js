import pg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER ,
  host: process.env.DB_HOST ,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, 
  port: parseInt(process.env.DB_PORT || "5432", 10),
  connectionTimeoutMillis: 2000, 
  idleTimeoutMillis: 5000, 
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client:", err.message);
});

pool
  .query("SELECT 1")
  .then(() => {
    console.log(
      "✅ CareTrack Clinical Database: Connection pool established successfully with PostgreSQL.",
    );
  })
  .catch((err) => {
    console.error(
      "❌ CRITICAL ERROR: Could not connect to PostgreSQL Database!",
    );
    console.error(`Reason: ${err.message}`);
    console.error(
      "Yordam: `backend/.env` faylida DB_PASSWORD to'g'ri yozilganini tekshiring.",
    );
  });

export const db = {

  async query(text, params = []) {
    return await pool.query(text, params);
  },

  getPool() {
    return pool;
  },
};
