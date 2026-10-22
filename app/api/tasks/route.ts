import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { withTenantContext } from '@/lib/db/tenant-context';
import { cases, tasks } from '@/lib/db/schema';

const taskCreateSchema = z.object({
  title: z.string().trim().min(2).max(240),
  description: z.string().trim().max(4000).optional(),
  dueDate: z.string().datetime({ offset: true }).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  caseId: z.number().int().positive().optional(),
}).strict();

export async function GET() {
  try {
    const auth = await requireAuth();
    const scope = auth.role === 'owner' || auth.role === 'admin'
      ? eq(tasks.firmId, auth.firmId)
      : and(eq(tasks.firmId, auth.firmId), eq(tasks.assignedTo, auth.userId));
    const userTasks = await withTenantContext(auth.firmId, (tx) =>
      tx.select().from(tasks).where(scope).orderBy(desc(tasks.createdAt))
    );
    return NextResponse.json({ tasks: userTasks });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const parsed = taskCreateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    const created = await withTenantContext(auth.firmId, async (tx) => {
      if (parsed.data.caseId) {
        const [ownedCase] = await tx.select({ id: cases.id }).from(cases)
          .where(and(eq(cases.id, parsed.data.caseId), eq(cases.firmId, auth.firmId))).limit(1);
        if (!ownedCase) return null;
      }
      const [record] = await tx.insert(tasks).values({
        firmId: auth.firmId, assignedTo: auth.userId, caseId: parsed.data.caseId || null,
        title: parsed.data.title, description: parsed.data.description || null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        priority: parsed.data.priority, isCompleted: false,
      }).returning();
      return record;
    });
    if (!created) return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    return NextResponse.json({ task: created }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
