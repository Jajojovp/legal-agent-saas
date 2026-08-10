import NextAuth from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthOptions } from './auth-options';
import { isDbAvailable } from '@/lib/db';

// Build options once at module load (lazy + memoized) — safe for `next build`
// even when no DB is configured, because {@link getAuthOptions} no longer
// constructs `DrizzleAdapter({})` at module scope.
const handler = NextAuth(getAuthOptions());

/**
 * Response for the auth route that converts DB-dependent-auth failures into
 * HTTP 503 (without masking genuine runtime errors).`
 *
 * Routes under `/api/auth/*` fall into two buckets:
 *  - DB-dependent: credentials sign-in (`POST /api/auth/callback/credentials`),
 *    OAuth callbacks (`GET /api/auth/callback/<provider>`), account
 *    linking/retrieval — these need the adapter or a live `db` query.
 *  - DB-free: `GET /api/auth/session` (reads from the JWT),
 *    `GET /api/auth/csrf`, `GET /api/auth/providers`, sign-out.
 *
 * When the database is unavailable we return 503 only for the DB-dependent
 * actions, letting the JWT-only GET endpoints keep serving (so already-logged
 * in users still see their session widget, and the client still gets a CSRF
 * token). Sign-in flows are gated to 503.
 */
function isDbDependentAuthPath(url: URL): boolean {
  const path = url.pathname.replace(/^\/api\/auth/, '');
  // OAuth callbacks and credential callbacks persist against the adapter.
  if (path.startsWith('/callback/')) return true;
  // `POST /api/auth/signin` initiates a provider sign-in (credentials or
  // OAuth redirect). Both ultimately require the DB.
  if (path === '/signin' || path.startsWith('/signin/')) return true;
  return false;
}

async function guarded(req: NextRequest, ctx: any) {
  if (!isDbAvailable) {
    const url = new URL(req.url);
    if (isDbDependentAuthPath(url)) {
      // Surface a 503 immediately — don't let NextAuth convert an opaque
      // "Unsupported database type (object)" / TypeError into a misleading
      // 500 that pretends to be an application bug.
      return NextResponse.json(
        { error: 'Service unavailable: database not configured' },
        { status: 503 }
      );
    }
  }
  try {
    return await handler(req, ctx);
  } catch (err: any) {
    // Sentinel set by `authorize` and other helpers when the DB is gone.
    if (err?.message === 'DatabaseUnavailable') {
      return NextResponse.json(
        { error: 'Service unavailable: database not configured' },
        { status: 503 }
      );
    }
    // Re-throw so real runtime errors are still observable upstream
    // (no error-masking here).
    throw err;
  }
}

export { guarded as GET, guarded as POST };