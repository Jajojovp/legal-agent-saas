import { beforeEach, describe, expect, it, vi } from 'vitest';

const { claimPaymentEvent, markPaymentEvent, applySubscriptionState, getMPSubscription } = vi.hoisted(() => ({
  claimPaymentEvent: vi.fn(), markPaymentEvent: vi.fn(),
  applySubscriptionState: vi.fn(), getMPSubscription: vi.fn(),
}));

vi.mock('@/lib/payments/repository', () => ({ claimPaymentEvent, markPaymentEvent, applySubscriptionState }));
vi.mock('@/lib/payments/mercadopago', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/payments/mercadopago')>();
  return { ...original, getMPSubscription, getPlanConfig: () => ({ planId: 'plan-1', price: 49, currency: 'USD' }) };
});

import { processMercadoPagoWebhook } from '@/lib/payments/webhook-service';

const event = {
  id: 42,
  live_mode: true,
  type: 'subscription_preapproval' as const,
  action: 'updated',
  date_created: '2026-08-10T00:00:00Z',
  data: { id: 'sub-1' },
};

describe('MercadoPago webhook processing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('acknowledges a duplicate without mutating a subscription', async () => {
    claimPaymentEvent.mockResolvedValue(null);
    getMPSubscription.mockResolvedValue({
      id: 'sub-1', status: 'authorized',
      external_reference: JSON.stringify({ user_id: 7, firm_id: 11, plan_tier: 'starter', plan_interval: 'monthly', currency: 'USD' }),
      auto_recurring: { transaction_amount: 49, currency_id: 'USD' },
    });
    await expect(processMercadoPagoWebhook(event, 'request-1')).resolves.toEqual({ duplicate: true });
    expect(getMPSubscription).toHaveBeenCalledWith('sub-1');
    expect(applySubscriptionState).not.toHaveBeenCalled();
  });

  it('uses authoritative provider data and rejects a mismatched price', async () => {
    claimPaymentEvent.mockResolvedValue(9);
    getMPSubscription.mockResolvedValue({
      id: 'sub-1', status: 'authorized',
      external_reference: JSON.stringify({ user_id: 7, firm_id: 11, plan_tier: 'starter', plan_interval: 'monthly', currency: 'USD' }),
      auto_recurring: { transaction_amount: 1, currency_id: 'USD' },
    });

    await expect(processMercadoPagoWebhook(event, 'request-2')).rejects.toThrow('ProviderPlanMismatch');
    expect(applySubscriptionState).not.toHaveBeenCalled();
    expect(markPaymentEvent).toHaveBeenCalledWith(11, 9, 'failed', 'ProviderPlanMismatch');
  });
});
