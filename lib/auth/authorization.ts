// Authorization helpers built on top of {@link AuthContext}.
// These are pure functions so route handlers stay thin and the tenant/ownership
// rules can be exhaustively unit-tested without a database or HTTP layer.

import type { AuthContext } from './context';

export interface LeadLike {
  firmId?: number | null;
  assignedTo?: number | null;
  [key: string]: unknown;
}

const ELEVATED_ROLES = new Set(['owner', 'admin']);

/**
 * Tenant + ownership check for mutating lead operations (PATCH, qualify, ...).
 *
 * - Tenant: lead must belong to the same `firmId` as the caller.
 * - Ownership: lead must be `assignedTo` the caller, unless the caller has an
 *   elevated role (owner/admin) within the same firm.
 *
 * Inactive users can never modify.
 */
export function canModifyLead(context: AuthContext, lead: LeadLike): boolean {
  if (!context.isActive) return false;
  if (typeof lead.firmId !== 'number' || lead.firmId !== context.firmId) return false;

  if (ELEVATED_ROLES.has(context.role)) return true;
  return typeof lead.assignedTo === 'number' && lead.assignedTo === context.userId;
}

/**
 * Checks that a `firmId` coming from a request body/query is compatible with
 * the caller's tenant. Returns `true` when no override was requested or when
 * the override matches the caller's firm.
 */
export function assertFirmScope(
  context: AuthContext,
  requestedFirmId: number | null | undefined
): boolean {
  if (requestedFirmId === null || requestedFirmId === undefined) return true;
  return requestedFirmId === context.firmId;
}

/**
 * Always returns the caller's firmId, ignoring any value supplied by the
 * client. This is the single source of truth for tenant scoping: `firmId`
 * is *always* derived from the authenticated context, never from
 * request body or query string.
 */
export function resolveFirmId(
  context: AuthContext,
  _requestedFirmId: number | null | undefined
): number {
  return context.firmId;
}

/**
 * P0-005: restrict chatbot `internal` mode.
 *
 * - `public` (or unset/unknown) mode is always allowed: the chat widget lives
 *   on the public marketing site.
 * - `internal` mode requires an authenticated, active user. Any `firmId`
 *   supplied by the client must match the caller's firm; mismatched values
 *   are rejected to prevent cross-tenant knowledge-base access.
 */
export function isInternalModeAllowed(
  context: AuthContext | null,
  mode: string | null | undefined,
  requestedFirmId: number | null | undefined
): boolean {
  if (mode === 'internal') {
    if (!context || !context.isActive) return false;
    if (!assertFirmScope(context, requestedFirmId)) return false;
    return true;
  }
  return true;
}

// ──────────────────────────────────────────────────────────────────────────
// Chatbot persistence scoping (P0-003 + IDOR blockers)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Shape of a `chat_conversations` row projected down to the fields used by
 * the scoping helpers. `firmId` is the multi-tenant boundary; `sessionId`
 * is client-provided and therefore treated as untrusted user input.
 */
export interface ChatConversationLike {
  id?: number;
  firmId?: number | null;
  sessionId?: string | null;
  [key: string]: unknown;
}

/**
 * Public default firm used for anonymous, public-mode chat sessions emitted
 * by the marketing-site widget. This firm only ever holds the public-facing
 * knowledge base + anonymous-conversation rows; real tenant firms never use
 * this id.
 */
export const PUBLIC_CHAT_FIRM_ID = 1;

/**
 * Resolves the firm id that a chatbot request must scope *every* database
 * query by. The contract is:
 *
 *   1. An authenticated, active caller always uses their own `firmId`.
 *      Any `firmId` value coming from the request body or query string is
 *      ignored entirely — see the corresponding `resolveFirmId` note in
 *      {@link authorization}.
 *   2. Anonymous callers (`public` mode widget, unauthenticated human) get
 *      the {@link PUBLIC_CHAT_FIRM_ID} default, never a spoofed body value.
 *   3. Inactive callers are treated as anonymous — they get the public
 *      firm. This prevents a de-provisioned user from continuing to write
 *      into their former tenant's chat tables via the widget.
 */
export function resolveChatFirmId(
  context: AuthContext | null,
  _requestedFirmId: number | null | undefined
): number {
  if (context && context.isActive) {
    return context.firmId;
  }
  return PUBLIC_CHAT_FIRM_ID;
}

/**
 * Authorizes a read / write of an existing `chat_conversations` row against
 * a previously-computed `effectiveFirmId` (from {@link resolveChatFirmId}).
 *
 * Rules:
 *  - The persisted row MUST have a numeric `firmId` exactly equal to the
 *    effective firm. Anything else is an IDOR attempt (cross-tenant
 *    guessing of `sessionId`).
 *  - If a caller is provided, they must be active. Inactive callers are
 *    rejected even when the firm id matches (defense-in-depth).
 *  - Anonymous callers may persist only against the public firm
 *    ({@link PUBLIC_CHAT_FIRM_ID}); that case is covered by the generic
 *    `firmId === effectiveFirmId` check since `effectiveFirmId` for an
 *    anonymous caller is already `PUBLIC_CHAT_FIRM_ID`.
 *
 * NOTE on per-user ownership: the `chat_conversations` table has no
 * `user_id` column (see `lib/db/schema.ts`). Per-user ownership of a
 * conversation within a firm would require a schema migration, which is
 * intentionally out of scope (the task forbids DB / CI / dependency
 * changes). Cross-tenant (cross-firm) isolation is the firm boundary now
 * enforced; same-firm users share their firm's conversations keyed by
 * (untrusted) `sessionId`.
 */
export function canPersistConversation(
  context: AuthContext | null,
  conversation: ChatConversationLike,
  effectiveFirmId: number
): boolean {
  if (context && !context.isActive) return false;
  if (typeof conversation.firmId !== 'number') return false;
  return conversation.firmId === effectiveFirmId;
}