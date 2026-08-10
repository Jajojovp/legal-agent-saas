import { describe, expect, it } from 'vitest';
import { buildExternalReference, checkoutRequestSchema, mercadoPagoWebhookSchema, parseExternalReference } from '@/lib/payments/contracts';
import { createMPSubscription } from '@/lib/payments/mercadopago';

describe('payment contracts', () => {
  it('accepts only catalog identifiers at checkout', () => {
    expect(checkoutRequestSchema.safeParse({ planTier: 'professional', planInterval: 'monthly', currency: 'USD' }).success).toBe(true);
    expect(checkoutRequestSchema.safeParse({ planTier: 'professional', planInterval: 'monthly', currency: 'USD', amount: 1 }).success).toBe(false);
  });

  it('rejects malformed or unexpectedly-shaped webhook payloads', () => {
    expect(mercadoPagoWebhookSchema.safeParse({
      id: 123, live_mode: true, type: 'subscription_preapproval', action: 'updated',
      date_created: '2026-08-10T00:00:00Z', data: { id: 'preapproval-1' }, injected: true,
    }).success).toBe(false);
  });

  it('requires a server-issued firm and user binding in external_reference', () => {
    expect(parseExternalReference(JSON.stringify({ user_id: 7, firm_id: 11, plan_tier: 'starter', plan_interval: 'yearly', currency: 'CLP' }))).toEqual({
      userId: 7, firmId: 11, planTier: 'starter', planInterval: 'yearly', currency: 'CLP',
    });
    expect(() => parseExternalReference('{"user_id":7}')).toThrow();
  });

  it('round-trips every checkout identity and catalog field through MercadoPago', () => {
    const serialized = buildExternalReference({
      userId: 7, firmId: 11, planTier: 'professional', planInterval: 'monthly', currency: 'USD',
    });
    expect(parseExternalReference(serialized)).toEqual({
      userId: 7, firmId: 11, planTier: 'professional', planInterval: 'monthly', currency: 'USD',
    });
  });

  it('sends an external_reference that the webhook contract can parse', async () => {
    const originalFetch = global.fetch;
    let sentBody: Record<string, unknown> | undefined;
    global.fetch = (async (_url, init) => {
      sentBody = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ id: 'sub-1', init_point: 'https://mp.test/checkout' }), { status: 200 });
    }) as typeof fetch;
    try {
      await createMPSubscription({
        planTier: 'starter', planInterval: 'monthly', userEmail: 'owner@example.com',
        userId: '7', firmId: '11', amount: 49, currency: 'USD',
      });
      expect(parseExternalReference(sentBody?.external_reference)).toEqual({
        userId: 7, firmId: 11, planTier: 'starter', planInterval: 'monthly', currency: 'USD',
      });
    } finally {
      global.fetch = originalFetch;
    }
  });
});
