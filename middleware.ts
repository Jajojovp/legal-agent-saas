import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { shouldRedirectToLogin } from './lib/auth/dashboard-gate';

const intlMiddleware = createIntlMiddleware(routing);

/**
 * NextAuth v4 session-token cookie names. The secure variant is set when the
 * request is served over HTTPS in production; the plain variant is used in
 * local dev. We only need to detect *presence*, not validate the JWT — full
 * claim validation continues to happen in `requireAuth`.
 */
const SESSION_COOKIE_NAMES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

export default function middleware(request: NextRequest) {
  // P0-002: gate dashboard routes behind an authenticated session cookie.
  const pathname = request.nextUrl.pathname;
  const sessionToken = SESSION_COOKIE_NAMES
    .map((name) => request.cookies.get(name)?.value)
    .find((value) => typeof value === 'string' && value.length > 0);

  if (shouldRedirectToLogin(pathname, sessionToken ?? null)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except API routes, static files, and Next.js internals
  matcher: [
    '/',
    '/(en|es)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};