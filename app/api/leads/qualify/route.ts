import { NextRequest, NextResponse } from 'next/server';
import { qualifyLead } from '@/lib/ai/legal-ai-service';
import { withTenantContext } from '@/lib/db/tenant-context';
import { leads } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import { canModifyLead } from '@/lib/auth/authorization';

// P0-004: qualify enforces tenant + ownership (same rules as PATCH lead).
export async function POST(request: NextRequest) {
  try {
    const authCtx = await requireAuth();
    const body = await request.json();
    const { leadId, conversation } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const existing = await withTenantContext(authCtx.firmId, async (tx) => {
      const [row] = await tx
        .select()
        .from(leads)
        .where(eq(leads.id, leadId))
        .limit(1);
      return row;
    });

    if (!existing) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (!canModifyLead(authCtx, existing)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const qualification = await qualifyLead(conversation);

    const updatedLead = await withTenantContext(authCtx.firmId, async (tx) => {
      const [updated] = await tx
        .update(leads)
        .set({
          score: qualification.score,
          practiceArea: qualification.practiceArea as any,
          metadata: {
            aiQualification: qualification,
            qualifiedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(leads.id, leadId),
            eq(leads.firmId, authCtx.firmId)
          )
        )
        .returning();
      return updated;
    });

    return NextResponse.json({ lead: updatedLead, qualification });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Qualify lead error:', error);
    return NextResponse.json({ error: 'Failed to qualify lead' }, { status: 500 });
  }
}
