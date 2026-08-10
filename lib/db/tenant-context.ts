import { sql } from 'drizzle-orm';
import { assertDbAvailable, db, type DB } from '@/lib/db';

export type TenantTransaction = DB;

/**
 * Runs tenant-sensitive work in one transaction under the non-bypass RLS role.
 * SET LOCAL and set_tenant_context are scoped to this transaction, so pooled
 * connections cannot leak tenant state into a later request.
 */
export async function withTenantContext<T>(
  firmId: number,
  work: (tx: TenantTransaction) => Promise<T>,
): Promise<T> {
  if (!Number.isSafeInteger(firmId) || firmId <= 0) {
    throw new Error('InvalidTenantContext');
  }

  assertDbAvailable();
  return db.transaction(async (tx: TenantTransaction) => {
    // A postgres/service connection may bypass RLS. Switching to the dedicated
    // NO-BYPASS role makes policy enforcement explicit for the whole callback.
    await tx.execute(sql.raw('SET LOCAL ROLE legal_agent_app'));
    await tx.execute(sql`SELECT private.set_tenant_context(${firmId})`);
    return work(tx);
  });
}
