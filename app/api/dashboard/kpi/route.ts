import { NextResponse } from 'next/server';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import { withTenantContext } from '@/lib/db/tenant-context';
import { cases, leads, tasks } from '@/lib/db/schema';

export async function GET() {
  try {
    const auth = await requireAuth();
    const elevated = auth.role === 'owner' || auth.role === 'admin';

    const workspace = await withTenantContext(auth.firmId, async (tx) => {
      const leadScope = elevated
        ? eq(leads.firmId, auth.firmId)
        : and(eq(leads.firmId, auth.firmId), eq(leads.assignedTo, auth.userId));
      const caseScope = elevated
        ? eq(cases.firmId, auth.firmId)
        : and(eq(cases.firmId, auth.firmId), eq(cases.assignedAttorney, auth.userId));
      const taskScope = elevated
        ? eq(tasks.firmId, auth.firmId)
        : and(eq(tasks.firmId, auth.firmId), eq(tasks.assignedTo, auth.userId));

      const [leadCount, caseCount, taskCount, recentLeads, recentCases, upcomingTasks] = await Promise.all([
        tx.select({ count: sql<number>`count(*)` }).from(leads).where(and(leadScope, inArray(leads.status, ['new', 'contacted', 'qualified', 'consultation-scheduled']))),
        tx.select({ count: sql<number>`count(*)` }).from(cases).where(and(caseScope, inArray(cases.status, ['intake', 'active', 'pending']))),
        tx.select({ count: sql<number>`count(*)` }).from(tasks).where(and(taskScope, eq(tasks.isCompleted, false))),
        tx.select({ id: leads.id, name: leads.name, practiceArea: leads.practiceArea, status: leads.status, score: leads.score, createdAt: leads.createdAt })
          .from(leads).where(leadScope).orderBy(desc(leads.createdAt)).limit(4),
        tx.select({ id: cases.id, caseNumber: cases.caseNumber, clientName: cases.clientName, practiceArea: cases.practiceArea, status: cases.status, updatedAt: cases.updatedAt })
          .from(cases).where(caseScope).orderBy(desc(cases.updatedAt)).limit(4),
        tx.select({ id: tasks.id, caseId: tasks.caseId, title: tasks.title, dueDate: tasks.dueDate, priority: tasks.priority })
          .from(tasks).where(and(taskScope, eq(tasks.isCompleted, false)))
          .orderBy(asc(tasks.dueDate), desc(tasks.createdAt)).limit(6),
      ]);

      return {
        kpi: {
          newLeads: Number(leadCount[0]?.count ?? 0),
          activeCases: Number(caseCount[0]?.count ?? 0),
          pendingTasks: Number(taskCount[0]?.count ?? 0),
        },
        recentLeads,
        recentCases,
        upcomingTasks,
      };
    });

    return NextResponse.json(workspace);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Dashboard workspace error:', error);
    return NextResponse.json({ error: 'Failed to load workspace' }, { status: 500 });
  }
}
