import { describe, expect, it } from 'vitest';
import { mapMercadoPagoStatus, mayReplaceFirmSubscription, mayTransitionSubscription } from '@/lib/payments/subscription-state';

describe('subscription state policy', () => {
  it('maps only known provider states and fails closed for unknown states', () => {
    expect(mapMercadoPagoStatus('authorized')).toBe('active');
    expect(mapMercadoPagoStatus('paused')).toBe('past_due');
    expect(mapMercadoPagoStatus('cancelled')).toBe('cancelled');
    expect(mapMercadoPagoStatus('future_provider_value')).toBe('pending');
  });

  it('does not reactivate terminal subscriptions from stale events', () => {
    expect(mayTransitionSubscription('cancelled', 'active')).toBe(false);
    expect(mayTransitionSubscription('expired', 'active')).toBe(false);
    expect(mayTransitionSubscription('active', 'cancelled')).toBe(true);
  });

  it('never replaces an active subscription with a pending checkout or an old provider event', () => {
    expect(mayReplaceFirmSubscription({ currentStatus: 'active', nextStatus: 'pending', isLatestAttempt: true })).toBe(false);
    expect(mayReplaceFirmSubscription({ currentStatus: 'active', nextStatus: 'active', isLatestAttempt: false })).toBe(false);
    expect(mayReplaceFirmSubscription({ currentStatus: 'active', nextStatus: 'active', isLatestAttempt: true })).toBe(true);
  });

  it('allows a new latest checkout to replace a terminal subscription', () => {
    expect(mayReplaceFirmSubscription({ currentStatus: 'cancelled', nextStatus: 'active', isLatestAttempt: true })).toBe(true);
    expect(mayReplaceFirmSubscription({ currentStatus: 'expired', nextStatus: 'active', isLatestAttempt: true })).toBe(true);
  });

  it('still rejects reactivation events for the same terminal provider subscription', () => {
    expect(mayTransitionSubscription('cancelled', 'active')).toBe(false);
    expect(mayTransitionSubscription('expired', 'active')).toBe(false);
  });
});
