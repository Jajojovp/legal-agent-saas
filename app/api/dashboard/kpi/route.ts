import { NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/db/tenant-context';
import { leads, cases, tasks } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';

export async function GET() {
  try {
    const { userId, firmId } = await requireAuth();

    const counts = await withTenantContext(firmId, async (tx) => {
      const [leadCount] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.assignedTo, userId));

      const [caseCount] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(cases)
        .where(eq(cases.assignedAttorney, userId));

      const [taskCount] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(eq(tasks.assignedTo, userId));

      const [pendingTaskCount] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(sql`${tasks.assignedTo} = ${userId} AND ${tasks.isCompleted} = false`);

      return { leadCount, caseCount, taskCount, pendingTaskCount };
    });

    return NextResponse.json({
      kpi: {
        newLeads: Number(counts.leadCount.count),
        activeCases: Number(counts.caseCount.count),
        pendingTasks: Number(counts.pendingTaskCount.count),
        totalTasks: Number(counts.taskCount.count),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dashboard KPI error:', error);
    return NextResponse.json({ error: 'Failed to fetch KPI data' }, { status: 500 });
  }
}
