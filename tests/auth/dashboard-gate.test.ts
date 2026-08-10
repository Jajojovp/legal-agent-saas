import { describe, it, expect } from 'vitest';
import { isProtectedDashboardPath, shouldRedirectToLogin } from '@/lib/auth/dashboard-gate';

describe('isProtectedDashboardPath', () => {
  it('protects /dashboard', () => {
    expect(isProtectedDashboardPath('/dashboard')).toBe(true);
  });

  it('protects dashboard subpaths', () => {
    expect(isProtectedDashboardPath('/dashboard/leads')).toBe(true);
    expect(isProtectedDashboardPath('/dashboard/cases/123')).toBe(true);
    expect(isProtectedDashboardPath('/dashboard/settings')).toBe(true);
  });

  it('protects localized dashboard paths', () => {
    expect(isProtectedDashboardPath('/en/dashboard')).toBe(true);
    expect(isProtectedDashboardPath('/es/dashboard/leads')).toBe(true);
  });

  it('does not protect root', () => {
    expect(isProtectedDashboardPath('/')).toBe(false);
  });

  it('does not protect public marketing pages', () => {
    expect(isProtectedDashboardPath('/pricing')).toBe(false);
    expect(isProtectedDashboardPath('/en/pricing')).toBe(false);
    expect(isProtectedDashboardPath('/es/blog/post-slug')).toBe(false);
  });

  it('does not protect login or register', () => {
    expect(isProtectedDashboardPath('/login')).toBe(false);
    expect(isProtectedDashboardPath('/es/register')).toBe(false);
  });

  it('does not protect API routes', () => {
    expect(isProtectedDashboardPath('/api/leads')).toBe(false);
    expect(isProtectedDashboardPath('/api/dashboard/kpi')).toBe(false);
  });

  it('does not protect paths that merely contain the word dashboard', () => {
    expect(isProtectedDashboardPath('/dashboard-clone')).toBe(false);
    expect(isProtectedDashboardPath('/en/dashboard-old')).toBe(false);
  });
});

describe('shouldRedirectToLogin', () => {
  it('redirects when path is protected and no session token cookie', () => {
    expect(shouldRedirectToLogin('/dashboard', null)).toBe(true);
    expect(shouldRedirectToLogin('/en/dashboard/leads', undefined)).toBe(true);
  });

  it('does not redirect when path is protected and session token cookie is present', () => {
    expect(shouldRedirectToLogin('/dashboard', 'some-token-value')).toBe(false);
  });

  it('does not redirect when path is not protected', () => {
    expect(shouldRedirectToLogin('/', 'some-token-value')).toBe(false);
    expect(shouldRedirectToLogin('/pricing', null)).toBe(false);
  });

  it('treats empty-string cookie as no cookie', () => {
    expect(shouldRedirectToLogin('/dashboard', '')).toBe(true);
  });
});