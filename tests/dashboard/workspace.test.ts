import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../..');
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');

describe('matter-centric dashboard workspace', () => {
  it('does not present fabricated dashboard records as tenant data', () => {
    const page = read('app/[locale]/(dashboard)/dashboard/page.tsx');

    expect(page).not.toContain('mockData');
    expect(page).toContain('recentLeads');
    expect(page).toContain('upcomingTasks');
    expect(page).toContain('recentCases');
  });

  it('loads the work queue inside the tenant gateway', () => {
    const route = read('app/api/dashboard/kpi/route.ts');

    expect(route).toContain('withTenantContext');
    expect(route).toContain('recentLeads');
    expect(route).toContain('upcomingTasks');
    expect(route).toContain('recentCases');
  });

  it('provides responsive navigation for mobile lawyers', () => {
    const layout = read('app/[locale]/(dashboard)/layout.tsx');

    expect(layout).toContain('aria-label="Open navigation"');
    expect(layout).toContain('lg:pl-64');
    expect(layout).toContain('mobileNavigationOpen');
  });
});
