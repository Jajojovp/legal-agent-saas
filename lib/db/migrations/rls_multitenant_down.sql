-- Rollback for rls_multitenant_up.sql. Run only after draining application traffic.
BEGIN;

DO $policies$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'law_firms', 'users', 'accounts', 'sessions', 'verification_tokens',
    'subscriptions', 'subscription_checkout_attempts', 'payment_events',
    'leads', 'cases', 'tasks',
    'documents', 'time_entries', 'invoices', 'chat_conversations',
    'kpi_metrics', 'email_campaigns'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_select ON public.%I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS tenant_insert ON public.%I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS tenant_update ON public.%I', table_name);
    EXECUTE format('DROP POLICY IF EXISTS tenant_delete ON public.%I', table_name);
    EXECUTE format('ALTER TABLE public.%I NO FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END
$policies$;

REVOKE ALL ON FUNCTION private.set_tenant_context(integer) FROM legal_agent_app;
REVOKE ALL ON FUNCTION private.current_tenant_id() FROM legal_agent_app;
REVOKE USAGE ON SCHEMA private FROM legal_agent_app;
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE
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
FROM legal_agent_app;
REVOKE USAGE, SELECT ON SEQUENCE
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
FROM legal_agent_app;

DROP FUNCTION IF EXISTS private.set_tenant_context(integer);
DROP FUNCTION IF EXISTS private.current_tenant_id();

DROP INDEX IF EXISTS public.rls_documents_firm_idx;
DROP INDEX IF EXISTS public.rls_time_entries_firm_idx;
DROP INDEX IF EXISTS public.rls_invoices_firm_idx;
DROP INDEX IF EXISTS public.rls_email_campaigns_firm_idx;

-- The role and private schema are intentionally retained: either may be shared by
-- later migrations, and DROP ROLE is unsafe while login-role memberships exist.
COMMIT;
