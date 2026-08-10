export type SubscriptionStatus = 'pending' | 'active' | 'past_due' | 'cancelled' | 'expired';

export function mapMercadoPagoStatus(status: string): SubscriptionStatus {
  switch (status) {
    case 'authorized': return 'active';
    case 'paused': return 'past_due';
    case 'cancelled': return 'cancelled';
    case 'expired': return 'expired';
    default: return 'pending';
  }
}

export function mayTransitionSubscription(current: SubscriptionStatus, next: SubscriptionStatus): boolean {
  if (current === next) return true;
  if (current === 'cancelled' || current === 'expired') return false;
  if (next === 'pending' && current !== 'pending') return false;
  return true;
}

export function mayReplaceFirmSubscription(input: {
  currentStatus: SubscriptionStatus;
  nextStatus: SubscriptionStatus;
  isLatestAttempt: boolean;
}): boolean {
  if (!input.isLatestAttempt || input.nextStatus !== 'active') return false;
  // This policy is used only when the provider subscription ID differs.
  // A latest checkout is a new commercial lifecycle and may therefore replace
  // a terminal predecessor. Same-provider events use mayTransitionSubscription.
  return true;
}
