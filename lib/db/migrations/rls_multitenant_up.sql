-- Multitenant RLS defense in depth for Legal Agent SaaS.
-- Apply with a migration owner (postgres in Supabase), never with the web-app role.
-- The web application must SET LOCAL the tenant inside every transaction.

BEGIN;

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;

DO $role$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'legal_agent_app') THEN
    CREATE ROLE legal_agent_app NOLOGIN NOINHERIT NOBYPASSRLS;
  ELSE
    ALTER ROLE legal_agent_app NOLOGIN NOINHERIT NOBYPASSRLS;
  END IF;
END
$role$;

CREATE OR REPLACE FUNCTION private.current_tenant_id()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
DECLARE
  raw_firm_id text := current_setting('app.firm_id', true);
BEGIN
  IF raw_firm_id IS NULL OR raw_firm_id !~ '^[1-9][0-9]*$' THEN
    RETURN NULL;
  END IF;

  BEGIN
    RETURN raw_firm_id::integer;
  EXCEPTION WHEN numeric_value_out_of_range THEN
    RETURN NULL;
  END;
END
$function$;

CREATE OR REPLACE FUNCTION private.set_tenant_context(p_firm_id integer)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY INVOKER
SET search_path = pg_catalog
AS $function$
BEGIN
  IF p_firm_id IS NULL OR p_firm_id <= 0 THEN
    RAISE EXCEPTION 'firm_id must be a positive integer'
      USING ERRCODE = '22023';
  END IF;

  -- true means transaction-local. It is cleared automatically at COMMIT/ROLLBACK.
  PERFORM set_config('app.firm_id', p_firm_id::text, true);
END
$function$;

REVOKE ALL ON FUNCTION private.current_tenant_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.set_tenant_context(integer) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO legal_agent_app;
GRANT EXECUTE ON FUNCTION private.current_tenant_id() TO legal_agent_app;
GRANT EXECUTE ON FUNCTION private.set_tenant_context(integer) TO legal_agent_app;

REVOKE ALL ON TABLE
  public.law_firms,
  public.users,
  public.accounts,
  public.sessions,
  public.verification_tokens,
  public.subscriptions,
  public.subscription_checkout_attempts,
  public.payment_events,
  public.leads,
  public.cases,
  public.tasks,
  public.documents,
  public.time_entries,
  public.invoices,
  public.chat_conversations,
  public.kpi_metrics,
  public.email_campaigns
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.law_firms,
  public.users,
  public.accounts,
  public.sessions,
  public.subscriptions,
  public.subscription_checkout_attempts,
  public.payment_events,
  public.leads,
  public.cases,
  public.tasks,
  public.documents,
  public.time_entries,
  public.invoices,
  public.chat_conversations,
  public.kpi_metrics,
  public.email_campaigns
TO legal_agent_app;

GRANT USAGE, SELECT ON SEQUENCE
  public.law_firms_id_seq,
  public.users_id_seq,
  public.accounts_id_seq,
  public.sessions_id_seq,
  public.subscriptions_id_seq,
  public.subscription_checkout_attempts_id_seq,
  public.payment_events_id_seq,
  public.leads_id_seq,
  public.cases_id_seq,
  public.tasks_id_seq,
  public.documents_id_seq,
  public.time_entries_id_seq,
  public.invoices_id_seq,
  public.chat_conversations_id_seq,
  public.kpi_metrics_id_seq,
  public.email_campaigns_id_seq
TO legal_agent_app;

-- service_role is an explicit trusted bypass for migrations, auth bootstrap and
-- controlled background operations. It must never be exposed to browser code.
GRANT ALL ON TABLE
  public.law_firms,
  public.users,
  public.accounts,
  public.sessions,
  public.verification_tokens,
  public.subscriptions,
  public.subscription_checkout_attempts,
  public.payment_events,
  public.leads,
  public.cases,
  public.tasks,
  public.documents,
  public.time_entries,
  public.invoices,
  public.chat_conversations,
  public.kpi_metrics,
  public.email_campaigns
