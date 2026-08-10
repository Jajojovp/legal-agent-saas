import { describe, it, expect } from 'vitest';
import {
  resolveChatFirmId,
  canPersistConversation,
} from '@/lib/auth/authorization';
import type { AuthContext } from '@/lib/auth/context';

function ctx(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    userId: 7,
    firmId: 42,
    role: 'attorney',
    isActive: true,
    session: { user: { id: '7' } } as any,
    ...overrides,
  };
}

/**
 * Regression tests for the quality-review blocker:
 *   "Chatbot POST/GET IDOR — reads, updates, and persistence by
 *    sessionId/conversation.id must filter by firmId and ownership; firmId
 *    must never be accepted from the client."
 *
 * These tests exercise the pure scoping helpers the chatbot route uses.
 * The helpers encode the invariant: `effectiveFirmId` ALWAYS comes from the
 * authenticated context (or 1 for anonymous public chats) and any persisted
 * conversation whose `firmId` doesn't match is refused.
 *
 * Public visitor ownership is enforced separately by the chatbot route using
 * a server-generated, HttpOnly cookie. Client-provided session identifiers no
 * longer select persisted history. These helpers retain the independent firm
 * boundary so both visitor ownership and tenant isolation must pass.
 */
describe('resolveChatFirmId — never accept firmId from client', () => {
  it('returns caller firmId and ignores body firmId when authenticated', () => {
    expect(resolveChatFirmId(ctx({ firmId: 42 }), 99)).toBe(42);
  });

  it('returns caller firmId when no body firmId provided', () => {
    expect(resolveChatFirmId(ctx({ firmId: 42 }), null)).toBe(42);
  });

  it('returns default public firm (1) for anonymous / public chats', () => {
    expect(resolveChatFirmId(null, undefined)).toBe(1);
  });

  it('returns 1 when anonymous even if body firmId spoofed to a real firm', () => {
    // Cross-tenant IDOR attempt: anonymous widget claims firmId 42 in body.
    expect(resolveChatFirmId(null, 42)).toBe(1);
  });

  it('returns caller firmId when authenticated, ignoring body even on internal mode', () => {
    // Internal-mode privileged request: firmId must come from context, not body.
    expect(resolveChatFirmId(ctx({ firmId: 7 }), 42)).toBe(7);
  });

  it('treats inactive caller as anonymous (cannot borrow a firmId)', () => {
    expect(resolveChatFirmId(ctx({ isActive: false }), 42)).toBe(1);
  });
});

describe('canPersistConversation — cross-tenant IDOR guard', () => {
  const decisionFor = (convFirmId: number | null, eff: number): boolean =>
    canPersistConversation(
      ctx(),
      { id: 5, firmId: convFirmId, sessionId: 's-x' },
      eff
    );

  it('allows read/write when conversation belongs to the effective firm', () => {
    expect(decisionFor(42, 42)).toBe(true);
  });

  it('denies cross-tenant: conversation firmId differs from effective firm', () => {
    // Firm A asks for sessionId that happens to exist in firm B.
    // Even if attacker guesses a valid sessionId, the firmId mismatch
    // must block update/extraction.
    expect(decisionFor(99, 42)).toBe(false);
  });

  it('denies when conversation.firmId is null/undefined (cannot trust)', () => {
    expect(canPersistConversation(ctx(), { id: 5, firmId: null }, 42)).toBe(false);
    expect(canPersistConversation(ctx(), { id: 5, firmId: undefined }, 42)).toBe(
      false
    );
    expect(canPersistConversation(ctx(), { id: 5 }, 42)).toBe(false);
  });

  it('denies for anonymous public default firm when conversation is in real firm', () => {
    // Anonymous widget creds: effectiveFirmId=1. Chat from firm 42 row
    // must NOT be readable/writable by anonymous request guessing sessionId.
    expect(canPersistConversation(ctx(), { id: 5, firmId: 42 }, 1)).toBe(false);
  });

  it('allows anonymous public chat (firm 1) conversations for anonymous widget', () => {
    expect(canPersistConversation(null, { id: 5, firmId: 1 }, 1)).toBe(true);
  });

  it('denies inactive caller from persisting in any firm', () => {
    expect(
      canPersistConversation(
        ctx({ isActive: false }),
        { id: 5, firmId: 42 },
        42
      )
    ).toBe(false);
  });

  it('refuses even if a persisted conversation has firmId===eff but caller is inactive', () => {
    // Inactive users of the right firm also blocked (defense in depth).
    expect(
      canPersistConversation(
        ctx({ firmId: 42, isActive: false }),
        { id: 5, firmId: 42 },
        42
      )
    ).toBe(false);
  });

  it('composition: caller firm 42 → never persists into conversation with firm 1', () => {
    const eff = resolveChatFirmId(ctx({ firmId: 42 }), 1);
    expect(eff).toBe(42);
    expect(canPersistConversation(ctx({ firmId: 42 }), { id: 9, firmId: 1 }, eff)).toBe(
      false
    );
  });
});
