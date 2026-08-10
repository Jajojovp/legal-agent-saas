import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationPath = resolve(process.cwd(), 'lib/db/migrations/rls_multitenant_up.sql');
const rollbackPath = resolve(process.cwd(), 'lib/db/migrations/rls_multitenant_down.sql');
const readSql = (path: string) => readFileSync(path, 'utf8').toLowerCase();

describe('multitenant RLS migration', () => {
  it('enables and forces RLS on every tenant-sensitive table', () => {
    const sql = readSql(migrationPath);
    const sensitiveTables = [
      'law_firms', 'users', 'accounts', 'sessions', 'verification_tokens',
      'subscriptions', 'subscription_checkout_attempts', 'payment_events',
      'leads', 'cases', 'tasks',
      'documents', 'time_entries', 'invoices', 'chat_conversations',
      'kpi_metrics', 'email_campaigns',
    ];

    for (const table of sensitiveTables) {
      expect(sql).toContain(`alter table public.${table} enable row level security`);
      expect(sql).toContain(`alter table public.${table} force row level security`);
    }
  });

  it('uses a fail-closed transaction-local tenant context', () => {
    const sql = readSql(migrationPath);

    expect(sql).toContain("current_setting('app.firm_id', true)");
    expect(sql).toContain("set_config('app.firm_id', p_firm_id::text, true)");
    expect(sql).toContain('create role legal_agent_app nologin noinherit nobypassrls');
    expect(sql).not.toMatch(/set_config\('app\.firm_id',[\s\S]*false\)/);
  });

  it('protects updates with both USING and WITH CHECK predicates', () => {
    const sql = readSql(migrationPath);
    const updatePolicies = sql.match(/create policy[\s\S]*?for update[\s\S]*?;/g) ?? [];

    expect(updatePolicies.length).toBeGreaterThan(0);
    for (const policy of updatePolicies) {
      expect(policy).toContain('using');
      expect(policy).toContain('with check');
    }
  });

  it('does not grant tenant data access to anon or authenticated', () => {
    const sql = readSql(migrationPath);

    expect(sql).toContain('revoke all on table');
    expect(sql).not.toMatch(/grant[\s\S]*\bto\s+(anon|authenticated)\b/);
  });

  it('ships an explicit rollback for policies, RLS and helper functions', () => {
    const sql = readSql(rollbackPath);

    expect(sql).toContain('drop policy');
    expect(sql).toContain('disable row level security');
    expect(sql).toContain('drop function if exists private.set_tenant_context(integer)');
    expect(sql).toContain('drop function if exists private.current_tenant_id()');
  });
});
