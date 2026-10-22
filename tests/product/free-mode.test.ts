import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('free product mode', () => {
  it('does not expose pricing or billing navigation', () => {
    expect(read('app/[locale]/page.tsx')).not.toContain('href="/pricing"');
    expect(read('app/[locale]/(dashboard)/layout.tsx')).not.toContain('/dashboard/billing');
  });

  it('does not advertise or configure payment providers', () => {
    expect(read('.env.example')).not.toMatch(/MERCADOPAGO|MP_ACCESS_TOKEN|MP_PLAN_/i);
    expect(read('next.config.js')).not.toContain('api.mercadopago.com');
    expect(read('package.json')).not.toMatch(/Multi-Payment|subscription/i);
  });

  it('keeps legal-practice features available without plan gates', () => {
    const middleware = read('middleware.ts');
    expect(middleware).not.toMatch(/subscription|planId|paywall/i);
  });
});
