import { NextRequest, NextResponse } from 'next/server';
import { verifyMPWebhook } from '@/lib/payments/mercadopago';
import { processMercadoPagoWebhook } from '@/lib/payments/webhook-service';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MP_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await request.json();
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (!xRequestId || xRequestId.length > 200) {
      return NextResponse.json({ error: 'Invalid request id' }, { status: 400 });
    }
    const isValid = await verifyMPWebhook(xSignature, xRequestId, String(body?.data?.id || ''));
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const result = await processMercadoPagoWebhook(body, xRequestId);
    return NextResponse.json({ received: true, ...result });
  } catch (error: unknown) {
    if (error instanceof ZodError) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    console.error('MP webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
