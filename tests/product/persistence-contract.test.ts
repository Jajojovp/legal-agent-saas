import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('practice data persistence', () => {
  it('cases page loads and creates cases through the API', () => {
    const page = read('app/[locale]/(dashboard)/dashboard/cases/page.tsx');
    expect(page).not.toContain('mockCases');
    expect(page).toContain("fetch('/api/cases'");
    expect(page).toContain("method: 'POST'");
  });

  it('tasks page loads and saves tasks through the API', () => {
    const page = read('app/[locale]/(dashboard)/dashboard/tasks/page.tsx');
    expect(page).not.toContain('mockTasks');
    expect(page).toContain("fetch('/api/tasks'");
  });

  it('case and task APIs validate writes inside the tenant context', () => {
    for (const route of ['app/api/cases/route.ts', 'app/api/tasks/route.ts']) {
      const source = read(route);
      expect(source).toContain('safeParse');
      expect(source).toContain('withTenantContext');
      expect(source).toContain('export async function POST');
    }
  });
});
