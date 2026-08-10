import { NextRequest, NextResponse } from 'next/server';
import { chatbotResponse } from '@/lib/ai/legal-ai-service';
import { queryWithContext } from '@/lib/ai/knowledge-base';
import { isDbAvailable } from '@/lib/db';
import { withTenantContext } from '@/lib/db/tenant-context';
import { chatConversations } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/session';
import {
  isInternalModeAllowed,
  resolveChatFirmId,
  canPersistConversation,
} from '@/lib/auth/authorization';
import {
  parseChatRequest,
  PUBLIC_CHAT_COOKIE_MAX_AGE,
  chatCookieForMode,
  resolvePublicChatSession,
} from '@/lib/chatbot/session';
import { ZodError } from 'zod';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

class ChatStorageUnavailableError extends Error {}

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(`chatbot-${ip}`, 20, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (!Number.isFinite(contentLength) || contentLength > 16_384) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 413 });
    }
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, 'utf8') > 16_384) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 413 });
    }
    const { message, firmId: bodyFirmId, context } = parseChatRequest(JSON.parse(rawBody));
    // Conversation ownership comes exclusively from an HttpOnly server cookie.
    // A legacy/client-supplied sessionId is parsed only for compatibility and ignored.
    const chatCookie = chatCookieForMode(context.mode);
    const publicSession = resolvePublicChatSession(request.cookies.get(chatCookie)?.value);
    const sessionId = publicSession.sessionId;

    // P0-005: `internal` mode is privileged — it must be authenticated and the
    // firmId supplied by the client (if any) must match the caller's firm.
    // Best-effort auth: public mode stays anonymous-allowed.
    let authCtx = null;
    try {
      authCtx = await requireAuth();
    } catch {
      // anonymous user — allowed only for public mode (checked below).
    }

    const requestedFirmId =
      typeof bodyFirmId === 'number' && Number.isFinite(bodyFirmId)
        ? bodyFirmId
        : null;

    if (!isInternalModeAllowed(authCtx, context?.mode, requestedFirmId)) {
      return NextResponse.json(
        { error: 'Unauthorized: internal mode requires an authenticated session' },
        { status: 401 }
      );
    }

    // P0-003: firmId is ALWAYS derived from the authenticated context, never
    // from the request body. Anonymous public chats get firmId 1 (default
    // public-knowledge firm) so the public landing-page widget keeps working.
    // `bodyFirmId` is intentionally discarded — the helper explicitly ignores
    // client-supplied firmId to prevent cross-tenant IDOR.
    const effectiveFirmId = resolveChatFirmId(authCtx, requestedFirmId);

    let conversation = null;
    let messages: any[] = [];

    if (isDbAvailable) {
      try {
        // P0-003 IDOR: lookup MUST be scoped by BOTH sessionId AND firmId.
        // Without the firmId predicate a caller from firm A could supply a
        // sessionId that collides with (or guesses) a row owned by firm B,
        // read its messages, and then OVERWRITE them via the update path.
        const dbConversation = await withTenantContext(effectiveFirmId, async (tx) => {
          const [row] = await tx
            .select()
            .from(chatConversations)
            .where(
              and(
                eq(chatConversations.sessionId, sessionId),
                eq(chatConversations.firmId, effectiveFirmId)
              )
            )
            .limit(1);
          return row;
        });
        // Defense-in-depth: the SQL filter already enforces firm scope, but
        // we ALSO run the pure helper so the testable invariant matches the
        // runtime invariant. If a row somehow slips through (e.g. a future
        // schema default that desyncs the SQL filter), we refuse it here.
        if (dbConversation && canPersistConversation(authCtx, dbConversation, effectiveFirmId)) {
          conversation = dbConversation;
          messages = (conversation?.messages as any[]) || [];
        } else if (dbConversation) {
          // Cross-tenant attempt — pretend we don't know about it (no leak)
          // and start a fresh conversation under the caller's effective firm.
          conversation = null;
          messages = [];
        }
      } catch {
        // When the app believes DB is available, continuing as a fresh chat can
        // hide ownership/uniqueness failures and present a false successful save.
        throw new ChatStorageUnavailableError();
      }
    }

    messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    const aiResponse = context?.mode === 'internal'
      ? await queryWithContext(message, effectiveFirmId, context?.locale || 'en')
      : await chatbotResponse(message, context);

    messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

    if (isDbAvailable) {
      try {
        if (conversation) {
          // P0-003 IDOR: update scoped by id AND firmId. Updating only by id
          // would let a cross-tenant caller overwrite a row whose id they
          // learned via the read path or by guessing.
          await withTenantContext(effectiveFirmId, (tx) =>
            tx.update(chatConversations)
              .set({ messages: messages as any, updatedAt: new Date() })
              .where(
                and(
                  eq(chatConversations.id, conversation.id),
                  eq(chatConversations.firmId, effectiveFirmId)
                )
              )
          );
        } else {
          await withTenantContext(effectiveFirmId, (tx) =>
            tx.insert(chatConversations).values({
              firmId: effectiveFirmId,
              sessionId,
              messages: messages as any,
              outcome: null,
            })
          );
        }
      } catch {
        throw new ChatStorageUnavailableError();
      }
    }

    const response = NextResponse.json({
      message: aiResponse,
      conversationLength: messages.length,
    });
    if (publicSession.shouldSetCookie) {
      response.cookies.set(chatCookie, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: PUBLIC_CHAT_COOKIE_MAX_AGE,
      });
    }
    return response;
  } catch (error: any) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    if (error instanceof ChatStorageUnavailableError) {
      return NextResponse.json({ error: 'Chat service temporarily unavailable' }, { status: 503 });
    }
    console.error('Chatbot error:', error.message);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

// P0-003: GET chat history is authenticated and scoped to the caller's firm.
export async function GET(request: NextRequest) {
  try {
    const authCtx = await requireAuth();

    // History is authenticated, so it belongs to the internal conversation
    // namespace and can never collide with the landing-page public chat.
    const cookieValue = request.cookies.get(chatCookieForMode('internal'))?.value;
    const session = resolvePublicChatSession(cookieValue);
    // GET never creates ownership: without an already valid HttpOnly cookie,
    // history remains undiscoverable even when a sessionId is guessed.
    if (session.shouldSetCookie) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    const sessionId = session.sessionId;

    // firmId is ALWAYS derived from the authenticated context, never from
    // the query string. Anonymous access to GET is already forbidden by
    // `requireAuth` above.
    const effectiveFirmId = resolveChatFirmId(authCtx, null);

    const conversation = await withTenantContext(effectiveFirmId, async (tx) => {
      const [row] = await tx
        .select()
        .from(chatConversations)
        .where(
          and(
            eq(chatConversations.sessionId, sessionId),
            eq(chatConversations.firmId, effectiveFirmId)
          )
        )
        .limit(1);
      return row;
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // In case the row slipped through (e.g. due to a query-behavior quirk),
    // enforce the same invariant here before returning data.
    if (!canPersistConversation(authCtx, conversation, effectiveFirmId)) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({
      sessionId,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to retrieve conversation' }, { status: 500 });
  }
}
