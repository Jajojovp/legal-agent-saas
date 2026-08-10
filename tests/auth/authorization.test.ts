import { describe, it, expect } from 'vitest';
import {
  canModifyLead,
  assertFirmScope,
  resolveFirmId,
  isInternalModeAllowed,
} from '@/lib/auth/authorization';
import type { AuthContext } from '@/lib/auth/context';

function ctx(
  overrides: Partial<AuthContext> = {}
): AuthContext {
  return {
    userId: 7,
    firmId: 42,
    role: 'attorney',
    isActive: true,
    session: { user: { id: '7' } } as any,
    ...overrides,
  };
}

describe('canModifyLead - tenant + ownership filter', () => {
  it('allows owner of lead in same firm', () => {
    const c = ctx({ userId: 7, firmId: 42, role: 'attorney' });
    const lead = { id: 1, firmId: 42, assignedTo: 7 } as any;
    expect(canModifyLead(c, lead)).toBe(true);
  });

  it('denies lead from a different firm (cross-tenant)', () => {
    const c = ctx({ userId: 7, firmId: 42, role: 'attorney' });
    const lead = { id: 1, firmId: 99, assignedTo: 7 } as any;
    expect(canModifyLead(c, lead)).toBe(false);
  });

  it('denies lead in same firm but assigned to another attorney', () => {
    const c = ctx({ userId: 7, firmId: 42, role: 'attorney' });
    const lead = { id: 1, firmId: 42, assignedTo: 8 } as any;
    expect(canModifyLead(c, lead)).toBe(false);
  });

  it('allows owner role to modify any lead in their firm', () => {
    const c = ctx({ userId: 7, firmId: 42, role: 'owner' });
    const lead = { id: 1, firmId: 42, assignedTo: 99 } as any;
    expect(canModifyLead(c, lead)).toBe(true);
  });

  it('allows admin role to modify any lead in their firm', () => {
    const c = ctx({ userId: 7, firmId: 42, role: 'admin' });
    const lead = { id: 1, firmId: 42, assignedTo: 99 } as any;
    expect(canModifyLead(c, lead)).toBe(true);
  });

  it('denies owner role for cross-tenant lead', () => {
    const c = ctx({ userId: 7, firmId: 42, role: 'owner' });
    const lead = { id: 1, firmId: 99, assignedTo: 7 } as any;
    expect(canModifyLead(c, lead)).toBe(false);
  });

  it('denies when lead has no firmId', () => {
    const c = ctx({ firmId: 42, role: 'owner' });
    const lead = { id: 1, firmId: null, assignedTo: 7 } as any;
    expect(canModifyLead(c, lead)).toBe(false);
  });

  it('denies inactive user even when owner', () => {
    const c = ctx({ firmId: 42, role: 'owner', isActive: false });
    const lead = { id: 1, firmId: 42, assignedTo: 7 } as any;
    expect(canModifyLead(c, lead)).toBe(false);
  });
});

describe('assertFirmScope', () => {
  it('returns true when requested firmId equals context firmId', () => {
    expect(assertFirmScope(ctx({ firmId: 42 }), 42)).toBe(true);
  });

  it('returns false when requested firmId is different (cross-tenant)', () => {
    expect(assertFirmScope(ctx({ firmId: 42 }), 99)).toBe(false);
  });

  it('returns true when requested firmId is null (no override requested)', () => {
    expect(assertFirmScope(ctx({ firmId: 42 }), null)).toBe(true);
  });

  it('returns true when requested firmId is undefined', () => {
    expect(assertFirmScope(ctx({ firmId: 42 }), undefined)).toBe(true);
  });
});

describe('resolveFirmId - always derive from context, never body/query', () => {
  it('returns context firmId when no requested firmId provided', () => {
    expect(resolveFirmId(ctx({ firmId: 42 }), undefined)).toBe(42);
  });

  it('returns context firmId and ignores mismatched body firmId', () => {
    expect(resolveFirmId(ctx({ firmId: 42 }), 99)).toBe(42);
  });

  it('returns context firmId when body firmId matches', () => {
    expect(resolveFirmId(ctx({ firmId: 42 }), 42)).toBe(42);
  });
});

describe('isInternalModeAllowed - P0-005 restrict internal mode', () => {
  it('allows public mode without auth context', () => {
    expect(isInternalModeAllowed(null, 'public', undefined)).toBe(true);
  });

  it('denies internal mode without auth context', () => {
    expect(isInternalModeAllowed(null, 'internal', undefined)).toBe(false);
  });

  it('allows internal mode when authenticated and no firmId override', () => {
    expect(isInternalModeAllowed(ctx({ firmId: 42 }), 'internal', undefined)).toBe(true);
  });

  it('allows internal mode when firmId override matches context firm', () => {
    expect(isInternalModeAllowed(ctx({ firmId: 42 }), 'internal', 42)).toBe(true);
  });

  it('denies internal mode when firmId override differs from context firm (cross-tenant)', () => {
    expect(isInternalModeAllowed(ctx({ firmId: 42 }), 'internal', 99)).toBe(false);
  });

  it('denies internal mode for inactive user', () => {
    expect(
      isInternalModeAllowed(ctx({ firmId: 42, isActive: false }), 'internal', undefined)
    ).toBe(false);
  });

  it('allows unknown mode (treated as public)', () => {
    expect(isInternalModeAllowed(null, undefined, undefined)).toBe(true);
    expect(isInternalModeAllowed(ctx({ firmId: 42 }), 'foo', 99)).toBe(true);
  });
});