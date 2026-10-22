import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addDocument, getDocuments, queryWithContext, searchDocuments } from '@/lib/ai/knowledge-base';
import { requireAuth } from '@/lib/auth/session';

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('add'), doc: z.object({ title: z.string().trim().min(1).max(200), content: z.string().trim().min(1).max(20_000), category: z.string().trim().min(1).max(80) }).strict() }).strict(),
  z.object({ action: z.literal('search'), query: z.string().trim().min(1).max(500) }).strict(),
  z.object({ action: z.literal('query'), question: z.string().trim().min(1).max(2_000), locale: z.enum(['es', 'en']).default('es') }).strict(),
]);

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 422 });
    if (parsed.data.action === 'add') {
      const document = await addDocument({ ...parsed.data.doc, firmId: auth.firmId }, auth.userId);
      return NextResponse.json({ document }, { status: 201 });
    }
    if (parsed.data.action === 'search') return NextResponse.json({ documents: await searchDocuments(parsed.data.query, auth.firmId) });
    return NextResponse.json({ response: await queryWithContext(parsed.data.question, auth.firmId, parsed.data.locale) });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error instanceof Error && error.message === 'KnowledgeLimitReached') return NextResponse.json({ error: 'Knowledge base limit reached' }, { status: 409 });
    console.error('Knowledge base error:', error);
    return NextResponse.json({ error: 'Failed to process knowledge base request' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const auth = await requireAuth();
    return NextResponse.json({ documents: await getDocuments(auth.firmId) });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
