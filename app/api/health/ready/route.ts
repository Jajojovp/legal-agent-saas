import { NextResponse } from 'next/server';

// Readiness probe: "is this instance configured to receive traffic?"
//
// Secret-safe: this probe only inspects whether the expected environment
// variables are *set* (boolean presence). It never reads or echoes their
// values — the response body only reports named checks as ok/missing,
// never the underlying string contents.
//
// IMPORTANT — config presence ≠ database up:
// This probe reports *configuration presence*. It intentionally does NOT
// perform a DB round-trip. A present connection-string variable only means
// the instance *knows where* the database lives; it does NOT assert the
// database is reachable or migrations are applied. The `db` payload field
// therefore uses `config-present` / `config-missing` (never `up`/`down`),
// and exposes `connectivity: 'not-verified'` so tooling can't misread a
// green readiness result as DB health. The deep DB health check procedure
// lives in docs/runbooks/deployments.md.
//
// The database connection string may be provided under any of these names.
// The order mirrors lib/db/index.ts (`DATABASE_URL || POSTGRES_URL`) plus
// POSTGRES_URL_NON_POOLING, the Vercel-exposed alias used by drizzle during
// migrations. The first one present wins; presence of ANY single alias is
// sufficient for the `db` check to pass.
const DB_URL_VARS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_URL_NON_POOLING',
] as const;

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Check = { name: string; status: 'ok' | 'missing' };

function has(name: string): Check {
  const value = process.env[name];
  return {
    name,
    status: value && value.length > 0 ? 'ok' : 'missing',
  };
}

export function GET() {
  // Core application config checks — each must be present.
  const checks: Check[] = [has('NEXTAUTH_SECRET'), has('NEXTAUTH_URL')];

  // Database config: individually report each candidate var (informational),
  // then derive a single resolved status that is ok iff at least one alias
  // is set, matching lib/db/index.ts precedence.
  const dbVarChecks: Check[] = DB_URL_VARS.map(has);
  const dbConfigPresent = dbVarChecks.some((c) => c.status === 'ok');

  const db = {
    name: 'db',
    // 'config-present' means a connection-string variable is set; it is NOT
    // a connectivity assertion. Use the deep DB health check (see
    // docs/runbooks/deployments.md) to verify the DB is actually up.
    status: dbConfigPresent ? 'config-present' : 'config-missing',
    candidates: dbVarChecks,
    connectivity: 'not-verified',
  };

  // The instance is considered "ready" only when core config AND a DB
  // connection-string variable are all present. This is a configuration
  // gate, NOT a connectivity gate.
  const ready =
    checks.every((c) => c.status === 'ok') && dbConfigPresent;

  return NextResponse.json(
    { status: ready ? 'ready' : 'not-ready', db, checks },
    {
      status: ready ? 200 : 503,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    },
  );
}