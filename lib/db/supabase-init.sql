-- One-time prerequisites. Run as the Supabase migration owner, not from the app.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create the base schema through reviewed Drizzle migrations.
-- 2. Apply lib/db/migrations/rls_multitenant_up.sql in staging.
-- 3. Run tests/db/rls-negative.sql in staging; it always ROLLBACKs fixtures.
-- 4. Configure the server connection with a dedicated LOGIN role that is a
--    member of legal_agent_app. Never use service_role in browser code.
--
-- RLS is fail-closed: ordinary queries return no tenant rows unless the server
-- starts a transaction and calls private.set_tenant_context(firm_id).
-- See docs/seguridad/rls-multitenant.md for deployment and rollback.
