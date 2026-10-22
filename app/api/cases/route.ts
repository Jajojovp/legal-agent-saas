import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { withTenantContext } from '@/lib/db/tenant-context';
import { cases } from '@/lib/db/schema';

const practiceAreas = ['personal-injury', 'family-law', 'criminal-defense', 'estate-planning', 'business-law', 'real-estate', 'immigration', 'employment-law', 'bankruptcy', 'intellectual-property'] as const;
const caseCreateSchema = z.object({
  clientName: z.string().trim().min(2).max(160),
  practiceArea: z.enum(practiceAreas),
  description: z.string().trim().max(4000).optional(),
  estimatedValue: z.coerce.number().nonnegative().max(99_999_999.99).optional(),
}).strict();

export async function GET() {
  try {
    const auth = await requireAuth();
    const scope = auth.role === 'owner' || auth.role === 'admin'
      ? eq(cases.firmId, auth.firmId)
      : and(eq(cases.firmId, auth.firmId), eq(cases.assignedAttorney, auth.userId));
    const firmCases = await withTenantContext(auth.firmId, (tx) =>
      tx.select().from(cases).where(scope).orderBy(desc(cases.createdAt))
    );
    return NextResponse.json({ cases: firmCases });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const parsed = caseCreateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    const created = await withTenantContext(auth.firmId, async (tx) => {
      const [record] = await tx.insert(cases).values({
        firmId: auth.firmId, assignedAttorney: auth.userId,
        caseNumber: `CASE-${auth.firmId}-${randomUUID().slice(0, 8).toUpperCase()}`,
        clientName: parsed.data.clientName, practiceArea: parsed.data.practiceArea,
        description: parsed.data.description || null,
        estimatedValue: parsed.data.estimatedValue === undefined ? null : parsed.data.estimatedValue.toFixed(2),
        status: 'intake',
      }).returning();
      return record;
    });
    return NextResponse.json({ case: created }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
  }
}
