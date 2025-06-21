import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { config } from '../config/environment';
import type { Database } from './schema';

let db: Kysely<Database> | null = null;
let pool: Pool | null = null;

export function getDb(): Kysely<Database> {
  if (!db) {
    pool = new Pool({
      connectionString: config.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      // SSL configuration for production
      ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });

    // Log pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
    });

    db = new Kysely<Database>({
      dialect: new PostgresDialect({
        pool,
      }),
      log(event) {
        if (config.NODE_ENV === 'development') {
          if (event.level === 'query') {
            console.log('Query:', event.query.sql);
            console.log('Parameters:', event.query.parameters);
          }
        }
      },
    });
  }

  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
    pool = null;
  }
}

// Helper function for transactions
export async function transaction<T>(
  fn: (trx: Kysely<Database>) => Promise<T>
): Promise<T> {
  const database = getDb();
  return await database.transaction().execute(fn);
}