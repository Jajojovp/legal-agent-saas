// Pure auth-context helpers shared by NextAuth callbacks and route handlers.
// All functions here are pure (input -> output) so they can be unit-tested
// without spinning up NextAuth or a database.

export interface AuthContext {
  userId: number;
  firmId: number;
  role: string;
  isActive: boolean;
  session: any;
}

interface JwtToken {
  sub?: string | null;
  email?: string;
  firmId?: number;
  role?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

interface SessionLike {
  user?: Record<string, unknown> | null;
}

interface DbUserLike {
  id: string | number;
  firmId?: number | null;
  role?: string | null;
  isActive?: boolean | null;
}

/**
 * Called from the NextAuth `jwt` callback when the user has just signed in.
 * Injects `firmId`, `role`, and `isActive` from the DB record into the JWT so
 * every subsequent request can derive an {@link AuthContext} without hitting
 * the database.
 */
export function enrichJwtToken<T extends JwtToken>(token: T, user: DbUserLike): T & {
  sub: string;
  firmId: number | undefined;
  role: string | undefined;
  isActive: boolean;
} {
  return {
    ...token,
    sub: String(user.id),
    firmId: user.firmId ?? undefined,
    role: user.role ?? undefined,
    isActive: user.isActive === true,
  };
}

/**
 * Called from the NextAuth `session` callback. Copies the tenant/role/state
 * fields stored in the JWT into `session.user` so route handlers and server
 * components can read them via `getServerSession`. Mutates and returns the
 * same session object so NextAuth's strict return-type contract is preserved.
 */
export function buildSessionUser<S extends SessionLike>(session: S, token: JwtToken): S {
  if (!session?.user || !token.sub) {
    return session;
  }
  session.user.id = token.sub;
  session.user.firmId = token.firmId;
  session.user.role = token.role;
  session.user.isActive = token.isActive === true;
  return session;
}

/**
 * Derives an {@link AuthContext} from a NextAuth session. Returns `null` for
 * any unauthenticated, inactive, or malformed session. Tenant context must
 * come from here — never from request body or query string.
 */
export function parseAuthContext(session: SessionLike | null | undefined): AuthContext | null {
  if (!session) return null;
  const user = session.user as Record<string, unknown> | undefined;
  if (!user) return null;

  const rawId = user.id;
  if (typeof rawId !== 'string' && typeof rawId !== 'number') return null;
  const userId = typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10);
  if (!Number.isFinite(userId) || userId <= 0) return null;

  const firmId = user.firmId;
  if (typeof firmId !== 'number' || !Number.isFinite(firmId)) return null;

  const role = user.role;
  if (typeof role !== 'string' || !role) return null;

  const isActive = user.isActive === true;
  if (!isActive) return null;

  return { userId, firmId, role, isActive, session };
}