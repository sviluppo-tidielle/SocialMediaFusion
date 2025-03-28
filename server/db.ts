import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

// Crea un pool di connessioni al database
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Esporta il client Drizzle
export const db = drizzle(pool);