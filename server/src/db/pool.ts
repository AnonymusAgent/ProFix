import pg from 'pg';
import { config, isDbConfigured } from '../config.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

/** Allow tests (pg-mem) or custom setups to inject a pool. */
export function setPool(custom: pg.Pool | null) {
  pool = custom;
}

export function getPool(): pg.Pool {
  if (pool) return pool;
  if (!isDbConfigured()) {
    const err = new Error('DATABASE_URL is not configured. See server/.env.example and the Neon setup guide in README.md.');
    (err as Error & { code?: string }).code = 'DB_NOT_CONFIGURED';
    throw err;
  }
  const url = config.databaseUrl;
  const needsSsl = /neon\.tech|sslmode=require/.test(url);
  pool = new Pool({
    connectionString: url,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
  pool.on('error', (e) => console.error('[db] pool error:', e.message));
  return pool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<pg.QueryResult<T>> {
  const client = getPool();
  return client.query<T>(text, params as unknown[]);
}

export async function checkDb(): Promise<'connected' | 'not-configured' | 'error'> {
  if (!isDbConfigured() && !pool) return 'not-configured';
  try {
    await query('SELECT 1');
    return 'connected';
  } catch {
    return pool && !isDbConfigured() ? 'connected' : 'error';
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
