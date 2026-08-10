import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument, extractTextFromFile } from '@/lib/ai/document-service';
import { requireAuth } from '@/lib/auth/session';

// P0-003: document analysis is an authenticated feature.
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;
    const locale = (formData.get('locale') as string) || 'es';

    let documentText = text || '';

    if (file) {
      documentText = await extractTextFromFile(file);
    }

    if (!documentText) {
      return NextResponse.json({ error: 'No text or file provided' }, { status: 400 });
    }

    const analysis = await analyzeDocument(documentText.slice(0, 10000), locale);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Document analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze document' }, { status: 500 });
  }
}