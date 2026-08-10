import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/db/tenant-context';
import { leads } from '@/lib/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import { canModifyLead } from '@/lib/auth/authorization';
import { leadCreateSchema, leadUpdateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const authCtx = await requireAuth();

    const scope = authCtx.role === 'owner' || authCtx.role === 'admin'
      ? eq(leads.firmId, authCtx.firmId)
      : and(
          eq(leads.firmId, authCtx.firmId),
          eq(leads.assignedTo, authCtx.userId)
        );

    const firmLeads = await withTenantContext(authCtx.firmId, (tx) =>
      tx.select()
        .from(leads)
        .where(scope)
        .orderBy(desc(leads.createdAt))
    );

    return NextResponse.json({ leads: firmLeads });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Get leads error:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCtx = await requireAuth();
    const body = await request.json();

    const parsed = leadCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const newLead = await withTenantContext(authCtx.firmId, async (tx) => {
      const [created] = await tx
        .insert(leads)
        .values({
          ...parsed.data,
          firmId: authCtx.firmId,
          assignedTo: authCtx.userId,
          source: parsed.data.source || 'website',
          status: 'new',
          score: 0,
        })
        .returning();
      return created;
    });

    return NextResponse.json({ lead: newLead }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Create lead error:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}

// P0-004: PATCH must enforce tenant + ownership. We fetch the existing lead
// first, run `canModifyLead(authCtx, lead)` (which checks firmId AND either
// ownership or an elevated role), and only then apply the update — still
// constrained to the same firm via the WHERE clause.
export async function PATCH(request: NextRequest) {
  try {
    const authCtx = await requireAuth();
    const body = await request.json();

    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, ...updates } = parsed.data;

    const result = await withTenantContext(authCtx.firmId, async (tx) => {
      const [existing] = await tx
        .select()
        .from(leads)
        .where(eq(leads.id, id))
        .limit(1);

      if (!existing) return { outcome: 'not_found' as const };
      if (!canModifyLead(authCtx, existing)) return { outcome: 'forbidden' as const };

      const [updatedLead] = await tx
        .update(leads)
        .set({ ...updates, updatedAt: new Date() })
        .where(
          and(
            eq(leads.id, id),
            eq(leads.firmId, authCtx.firmId)
          )
        )
        .returning();
      return updatedLead
        ? { outcome: 'updated' as const, updatedLead }
        : { outcome: 'not_found' as const };
    });

    if (result.outcome === 'not_found') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    if (result.outcome === 'forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ lead: result.updatedLead });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Update lead error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
