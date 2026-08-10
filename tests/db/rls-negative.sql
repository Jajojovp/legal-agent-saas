-- Integration smoke test for a Supabase staging database.
-- Prerequisite: rls_multitenant_up.sql has been applied.
-- Run as postgres/migration owner. Fixtures are always rolled back.

BEGIN;

SET LOCAL ROLE service_role;
INSERT INTO public.law_firms (id, name, email)
VALUES
  (2147483001, 'RLS Test Firm A', 'rls-a@example.invalid'),
  (2147483002, 'RLS Test Firm B', 'rls-b@example.invalid');

INSERT INTO public.users (id, firm_id, email, name, role)
VALUES
  (2147483001, 2147483001, 'rls-user-a@example.invalid', 'RLS User A', 'owner'),
  (2147483002, 2147483002, 'rls-user-b@example.invalid', 'RLS User B', 'owner');

INSERT INTO public.leads (id, firm_id, name, email)
VALUES
  (2147483001, 2147483001, 'Lead A', 'lead-a@example.invalid'),
  (2147483002, 2147483002, 'Lead B', 'lead-b@example.invalid');

RESET ROLE;
SET LOCAL ROLE legal_agent_app;

-- Fail closed before a tenant has been selected.
DO $assert$
BEGIN
  IF (SELECT count(*) FROM public.leads) <> 0 THEN
    RAISE EXCEPTION 'RLS failure: rows visible without app.firm_id';
  END IF;
END
$assert$;

SELECT private.set_tenant_context(2147483001);

-- Firm A sees exactly its own fixture, never Firm B.
DO $assert$
DECLARE
  affected integer;
  rejected boolean := false;
BEGIN
  IF (SELECT count(*) FROM public.leads WHERE id IN (2147483001, 2147483002)) <> 1 THEN
    RAISE EXCEPTION 'RLS failure: tenant A did not see exactly one lead';
  END IF;

  IF EXISTS (SELECT 1 FROM public.leads WHERE id = 2147483002) THEN
    RAISE EXCEPTION 'RLS failure: tenant A read tenant B lead';
  END IF;

  UPDATE public.leads SET name = 'cross-tenant update' WHERE id = 2147483002;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN
    RAISE EXCEPTION 'RLS failure: tenant A updated tenant B lead';
  END IF;

  BEGIN
    INSERT INTO public.leads (firm_id, name, email)
    VALUES (2147483002, 'cross-tenant insert', 'cross@example.invalid');
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      rejected := true;
  END;

  IF NOT rejected THEN
    RAISE EXCEPTION 'RLS failure: tenant A inserted a tenant B lead';
  END IF;
END
$assert$;

RESET ROLE;
ROLLBACK;
