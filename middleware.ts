import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { shouldRedirectToLogin } from './lib/auth/dashboard-gate';

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Auth.js v5 / NextAuth v4 session-token cookie names. The secure variant is set when the
 * request is served over HTTPS in production; the plain variant is used in
 * local dev. We only need to detect *presence*, not validate the JWT — full
 * claim validation continues to happen in `requireAuth`.
 */
const SESSION_COOKIE_NAMES = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api/')) {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const origin = request.headers.get('origin');
      const expectedOrigin = new URL(process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).origin;
      if (origin && origin !== expectedOrigin) {
        return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  // P0-002: gate dashboard routes behind an authenticated session cookie.
  const sessionToken = SESSION_COOKIE_NAMES
    .map((name) => request.cookies.get(name)?.value)
    .find((value) => typeof value === 'string' && value.length > 0);

  if (shouldRedirectToLogin(pathname, sessionToken ?? null)) {
    const loginUrl = request.nextUrl.clone();
    // Preserve locale prefix (e.g., /es/dashboard -> /es/login)
    const localeMatch = pathname.match(/^\/(en|es)(\/|$)/);
    loginUrl.pathname = localeMatch ? `/${localeMatch[1]}/login` : '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except API routes, static files, and Next.js internals
  matcher: [
    '/',
    '/api/:path*',
    '/(en|es)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
