import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db, isDbAvailable } from '@/lib/db';
import { compare } from 'bcryptjs';
import { enrichJwtToken, buildSessionUser } from '@/lib/auth/context';

/**
 * Quality-review blocker:
 *   `DrizzleAdapter(db)` was invoked at module scope with `db = {}` whenever
 *   `DATABASE_URL`/`POSTGRES_URL` was absent (build / CI environments).
 *   NextAuth's adapter factory then threw
 *   "Unsupported database type (object)" during `next build` page-data
 *   collection, failing the build.
 *
 * Fix: this module now exposes a **factory** that builds the NextAuth options
 * lazily and only constructs the Drizzle adapter when a real database client
 * exists. This keeps module import (and therefore `next build`) safe, while
 * still failing loudly at runtime when a DB-dependent auth request is served
 * without a database — the `authorize` callback throws a sentinel
 * `DatabaseUnavailable` error that the route wrapper converts to HTTP 503.
 *
 * The factory is memoized because NextAuth inspects `adapter` and
 * `providers` eagerly once per server instance; rebuilding it per request
 * would re-register state unnecessarily.
 */
let cachedOptions: NextAuthConfig | null = null;

export function getAuthOptions(): NextAuthConfig {
  if (cachedOptions) return cachedOptions;
  const options: NextAuthConfig = {
    trustHost: process.env.AUTH_TRUST_HOST === 'true',
    // Adapter only installed when a real DB client is available. When the
    // database is absent we keep `adapter: undefined` so JWT-only flows
    // (session read, csrf) keep working — any operation that genuinely
    // requires DB persistence (OAuth account storage, credential lookup)
    // is gated via {@link assertDbAvailable} inside the providers/callbacks.
    ...(isDbAvailable ? { adapter: DrizzleAdapter(db as any) } : {}),
    providers: [
      CredentialsProvider({
        id: 'credentials',
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          // Surface a clear 503 sentinel instead of letting the
          // `(db.query as any)...` access on `{}` throw an opaque
          // "Cannot read properties of undefined" runtime error that
          // NextAuth would otherwise turn into a 500.
          if (!isDbAvailable) {
            throw new Error('DatabaseUnavailable');
          }

          const existingUsers = await (db.query as any).users.findMany({
            where: (users: any, { eq }: any) => eq(users.email, credentials.email),
            limit: 1,
          });

          const user = existingUsers[0];
          if (!user?.hashedPassword) return null;

          // P0-001: inactive users must not be able to sign in.
          if (user.isActive === false) return null;

          const isValid = await compare(String(credentials.password), user.hashedPassword);
          if (!isValid) return null;

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            // Carried through to the jwt callback so the auth context
            // (firmId/role/isActive) can be minted without a DB round-trip.
            firmId: user.firmId ?? undefined,
            role: user.role ?? undefined,
            isActive: user.isActive === true,
          } as any;
        },
      }),
      // Google OAuth needs the adapter to persist/link accounts, so we
      // only register it when a database is wired up.
      ...(isDbAvailable &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET
        ? [
            GoogleProvider({
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            }),
          ]
        : []),
    ],
    session: {
      strategy: 'jwt',
      // Keep stale tenant/role claims short-lived. A future server-side
      // session-version check can provide immediate revocation.
      maxAge: 60 * 60,
    },
    pages: {
      signIn: '/login',
      newUser: '/register',
    },
    callbacks: {
      session({ session, token }) {
        // P0-001: propagate firmId/role/isActive onto session.user.
        buildSessionUser(session as any, token as any);
        return session;
      },
      jwt({ token, user }) {
        // P0-001: on first sign-in, enrich the JWT with tenant context.
        if (user) {
          return enrichJwtToken(token as any, user as any);
        }
        return token;
      },
    },
  };

  cachedOptions = options;
  return options;
}

