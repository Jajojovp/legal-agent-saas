// Pure helpers used by the edge middleware to gate the dashboard. The actual
// middleware composition lives in `middleware.ts`; the tenant/auth rules are
// unit-testable here so they stay independent of Next.js request plumbing.

const DASHBOARD_SEGMENT = '/dashboard';

/**
 * Matches dashboard routes both in the default (`/dashboard`) and localized
 * (`/en/dashboard`, `/es/dashboard/leads`) URL layouts while excluding
 * paths that merely start with the segment (e.g. `/dashboard-clone`).
 */
const LOCALE_PREFIX_RE = /^\/(en|es)\/(.*)$/;

export function isProtectedDashboardPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  let p = pathname;
  const localeMatch = LOCALE_PREFIX_RE.exec(p);
  if (localeMatch) {
    p = '/' + localeMatch[2];
  }
  if (p === DASHBOARD_SEGMENT) return true;
  if (p.startsWith(DASHBOARD_SEGMENT + '/')) return true;
  return false;
}

/**
 * Decides whether the middleware should redirect to `/login`: only when the
 * path is protected AND no NextAuth session token cookie is present.
 *
 * Presence of the cookie is a fast, edge-friendly smoke check; the actual
 * authentication/authorization claim validation continues to happen in
 * `requireAuth` and route handlers.
 */
export function shouldRedirectToLogin(
  pathname: string | null | undefined,
  sessionTokenCookie: string | null | undefined
): boolean {
  if (!isProtectedDashboardPath(pathname)) return false;
  if (!sessionTokenCookie || sessionTokenCookie.length === 0) return true;
  return false;
}