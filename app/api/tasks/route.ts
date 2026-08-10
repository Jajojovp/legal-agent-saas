import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/db/tenant-context';
import { tasks } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';

export async function GET() {
  try {
    const { userId, firmId } = await requireAuth();

    const userTasks = await withTenantContext(firmId, (tx) =>
      tx.select()
        .from(tasks)
        .where(eq(tasks.assignedTo, userId))
        .orderBy(desc(tasks.createdAt))
    );

    return NextResponse.json({ tasks: userTasks });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
