import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/db/tenant-context';
import { cases } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';

export async function GET() {
  try {
    const { userId, firmId } = await requireAuth();

    const firmCases = await withTenantContext(firmId, (tx) =>
      tx.select()
        .from(cases)
        .where(eq(cases.assignedAttorney, userId))
        .orderBy(desc(cases.createdAt))
    );

    return NextResponse.json({ cases: firmCases });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get cases error:', error);
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}
