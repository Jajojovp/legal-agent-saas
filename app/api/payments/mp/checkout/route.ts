import { NextRequest, NextResponse } from 'next/server';
import { cancelMPSubscription, createMPSubscription, getPlanConfig } from '@/lib/payments/mercadopago';
import { requireAuth } from '@/lib/auth/session';
import { checkoutRequestSchema } from '@/lib/payments/contracts';
import { savePendingSubscription } from '@/lib/payments/repository';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const { userId, firmId, session } = await requireAuth();
    const input = checkoutRequestSchema.parse(await request.json());
    const planConfig = getPlanConfig(input);

    const { initPoint, subscriptionId } = await createMPSubscription({
      planTier: input.planTier,
      planInterval: input.planInterval,
      userEmail: (session.user as any)?.email || '',
      userId: String(userId),
      firmId: String(firmId),
      amount: planConfig.price,
      currency: planConfig.currency,
    });

    try {
      await savePendingSubscription({
        userId, firmId, providerSubscriptionId: subscriptionId,
        planTier: input.planTier, planInterval: input.planInterval,
        amount: planConfig.price, currency: planConfig.currency,
      });
    } catch (error) {
      // Compensate a provider-side creation if local persistence fails.
      await cancelMPSubscription(subscriptionId).catch(() => undefined);
      throw error;
    }

    return NextResponse.json({ url: initPoint, subscriptionId });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error instanceof ZodError || (error instanceof Error && error.message === 'PaymentPlanNotConfigured')) {
      return NextResponse.json({ error: 'Invalid or unavailable plan' }, { status: 400 });
    }
    console.error('MP checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
