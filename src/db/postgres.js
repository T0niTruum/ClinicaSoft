import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required in .env');
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

process.on('SIGINT', async () => {
  await pool.end();
  process.exit();
});
