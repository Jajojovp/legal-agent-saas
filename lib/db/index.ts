import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const allowUnverifiedLocalTls =
  process.env.NODE_ENV !== 'production' &&
  process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false';

if (!connectionString) {
  console.warn('DATABASE_URL not configured. Running without database.');
}

const client = connectionString
  ? postgres(connectionString, {
      // Fail closed in production. Local development may explicitly opt out
      // for a self-signed database certificate, but production never may.
      ssl: { rejectUnauthorized: !allowUnverifiedLocalTls },
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    })
  : null;

export const isDbAvailable = client !== null;

export const db = client ? drizzle(client, { schema }) : ({} as any);
export type DB = typeof db;

/**
 * Human-callable diagnostic used by route handlers / auth helpers when they
 * want a clear signal that a request cannot be served without the database.
 * Throws a sentinel `DatabaseUnavailable` error so outer layers (e.g. the
 * NextAuth route wrapper) can convert it to a `503 Service Unavailable`
 * response without masking genuine runtime failures with a different shape.
 */
export function assertDbAvailable(): void {
  if (!isDbAvailable) {
    throw new Error('DatabaseUnavailable');
  }
}
