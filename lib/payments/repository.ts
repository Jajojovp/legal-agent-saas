import { and, desc, eq, or } from 'drizzle-orm';
import { withTenantContext } from '@/lib/db/tenant-context';
import { paymentEvents, subscriptionCheckoutAttempts, subscriptions } from '@/lib/db/schema';
import type { SubscriptionStatus } from './subscription-state';

export async function savePendingSubscription(input: {
  firmId: number; userId: number; providerSubscriptionId: string;
  planTier: string; planInterval: string; currency: string; amount: number;
}) {
  await withTenantContext(input.firmId, (tx) =>
    tx.insert(subscriptionCheckoutAttempts).values({
      ...input, amount: String(input.amount), status: 'pending', updatedAt: new Date(),
    }).onConflictDoNothing(),
  );
}

export async function claimPaymentEvent(input: {
  firmId: number; requestId: string; providerEventId: string; resourceId: string;
  eventType: string; action: string; payload: unknown;
}): Promise<number | null> {
  return withTenantContext(input.firmId, async (tx) => {
    const [row] = await tx.insert(paymentEvents).values(input).onConflictDoNothing().returning({ id: paymentEvents.id });
    if (row) return row.id;

  // A provider retry may safely reclaim a previously failed delivery. The
  // conditional update is atomic, so concurrent retries cannot both process it.
    const [retry] = await tx.update(paymentEvents).set({
      processingStatus: 'received', errorCode: null, processedAt: null,
    }).where(and(
      eq(paymentEvents.firmId, input.firmId),
      eq(paymentEvents.provider, 'mercadopago'),
      eq(paymentEvents.processingStatus, 'failed'),
      or(eq(paymentEvents.requestId, input.requestId), eq(paymentEvents.providerEventId, input.providerEventId)),
    )).returning({ id: paymentEvents.id });
    return retry?.id ?? null;
  });
}

export async function markPaymentEvent(firmId: number, id: number, status: 'processed' | 'failed' | 'ignored', errorCode?: string) {
  await withTenantContext(firmId, (tx) => tx.update(paymentEvents)
    .set({ processingStatus: status, errorCode, processedAt: new Date() })
    .where(and(eq(paymentEvents.id, id), eq(paymentEvents.firmId, firmId))));
}

export async function applySubscriptionState(input: {
  firmId: number; userId: number; providerSubscriptionId: string; providerStatus: string;
  status: SubscriptionStatus; amount: number; currency: string; planTier: string; planInterval: string;
}) {
  return withTenantContext(input.firmId, async (tx) => {
    const [attempt] = await tx.select({ id: subscriptionCheckoutAttempts.id })
      .from(subscriptionCheckoutAttempts)
      .where(and(eq(subscriptionCheckoutAttempts.firmId, input.firmId), eq(subscriptionCheckoutAttempts.providerSubscriptionId, input.providerSubscriptionId)))
      .limit(1);
    if (!attempt) return 'not_found' as const;

    await tx.update(subscriptionCheckoutAttempts).set({ status: input.status, updatedAt: new Date() })
      .where(eq(subscriptionCheckoutAttempts.id, attempt.id));

    const [latest] = await tx.select({ id: subscriptionCheckoutAttempts.id })
      .from(subscriptionCheckoutAttempts).where(eq(subscriptionCheckoutAttempts.firmId, input.firmId))
      .orderBy(desc(subscriptionCheckoutAttempts.createdAt), desc(subscriptionCheckoutAttempts.id)).limit(1);
    const [current] = await tx.select({ id: subscriptions.id, status: subscriptions.status, providerSubscriptionId: subscriptions.providerSubscriptionId })
      .from(subscriptions).where(eq(subscriptions.firmId, input.firmId)).limit(1);

    if (!current) {
      if (input.status !== 'active') return 'attempt_updated' as const;
      await tx.insert(subscriptions).values({
        firmId: input.firmId, userId: input.userId, providerSubscriptionId: input.providerSubscriptionId,
        planTier: input.planTier, planInterval: input.planInterval, currency: input.currency,
        amount: String(input.amount), status: input.status, providerStatus: input.providerStatus,
      });
      return 'updated' as const;
    }

    const { mayTransitionSubscription } = await import('./subscription-state');
    if (current.providerSubscriptionId !== input.providerSubscriptionId) {
      const { mayReplaceFirmSubscription } = await import('./subscription-state');
      if (!mayReplaceFirmSubscription({ currentStatus: current.status as SubscriptionStatus, nextStatus: input.status, isLatestAttempt: latest?.id === attempt.id })) {
        return 'stale' as const;
      }
    } else if (!mayTransitionSubscription(current.status as SubscriptionStatus, input.status)) return 'stale' as const;

    await tx.update(subscriptions).set({
      status: input.status, providerStatus: input.providerStatus,
      userId: input.userId, providerSubscriptionId: input.providerSubscriptionId,
      planTier: input.planTier, planInterval: input.planInterval,
      amount: String(input.amount), currency: input.currency, updatedAt: new Date(),
    }).where(eq(subscriptions.id, current.id));
    return 'updated' as const;
  });
}