TO service_role;

ALTER TABLE public.law_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.law_firms FORCE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions FORCE ROW LEVEL SECURITY;
-- Tokens have no tenant key and are intentionally inaccessible to the app role.
-- NextAuth bootstrap must use the separately controlled service role.
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_checkout_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_checkout_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events FORCE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents FORCE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices FORCE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns FORCE ROW LEVEL SECURITY;

-- Policies are generated consistently for direct and indirect tenant ownership.
-- UPDATE deliberately contains both USING and WITH CHECK.
DO $policies$
DECLARE
  tenant_table record;
BEGIN
  FOR tenant_table IN
    SELECT * FROM (VALUES
      ('law_firms', 'id = private.current_tenant_id()'),
      ('users', 'firm_id = private.current_tenant_id()'),
      ('accounts', 'EXISTS (SELECT 1 FROM public.users u WHERE u.id = accounts.user_id AND u.firm_id = private.current_tenant_id())'),
      ('sessions', 'EXISTS (SELECT 1 FROM public.users u WHERE u.id = sessions.user_id AND u.firm_id = private.current_tenant_id())'),
      ('subscriptions', 'firm_id = private.current_tenant_id()'),
      ('subscription_checkout_attempts', 'firm_id = private.current_tenant_id()'),
      ('payment_events', 'firm_id = private.current_tenant_id()'),
      ('leads', 'firm_id = private.current_tenant_id()'),
      ('cases', 'firm_id = private.current_tenant_id()'),
      ('tasks', 'firm_id = private.current_tenant_id()'),
      ('documents', 'firm_id = private.current_tenant_id()'),
      ('time_entries', 'firm_id = private.current_tenant_id()'),
      ('invoices', 'firm_id = private.current_tenant_id()'),
      ('chat_conversations', 'firm_id = private.current_tenant_id()'),
      ('kpi_metrics', 'firm_id = private.current_tenant_id()'),
      ('email_campaigns', 'firm_id = private.current_tenant_id()')
    ) AS scoped(table_name, predicate)
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_select ON public.%I', tenant_table.table_name);
    EXECUTE format('DROP POLICY IF EXISTS tenant_insert ON public.%I', tenant_table.table_name);
    EXECUTE format('DROP POLICY IF EXISTS tenant_update ON public.%I', tenant_table.table_name);
    EXECUTE format('DROP POLICY IF EXISTS tenant_delete ON public.%I', tenant_table.table_name);

    EXECUTE format(
      'CREATE POLICY tenant_select ON public.%I FOR SELECT TO legal_agent_app USING (%s)',
      tenant_table.table_name, tenant_table.predicate
    );
    EXECUTE format(
      'CREATE POLICY tenant_insert ON public.%I FOR INSERT TO legal_agent_app WITH CHECK (%s)',
      tenant_table.table_name, tenant_table.predicate
    );
    EXECUTE format(
      'CREATE POLICY tenant_update ON public.%I FOR UPDATE TO legal_agent_app USING (%s) WITH CHECK (%s)',
      tenant_table.table_name, tenant_table.predicate, tenant_table.predicate
    );
    EXECUTE format(
      'CREATE POLICY tenant_delete ON public.%I FOR DELETE TO legal_agent_app USING (%s)',
      tenant_table.table_name, tenant_table.predicate
    );
  END LOOP;
END
$policies$;

-- Existing nullable firm_id values remain quarantined (invisible) instead of
-- making deployment fail. Backfill and NOT NULL enforcement require a separate,
-- data-audited migration.
CREATE INDEX IF NOT EXISTS rls_documents_firm_idx ON public.documents (firm_id);
CREATE INDEX IF NOT EXISTS rls_time_entries_firm_idx ON public.time_entries (firm_id);
CREATE INDEX IF NOT EXISTS rls_invoices_firm_idx ON public.invoices (firm_id);
CREATE INDEX IF NOT EXISTS rls_email_campaigns_firm_idx ON public.email_campaigns (firm_id);

COMMIT;
