import { describe, it, expect } from 'vitest';
import {
  enrichJwtToken,
  buildSessionUser,
  parseAuthContext,
} from '@/lib/auth/context';

/**
 * Integration-style regression test: simulates the full NextAuth callback
 * chain (jwt -> session -> parseAuthContext) to make sure the three pure
 * helpers compose into the contract that route handlers rely on.
 */
describe('auth context end-to-end flow', () => {
  it('minting an auth context from a fresh sign-in', () => {
    // 1) `jwt` callback on first sign-in: receives the freshly returned user
    // from `authorize()` and the empty token object.
    const token = enrichJwtToken({ email: 'a@b.com' }, {
      id: '7',
      firmId: 42,
      role: 'owner',
      isActive: true,
    });

    expect(token.sub).toBe('7');
    expect(token.firmId).toBe(42);
    expect(token.role).toBe('owner');
    expect(token.isActive).toBe(true);

    // 2) `session` callback: builds session.user from the (now rich) token.
    const session = buildSessionUser({ user: { email: 'a@b.com' } }, token);
    const u = session.user as any;

    expect(u.id).toBe('7');
    expect(u.firmId).toBe(42);
    expect(u.role).toBe('owner');
    expect(u.isActive).toBe(true);

    // 3) Route handler calls requireAuth() -> parseAuthContext(session)
    const ctx = parseAuthContext(session);

    expect(ctx).not.toBeNull();
    expect(ctx!.userId).toBe(7);
    expect(ctx!.firmId).toBe(42);
    expect(ctx!.role).toBe('owner');
    expect(ctx!.isActive).toBe(true);
  });

  it('rejects inactive user across the full flow', () => {
    const token = enrichJwtToken({}, {
      id: '7', firmId: 1, role: 'attorney', isActive: false,
    });
    const session = buildSessionUser({ user: {} }, token);

    expect((session.user as any).isActive).toBe(false);
    expect(parseAuthContext(session)).toBeNull();
  });

  it('rejects user with no firm assignment across the full flow', () => {
    const token = enrichJwtToken({}, {
      id: '7', firmId: null, role: 'attorney', isActive: true,
    });
    const session = buildSessionUser({ user: {} }, token);
    const u = session.user as any;
    expect(u.firmId).toBeUndefined();
    // parseAuthContext requires firmId to be a finite number.
    expect(parseAuthContext(session)).toBeNull();
  });
});