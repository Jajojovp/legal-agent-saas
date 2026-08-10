import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Regression tests for the quality-review blocker:
 *   "DrizzleAdapter(db) with db={} at module load crashes the build."
 *
 * Root cause: `auth-options.ts` called `DrizzleAdapter(db)` at module scope,
 * and `db` is `{} as any` whenever `DATABASE_URL`/`POSTGRES_URL` is absent
 * (build/CI environment). NextAuth's DrizzleAdapter throws
 *   "Unsupported database type (object)"
 * during Next.js `next build` page-data collection, breaking the build.
 *
 * Fix: lazy/factory auth options + adapter guard + 503 for DB-dependent auth
 * requests when the database is unavailable.
 *
 * NOTE: Full E2E route-handler testing of the 503 path requires spinning up
 * NextAuth + Next.js route plumbing, which Vitest alone cannot do reliably
 * here. The factory + guard layer is exhaustively unit-tested; route-level
 * behavior is asserted through the factory contract (DB unavailable → no
 * adapter, no Google provider, authorize throws `DatabaseUnavailable`)
 * and the wrapper's documented contract.
 */

describe('getAuthOptions — lazy factory (no DB at module load)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('does NOT throw when DATABASE_URL/POSTGRES_URL are absent (build-time safe)', async () => {
    // Reproduces the original blocker: importing the module must not call
    // `DrizzleAdapter({})` at load. Previously this threw
    // "Unsupported database type (object)".
    vi.doMock('@/lib/db', () => ({
      db: {} as any,
      isDbAvailable: false,
    }));
    const { getAuthOptions } = await import(
      '@/app/api/auth/[...nextauth]/auth-options'
    );
    expect(() => getAuthOptions()).not.toThrow();
  }, 10_000);

  it('omits the Drizzle adapter when the database is unavailable', async () => {
    vi.doMock('@/lib/db', () => ({
      db: {} as any,
      isDbAvailable: false,
    }));
    const { getAuthOptions } = await import(
      '@/app/api/auth/[...nextauth]/auth-options'
    );
    const options = getAuthOptions();
    expect(options.adapter).toBeUndefined();
  });

  it('registers the Credentials provider even when DB is unavailable (build-safe)', async () => {
    vi.doMock('@/lib/db', () => ({
      db: {} as any,
      isDbAvailable: false,
    }));
    const { getAuthOptions } = await import(
      '@/app/api/auth/[...nextauth]/auth-options'
    );
    const options = getAuthOptions();
    const providers = (options.providers ?? []) as any[];
    const hasCredentials = providers.some((p) => p?.id === 'credentials');
    expect(hasCredentials).toBe(true);
  });

  it('uses the DB-independent jwt session strategy', async () => {
    vi.doMock('@/lib/db', () => ({
      db: {} as any,
      isDbAvailable: false,
    }));
    const { getAuthOptions } = await import(
      '@/app/api/auth/[...nextauth]/auth-options'
    );
    const options = getAuthOptions();
    expect(options.session?.strategy).toBe('jwt');
  });

  it('omits the Google OAuth provider when DB is unavailable (requires adapter persistence)', async () => {
    vi.doMock('@/lib/db', () => ({
      db: {} as any,
      isDbAvailable: false,
    }));
    vi.stubEnv('GOOGLE_CLIENT_ID', 'test-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-secret');
    const { getAuthOptions } = await import(
      '@/app/api/auth/[...nextauth]/auth-options'
    );
    const options = getAuthOptions();
    const providers = (options.providers ?? []) as any[];
    const hasGoogle = providers.some((p) => p?.id === 'google');
    expect(hasGoogle).toBe(false);
    vi.unstubAllEnvs();
  });

  it('authorizes() throws DatabaseUnavailable when DB is not configured (503 source)', async () => {
    vi.doMock('@/lib/db', () => ({
      db: {} as any,
      isDbAvailable: false,
    }));
    const { getAuthOptions } = await import(
      '@/app/api/auth/[...nextauth]/auth-options'
    );
    const options = getAuthOptions();
    const credentialsProvider = ((options.providers ?? []) as any[]).find(
      (p) => p?.id === 'credentials'
    );
    expect(credentialsProvider).toBeDefined();
    // NextAuth's CredentialsProvider stores the user-passed callback in
    // `options.authorize`; `provider.authorize` is a `() => null` placeholder.
    const authorize = credentialsProvider.options.authorize;
    expect(typeof authorize).toBe('function');
    await expect(
      authorize({ email: 'a@b.com', password: 'x' }, {})
    ).rejects.toThrow('DatabaseUnavailable');
  });

  it('installs the Drizzle adapter when the database is available', async () => {
    vi.doMock('@/lib/db', () => ({
      db: { _isDrizzleStub: true } as any,
      isDbAvailable: true,
    }));
    const adapterSpy = vi.fn(() => ({ _adapterActive: true })) as any;
    vi.doMock('@auth/drizzle-adapter', () => ({
      DrizzleAdapter: adapterSpy,
    }));
    const { getAuthOptions } = await import(
      '@/app/api/auth/[...nextauth]/auth-options'
    );
    const options = getAuthOptions();
    expect(options.adapter).toBeTruthy();
    expect((options.adapter as any)._adapterActive).toBe(true);
    expect(adapterSpy).toHaveBeenCalled();
  });
});
