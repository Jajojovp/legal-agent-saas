import { describe, expect, it } from 'vitest';
import { createPublicChatSessionId, parseChatRequest, resolvePublicChatSession } from '@/lib/chatbot/session';
import { chatCookieForMode } from '@/lib/chatbot/session';

describe('public chatbot session ownership', () => {
  it('creates an unguessable server session identifier', () => {
    const first = createPublicChatSessionId();
    const second = createPublicChatSessionId();
    expect(first).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(second).not.toBe(first);
  });

  it('keeps a valid server cookie', () => {
    const owned = createPublicChatSessionId();
    expect(resolvePublicChatSession(owned)).toEqual({ sessionId: owned, shouldSetCookie: false });
  });

  it('replaces missing or malformed cookies', () => {
    expect(resolvePublicChatSession(undefined).shouldSetCookie).toBe(true);
    expect(resolvePublicChatSession('session-attacker').shouldSetCookie).toBe(true);
    expect(resolvePublicChatSession('a'.repeat(500)).shouldSetCookie).toBe(true);
  });

  it('uses separate ownership cookies when a visitor transitions from public to internal mode', () => {
    expect(chatCookieForMode('public')).not.toBe(chatCookieForMode('internal'));
    expect(chatCookieForMode('public')).toBe('legalagent-chat');
    expect(chatCookieForMode('internal')).toBe('legalagent-internal-chat');
  });
});

describe('chatbot request limits', () => {
  it('normalizes a valid public request without requiring client session state', () => {
    expect(parseChatRequest({ message: '  Necesito ayuda  ', context: { mode: 'public', locale: 'es' } })).toEqual({
      message: 'Necesito ayuda', firmId: null, context: { mode: 'public', locale: 'es' },
    });
  });

  it('drops a legacy client sessionId so it cannot select persisted history', () => {
    expect(parseChatRequest({ message: 'hola', sessionId: 'session-attacker' })).toEqual({
      message: 'hola', firmId: null, context: { mode: 'public' },
    });
  });

  it('rejects empty and oversized messages', () => {
    expect(() => parseChatRequest({ message: '   ' })).toThrow();
    expect(() => parseChatRequest({ message: 'x'.repeat(4001) })).toThrow();
  });

  it('rejects oversized or unexpected context fail-closed', () => {
    expect(() => parseChatRequest({ message: 'ok', context: { firmName: 'x'.repeat(121) } })).toThrow();
    expect(() => parseChatRequest({ message: 'ok', context: { practiceAreas: Array(21).fill('civil') } })).toThrow();
    expect(() => parseChatRequest({ message: 'ok', context: { mode: 'admin' } })).toThrow();
    expect(() => parseChatRequest({ message: 'ok', context: { secret: 'unexpected' } })).toThrow();
  });
});
