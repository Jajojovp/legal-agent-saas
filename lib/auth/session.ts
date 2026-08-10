import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import {
  parseAuthContext,
  type AuthContext,
} from '@/lib/auth/context';

export async function getAuthSession() {
  return getServerSession(getAuthOptions());
}

/**
 * P0-001: Require an authenticated, active session and return its tenant
 * context (`userId`, `firmId`, `role`, `isActive`). `firmId` MUST come from
 * this context — never from request body or query string.
 *
 * Throws `new Error('Unauthorized')` so existing route handlers that branch on
 * that exact message keep working.
 */
export async function requireAuth(): Promise<AuthContext> {
  const session = await getAuthSession();
  const context = parseAuthContext(session);
  if (!context) {
    throw new Error('Unauthorized');
  }
  return context;
}