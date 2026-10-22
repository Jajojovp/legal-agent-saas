import postgres from 'postgres';

/**
 * Read-only integration check for the tenant RLS role. It refuses to connect
 * unless the operator names the exact expected staging hostname.
 * Run: STAGING_DATABASE_URL=... STAGING_DATABASE_HOST=... npm run db:test-rls:staging
 */
const connectionString = process.env.STAGING_DATABASE_URL;
const expectedHost = process.env.STAGING_DATABASE_HOST?.toLowerCase();

if (!connectionString || !expectedHost) {
  throw new Error('Set STAGING_DATABASE_URL and STAGING_DATABASE_HOST to the exact staging database.');
}

const parsed = new URL(connectionString);
if (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:') {
  throw new Error('Staging database URL must use PostgreSQL.');
}
if (parsed.hostname.toLowerCase() !== expectedHost) {
  throw new Error('Refusing database connection: URL hostname does not match STAGING_DATABASE_HOST.');
}

const sql = postgres(connectionString, {
  max: 1,
  connect_timeout: 10,
  idle_timeout: 5,
  prepare: false,
  ssl: { rejectUnauthorized: true },
});

try {
  const firms = await sql<{ id: number }[]>`
    SELECT id FROM public.law_firms ORDER BY id LIMIT 2
  `;
  if (firms.length < 2) {
    throw new Error('RLS staging check requires two existing law_firms; no data was changed.');
  }

  const [firmA, firmB] = firms.map((firm) => Number(firm.id));
  const fixtures = await sql<{ table_name: string; count: number }[]>`
    SELECT 'leads' AS table_name, count(*)::int AS count FROM public.leads WHERE firm_id = ${firmB}
    UNION ALL
    SELECT 'cases', count(*)::int FROM public.cases WHERE firm_id = ${firmB}
    UNION ALL
    SELECT 'tasks', count(*)::int FROM public.tasks WHERE firm_id = ${firmB}
  `;
  if (fixtures.some((fixture) => Number(fixture.count) < 1)) {
    throw new Error('RLS staging check requires at least one firm-B fixture in leads, cases, and tasks.');
  }

  const result = await sql.begin(async (tx) => {
    await tx.unsafe('SET TRANSACTION READ ONLY');
    await tx.unsafe('SET LOCAL ROLE legal_agent_app');

    const withoutContext = await tx<{ count: number }[]>`
      SELECT count(*)::int AS count FROM public.law_firms
    `;
    await tx`SELECT private.set_tenant_context(${firmA})`;

    const ownFirm = await tx<{ count: number }[]>`
      SELECT count(*)::int AS count FROM public.law_firms WHERE id = ${firmA}
    `;
    const otherFirm = await tx<{ count: number }[]>`
      SELECT count(*)::int AS count FROM public.law_firms WHERE id = ${firmB}
    `;
    const crossTenant = await tx<{ table_name: string; count: number }[]>`
      SELECT 'leads' AS table_name, count(*)::int AS count FROM public.leads WHERE firm_id = ${firmB}
      UNION ALL
      SELECT 'cases', count(*)::int FROM public.cases WHERE firm_id = ${firmB}
      UNION ALL
      SELECT 'tasks', count(*)::int FROM public.tasks WHERE firm_id = ${firmB}
    `;

    return {
      noContextFirmRows: Number(withoutContext[0]?.count ?? -1),
      ownFirmRows: Number(ownFirm[0]?.count ?? -1),
      otherFirmRows: Number(otherFirm[0]?.count ?? -1),
      crossTenantRows: crossTenant.map((row) => ({
        table: row.table_name,
        count: Number(row.count),
      })),
    };
  });

  if (
    result.noContextFirmRows !== 0 ||
    result.ownFirmRows !== 1 ||
    result.otherFirmRows !== 0 ||
    result.crossTenantRows.some((row) => row.count !== 0)
  ) {
    throw new Error(`RLS isolation assertion failed: ${JSON.stringify(result)}`);
  }

  console.log('RLS staging read-only verification passed:', JSON.stringify(result));
} finally {
  await sql.end({ timeout: 5 });
}
