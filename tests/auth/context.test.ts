import { describe, it, expect } from 'vitest';
import {
  enrichJwtToken,
  buildSessionUser,
  parseAuthContext,
} from '@/lib/auth/context';

describe('enrichJwtToken', () => {
  it('injects firmId, role and isActive from user record into token', () => {
    const token = { sub: undefined as unknown as string, email: 'a@b.com' };
    const user = {
      id: '7',
      firmId: 42,
      role: 'owner',
      isActive: true,
    } as any;

    const result = enrichJwtToken(token, user);

    expect(result.sub).toBe('7');
    expect((result as any).firmId).toBe(42);
    expect((result as any).role).toBe('owner');
    expect((result as any).isActive).toBe(true);
  });

  it('preserves existing token fields', () => {
    const token = { sub: '1', email: 'a@b.com', extra: 'kept' };
    const user = { id: '7', firmId: 5, role: 'attorney', isActive: true } as any;

    const result = enrichJwtToken(token, user) as any;

    expect(result.email).toBe('a@b.com');
    expect(result.extra).toBe('kept');
  });

  it('coerces null isActive to false', () => {
    const token = { sub: undefined as unknown as string };
    const user = { id: '7', firmId: 1, role: 'attorney', isActive: null } as any;

    const result = enrichJwtToken(token, user) as any;

    expect(result.isActive).toBe(false);
  });
});

describe('buildSessionUser', () => {
  it('copies id, firmId, role and isActive from token into session.user', () => {
    const session = { user: { email: 'a@b.com' } } as any;
    const token = { sub: '7', firmId: 42, role: 'owner', isActive: true } as any;

    const result = buildSessionUser(session, token);
    const u = result.user as any;

    expect(u.id).toBe('7');
    expect(u.firmId).toBe(42);
    expect(u.role).toBe('owner');
    expect(u.isActive).toBe(true);
  });

  it('leaves session unchanged when token has no sub', () => {
    const session = { user: { email: 'a@b.com' } } as any;
    const token = { sub: undefined, firmId: 1, role: 'attorney' } as any;

    const before = JSON.parse(JSON.stringify(session));
    const result = buildSessionUser(session, token);

    expect(JSON.stringify(result)).toBe(JSON.stringify(before));
  });
});

describe('parseAuthContext', () => {
  it('returns userId, firmId, role, isActive for a valid active session', () => {
    const session = {
      user: {
        id: '7',
        firmId: 42,
        role: 'owner',
        isActive: true,
      },
    } as any;

    const ctx = parseAuthContext(session);

    expect(ctx).not.toBeNull();
    expect(ctx!.userId).toBe(7);
    expect(ctx!.firmId).toBe(42);
    expect(ctx!.role).toBe('owner');
    expect(ctx!.isActive).toBe(true);
  });

  it('returns null when session is missing', () => {
    expect(parseAuthContext(null as any)).toBeNull();
    expect(parseAuthContext(undefined as any)).toBeNull();
  });

  it('returns null when session.user is missing', () => {
    expect(parseAuthContext({} as any)).toBeNull();
  });

  it('returns null when session.user.id is missing', () => {
    const session = { user: { firmId: 1, role: 'owner', isActive: true } } as any;
    expect(parseAuthContext(session)).toBeNull();
  });

  it('returns null when user is inactive', () => {
    const session = {
      user: { id: '7', firmId: 1, role: 'owner', isActive: false },
    } as any;
    expect(parseAuthContext(session)).toBeNull();
  });

  it('returns null when firmId is missing', () => {
    const session = {
      user: { id: '7', role: 'owner', isActive: true },
    } as any;
    expect(parseAuthContext(session)).toBeNull();
  });

  it('returns null when role is missing', () => {
    const session = {
      user: { id: '7', firmId: 1, isActive: true },
    } as any;
    expect(parseAuthContext(session)).toBeNull();
  });

  it('returns null when id is not a number', () => {
    const session = {
      user: { id: 'not-a-number', firmId: 1, role: 'owner', isActive: true },
    } as any;
    expect(parseAuthContext(session)).toBeNull();
  });
});