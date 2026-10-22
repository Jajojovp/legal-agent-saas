import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import postgres from 'postgres';

const MIGRATIONS = ['0001_init_schema.sql', 'payments_001_subscriptions.sql', 'rls_multitenant_up.sql'] as const;

async function migrate() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) throw new Error('DATABASE_URL or POSTGRES_URL is required');
  const allowUnverifiedLocalTls = process.env.NODE_ENV !== 'production' && process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false';
  const client = postgres(connectionString, { ssl: { rejectUnauthorized: !allowUnverifiedLocalTls }, max: 1, prepare: false, connect_timeout: 10 });

  try {
    await client`CREATE TABLE IF NOT EXISTS app_schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
    for (const name of MIGRATIONS) {
      const [applied] = await client<{ name: string }[]>`SELECT name FROM app_schema_migrations WHERE name = ${name}`;
      if (applied) continue;
      const source = await readFile(join(process.cwd(), 'lib', 'db', 'migrations', name), 'utf8');
      await client.begin(async (transaction) => {
        await transaction.unsafe(source);
        await transaction`INSERT INTO app_schema_migrations (name) VALUES (${name})`;
      });
      console.log(`Applied ${name}`);
    }
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
});
