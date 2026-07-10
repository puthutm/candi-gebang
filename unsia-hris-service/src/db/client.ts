import { drizzle } from 'drizzle-orm/pg-pool';
import pg from 'pg';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/hris_db',
});

export const db = drizzle(pool, { schema });
export type DbType = typeof db;
export * as schema from './schema.js';
