import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument, extractTextFromFile } from '@/lib/ai/document-service';
import { requireAuth } from '@/lib/auth/session';

const MAX_UPLOAD_BYTES = 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(['text/plain']);

// P0-003: document analysis is an authenticated feature.
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'Document exceeds the 1 MB limit' }, { status: 413 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;
    const locale = (formData.get('locale') as string) || 'es';

    let documentText = text || '';

    if (file) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json({ error: 'Document exceeds the 1 MB limit' }, { status: 413 });
      }
      if (!ALLOWED_FILE_TYPES.has(file.type)) {
        return NextResponse.json({ error: 'Only plain-text documents are supported' }, { status: 415 });
      }
      documentText = await extractTextFromFile(file);
    }

    if (!documentText.trim()) {
      return NextResponse.json({ error: 'No text or file provided' }, { status: 400 });
    }

    if (documentText.length > 10000) {
      return NextResponse.json({ error: 'Document text exceeds the 10,000 character limit' }, { status: 413 });
    }

    const analysis = await analyzeDocument(documentText, locale === 'en' ? 'en' : 'es');

    return NextResponse.json({ analysis });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Document analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 });
  }
}
