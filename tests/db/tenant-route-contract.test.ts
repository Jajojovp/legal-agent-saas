import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tenantModules = [
  'app/api/leads/route.ts',
  'app/api/leads/qualify/route.ts',
  'app/api/cases/route.ts',
  'app/api/tasks/route.ts',
  'app/api/dashboard/kpi/route.ts',
  'app/api/chatbot/message/route.ts',
  'lib/payments/repository.ts',
];

describe('tenant-sensitive database contract', () => {
  it.each(tenantModules)('%s uses the transaction-scoped tenant gateway', (path) => {
    const source = readFileSync(resolve(process.cwd(), path), 'utf8');

    expect(source).toContain("@/lib/db/tenant-context");
    expect(source).toContain('withTenantContext(');
    expect(source).not.toMatch(/import\s*\{[\s\S]*?\bdb\b[\s\S]*?\}\s*from\s*['"]@\/lib\/db['"]/);
  });
});
