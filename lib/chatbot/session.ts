import { randomBytes } from 'node:crypto';
import { z } from 'zod';

// Path=/ and no Domain keep the cookie host-only. Avoid the __Host- prefix so
// local HTTP development remains functional; production still sets Secure.
export const PUBLIC_CHAT_COOKIE = 'legalagent-chat';
export const INTERNAL_CHAT_COOKIE = 'legalagent-internal-chat';
export const PUBLIC_CHAT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function chatCookieForMode(mode: 'public' | 'internal'): string {
  return mode === 'internal' ? INTERNAL_CHAT_COOKIE : PUBLIC_CHAT_COOKIE;
}

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const chatContextSchema = z.object({
  firmName: z.string().trim().min(1).max(120).optional(),
  practiceAreas: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  mode: z.enum(['public', 'internal']).default('public'),
  locale: z.string().trim().min(2).max(10).regex(/^[A-Za-z]{2,3}(?:-[A-Za-z]{2})?$/).optional(),
}).strict();

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  firmId: z.number().int().positive().max(2_147_483_647).nullable().optional(),
  context: chatContextSchema.optional(),
  // Accepted only for backwards-compatible parsing; route ownership never uses it.
  sessionId: z.string().max(200).optional(),
}).strict();

export type ValidatedChatRequest = {
  message: string;
  firmId: number | null;
  context: z.infer<typeof chatContextSchema>;
};

export function createPublicChatSessionId(): string {
  return randomBytes(32).toString('base64url');
}

export function resolvePublicChatSession(cookieValue?: string): {
  sessionId: string;
  shouldSetCookie: boolean;
} {
  if (cookieValue && SESSION_ID_PATTERN.test(cookieValue)) {
    return { sessionId: cookieValue, shouldSetCookie: false };
  }
  return { sessionId: createPublicChatSessionId(), shouldSetCookie: true };
}

export function parseChatRequest(input: unknown): ValidatedChatRequest {
  const parsed = chatRequestSchema.parse(input);
  return {
    message: parsed.message,
    firmId: parsed.firmId ?? null,
    context: parsed.context ?? { mode: 'public' },
  };
}
