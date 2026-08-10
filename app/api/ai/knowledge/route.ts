import { NextRequest, NextResponse } from 'next/server';
import { addDocument, getDocuments, searchDocuments, queryWithContext } from '@/lib/ai/knowledge-base';
import { requireAuth } from '@/lib/auth/session';
import { resolveFirmId } from '@/lib/auth/authorization';

function toFirmIdNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

// P0-003: every knowledge-base read/write is authenticated and scoped to the
// caller's firm. `firmId` is always derived from the auth context.
export async function POST(request: NextRequest) {
  try {
    const authCtx = await requireAuth();
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'add': {
        const firmId = resolveFirmId(authCtx, toFirmIdNumber(data.firmId));
        addDocument({
          ...(data.doc as any),
          firmId,
        });
        return NextResponse.json({ success: true });
      }
      case 'search': {
        const firmId = resolveFirmId(authCtx, toFirmIdNumber(data.firmId));
        const docs = searchDocuments(data.query, firmId);
        return NextResponse.json({ documents: docs });
      }
      case 'query': {
        const firmId = resolveFirmId(authCtx, toFirmIdNumber(data.firmId));
        const response = await queryWithContext(data.question, firmId, data.locale);
        return NextResponse.json({ response });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Knowledge base error:', error);
    return NextResponse.json({ error: 'Failed to process knowledge base request' }, { status: 500 });
  }
}

// P0-003: GET documents is authenticated and scoped to the caller's firm. Any
// `?firmId=` query string is ignored — context wins.
export async function GET(request: NextRequest) {
  try {
    const authCtx = await requireAuth();
    const { searchParams } = new URL(request.url);
    // Intentionally ignore the user-supplied firmId; never trust query string.
    void searchParams.get('firmId');
    const docs = getDocuments(authCtx.firmId);
    return NextResponse.json({ documents: docs });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Knowledge base GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}