import { mercadoPagoWebhookSchema, parseExternalReference } from './contracts';
import { getMPSubscription, getPlanConfig } from './mercadopago';
import { applySubscriptionState, claimPaymentEvent, markPaymentEvent } from './repository';
import { mapMercadoPagoStatus } from './subscription-state';

export async function processMercadoPagoWebhook(raw: unknown, requestId: string) {
  const event = mercadoPagoWebhookSchema.parse(raw);
  const resourceId = String(event.data.id);
  const eventId = String(event.id);
  const authoritative = await getMPSubscription(resourceId);
  if (authoritative.id !== resourceId) throw new Error('ProviderResourceMismatch');
  const reference = parseExternalReference(authoritative.external_reference);
  const claimedId = await claimPaymentEvent({
    firmId: reference.firmId, requestId, providerEventId: eventId, resourceId,
    eventType: event.type, action: event.action, payload: event,
  });
  if (!claimedId) return { duplicate: true };

  try {
    const expected = getPlanConfig({ planTier: reference.planTier, planInterval: reference.planInterval, currency: reference.currency });
    if (authoritative.auto_recurring.transaction_amount !== expected.price || authoritative.auto_recurring.currency_id !== expected.currency) {
      throw new Error('ProviderPlanMismatch');
    }

    const outcome = await applySubscriptionState({
      firmId: reference.firmId, userId: reference.userId, providerSubscriptionId: authoritative.id,
      providerStatus: authoritative.status, status: mapMercadoPagoStatus(authoritative.status),
      amount: expected.price, currency: expected.currency,
      planTier: reference.planTier, planInterval: reference.planInterval,
    });
    await markPaymentEvent(reference.firmId, claimedId, outcome === 'updated' || outcome === 'attempt_updated' ? 'processed' : 'ignored', outcome);
    return { processed: outcome === 'updated', outcome };
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 100) : 'UnknownPaymentError';
    await markPaymentEvent(reference.firmId, claimedId, 'failed', code);
    throw error;
  }
}
