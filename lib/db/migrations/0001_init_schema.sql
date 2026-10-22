-- ═══════════════════════════════════════════════════════════════════
--  LEGAL AGENT SAAS - Schema DDL (generado desde lib/db/schema.ts)
--  Motor: PostgreSQL (Supabase)
--  Idempotente: usa IF NOT EXISTS y DO blocks para enums
-- ═══════════════════════════════════════════════════════════════════

-- Habilitar extensión uuid-ossp (opcional, referenciada en schema.ts)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════
--  ENUMS
-- ═══════════════════════════════════════════════════════════════════
DO $$ BEGIN
  CREATE TYPE practice_area AS ENUM (
    'personal-injury','family-law','criminal-defense','estate-planning',
    'business-law','real-estate','immigration','employment-law',
    'bankruptcy','intellectual-property'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM (
    'new','contacted','qualified','consultation-scheduled','converted','lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE case_status AS ENUM (
    'intake','active','pending','closed-won','closed-lost'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ═══════════════════════════════════════════════════════════════════
--  LAW FIRMS (tabla raíz - sin FKs)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS law_firms (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  zip_code        TEXT,
  country         TEXT DEFAULT 'USA',
  practice_areas  TEXT[],
  website         TEXT,
  locale          TEXT DEFAULT 'en',
  settings        JSONB,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
--  USERS (NextAuth + firm_id FK a law_firms)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  firm_id         INTEGER REFERENCES law_firms(id),
  email           TEXT NOT NULL UNIQUE,
  email_verified  TIMESTAMP,
  name            TEXT NOT NULL,
  image           TEXT,
  hashed_password TEXT,
  role            TEXT NOT NULL DEFAULT 'attorney',
  phone           TEXT,
  locale          TEXT DEFAULT 'en',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS users_firm_idx ON users(firm_id);

-- ═══════════════════════════════════════════════════════════════════
--  ACCOUNTS (NextAuth - OAuth accounts)
--  PK compuesta: (provider, provider_account_id)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS accounts (
  id                 SERIAL PRIMARY KEY,
  user_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type               TEXT NOT NULL,
  provider           TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token      TEXT,
  access_token       TEXT,
  expires_at         INTEGER,
  token_type         TEXT,
  scope              TEXT,
  id_token           TEXT,
  session_state      TEXT,
  PRIMARY KEY (provider, provider_account_id)
);

-- ═══════════════════════════════════════════════════════════════════
--  SESSIONS (NextAuth)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sessions (
  id            SERIAL PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMP NOT NULL
);

-- ═══════════════════════════════════════════════════════════════════
--  VERIFICATION TOKENS (NextAuth)
--  PK compuesta: (identifier, token)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token      TEXT NOT NULL,
  expires    TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ═══════════════════════════════════════════════════════════════════
--  LEADS (CRM)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS leads (
  id               SERIAL PRIMARY KEY,
  firm_id          INTEGER REFERENCES law_firms(id),
  name             TEXT NOT NULL,
  email            TEXT NOT NULL,
  phone            TEXT,
  practice_area    practice_area,
  case_description TEXT,
  status           lead_status DEFAULT 'new',
  source           TEXT,
  score            INTEGER DEFAULT 0,
  assigned_to      INTEGER REFERENCES users(id),
  metadata         JSONB,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS leads_firm_idx     ON leads(firm_id);
CREATE INDEX IF NOT EXISTS leads_status_idx   ON leads(status);
CREATE INDEX IF NOT EXISTS leads_assigned_idx ON leads(assigned_to);

-- ═══════════════════════════════════════════════════════════════════
--  CASES
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cases (
  id                SERIAL PRIMARY KEY,
  firm_id           INTEGER REFERENCES law_firms(id),
  lead_id           INTEGER REFERENCES leads(id),
  case_number       TEXT NOT NULL UNIQUE,
  client_name       TEXT NOT NULL,
  practice_area     practice_area,
  status            case_status DEFAULT 'intake',
  assigned_attorney INTEGER REFERENCES users(id),
  description       TEXT,
  court_info        JSONB,
  important_dates   JSONB,
  estimated_value   DECIMAL(10, 2),
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS cases_firm_idx     ON cases(firm_id);
CREATE INDEX IF NOT EXISTS cases_status_idx   ON cases(status);
CREATE INDEX IF NOT EXISTS cases_attorney_idx ON cases(assigned_attorney);

-- ═══════════════════════════════════════════════════════════════════
--  TASKS & DEADLINES
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tasks (
  id            SERIAL PRIMARY KEY,
  firm_id       INTEGER REFERENCES law_firms(id),
  case_id       INTEGER REFERENCES cases(id),
  title         TEXT NOT NULL,
  description   TEXT,
  assigned_to   INTEGER REFERENCES users(id),
  due_date      TIMESTAMP,
  priority      TEXT DEFAULT 'medium',
  is_completed  BOOLEAN DEFAULT FALSE,
  completed_at  TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS tasks_firm_idx       ON tasks(firm_id);
CREATE INDEX IF NOT EXISTS tasks_assigned_idx   ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx   ON tasks(due_date);

-- ═══════════════════════════════════════════════════════════════════
--  DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS documents (
  id          SERIAL PRIMARY KEY,
  firm_id     INTEGER REFERENCES law_firms(id),
  case_id     INTEGER REFERENCES cases(id),
  file_name   TEXT NOT NULL,
  file_type   TEXT,
  file_size   INTEGER,
  file_url    TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  ai_analysis JSONB,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
--  TIME ENTRIES (billing)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS time_entries (
  id           SERIAL PRIMARY KEY,
  firm_id      INTEGER REFERENCES law_firms(id),
  case_id      INTEGER REFERENCES cases(id),
  user_id      INTEGER REFERENCES users(id),
  description  TEXT NOT NULL,
  hours        DECIMAL(5, 2) NOT NULL,
  hourly_rate  DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  date         TIMESTAMP NOT NULL,
  is_billable  BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
--  INVOICES
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS invoices (
  id            SERIAL PRIMARY KEY,
  firm_id       INTEGER REFERENCES law_firms(id),
  case_id       INTEGER REFERENCES cases(id),
  invoice_number TEXT NOT NULL UNIQUE,
  client_name   TEXT NOT NULL,
  total_amount  DECIMAL(10, 2) NOT NULL,
  paid_amount   DECIMAL(10, 2) DEFAULT '0',
  status        TEXT DEFAULT 'draft',
  due_date      TIMESTAMP,
  paid_date     TIMESTAMP,
  line_items    JSONB,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
--  CHAT CONVERSATIONS (chatbot)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_conversations (
  id         SERIAL PRIMARY KEY,
  firm_id    INTEGER REFERENCES law_firms(id),
  lead_id    INTEGER REFERENCES leads(id),
  session_id TEXT NOT NULL UNIQUE,
  locale     TEXT DEFAULT 'en',
  messages   JSONB NOT NULL,
  outcome    TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS chat_firm_idx    ON chat_conversations(firm_id);
CREATE INDEX IF NOT EXISTS chat_session_idx ON chat_conversations(session_id);

-- ═══════════════════════════════════════════════════════════════════
--  KPI METRICS (daily snapshots)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS kpi_metrics (
  id                      SERIAL PRIMARY KEY,
  firm_id                 INTEGER REFERENCES law_firms(id),
  date                    TIMESTAMP NOT NULL,
  website_visitors        INTEGER DEFAULT 0,
  leads_generated         INTEGER DEFAULT 0,
  consultations_scheduled INTEGER DEFAULT 0,
  new_clients             INTEGER DEFAULT 0,
  revenue                 DECIMAL(10, 2) DEFAULT '0',
  billable_hours          DECIMAL(8, 2) DEFAULT '0',
  metrics                 JSONB,
  created_at              TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS kpi_firm_idx ON kpi_metrics(firm_id);
CREATE INDEX IF NOT EXISTS kpi_date_idx ON kpi_metrics(date);

-- ═══════════════════════════════════════════════════════════════════
--  EMAIL CAMPAIGNS
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS email_campaigns (
  id            SERIAL PRIMARY KEY,
  firm_id       INTEGER REFERENCES law_firms(id),
  name          TEXT NOT NULL,
  subject       TEXT NOT NULL,
  content       TEXT NOT NULL,
  sent_to       INTEGER DEFAULT 0,
  opened        INTEGER DEFAULT 0,
  clicked       INTEGER DEFAULT 0,
  converted     INTEGER DEFAULT 0,
  status        TEXT DEFAULT 'draft',
  scheduled_for TIMESTAMP,
  sent_at       TIMESTAMP,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
--  SUBSCRIPTIONS (billing)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS subscriptions (
  id                       SERIAL PRIMARY KEY,
  firm_id                  INTEGER NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
  user_id                  INTEGER NOT NULL REFERENCES users(id),
  provider                 TEXT NOT NULL DEFAULT 'mercadopago',
  provider_subscription_id TEXT NOT NULL,
  plan_tier                TEXT NOT NULL,
  plan_interval            TEXT NOT NULL,
  currency                 TEXT NOT NULL,
  amount                   DECIMAL(12, 2) NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'pending',
  provider_status          TEXT NOT NULL DEFAULT 'pending',
  current_period_start     TIMESTAMP,
  current_period_end       TIMESTAMP,
  created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_firm_unique        ON subscriptions(firm_id);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_id_unique ON subscriptions(provider, provider_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_user_idx                  ON subscriptions(user_id);

-- ═══════════════════════════════════════════════════════════════════
--  SUBSCRIPTION CHECKOUT ATTEMPTS
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS subscription_checkout_attempts (
  id                       SERIAL PRIMARY KEY,
  firm_id                  INTEGER NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
  user_id                  INTEGER NOT NULL REFERENCES users(id),
  provider_subscription_id TEXT NOT NULL,
  plan_tier                TEXT NOT NULL,
  plan_interval            TEXT NOT NULL,
  currency                 TEXT NOT NULL,
  amount                   DECIMAL(12, 2) NOT NULL,
  status                   TEXT NOT NULL DEFAULT 'pending',
  created_at               TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscription_attempts_provider_id_unique ON subscription_checkout_attempts(provider_subscription_id);
CREATE INDEX IF NOT EXISTS subscription_attempts_firm_created_idx         ON subscription_checkout_attempts(firm_id, created_at);

-- ═══════════════════════════════════════════════════════════════════
--  PAYMENT EVENTS (webhooks)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS payment_events (
  id                SERIAL PRIMARY KEY,
  firm_id           INTEGER NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
  provider           TEXT NOT NULL DEFAULT 'mercadopago',
  request_id         TEXT NOT NULL,
  provider_event_id  TEXT NOT NULL,
  resource_id        TEXT NOT NULL,
  event_type         TEXT NOT NULL,
  action             TEXT NOT NULL,
  payload            JSONB NOT NULL,
  processing_status  TEXT NOT NULL DEFAULT 'received',
  error_code         TEXT,
  processed_at       TIMESTAMP,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_events_provider_request_unique ON payment_events(provider, request_id);
CREATE UNIQUE INDEX IF NOT EXISTS payment_events_provider_event_unique  ON payment_events(provider, provider_event_id);
CREATE INDEX IF NOT EXISTS payment_events_resource_idx                   ON payment_events(resource_id);
CREATE INDEX IF NOT EXISTS payment_events_firm_idx                       ON payment_events(firm_id);

-- ═══════════════════════════════════════════════════════════════════
--  FIN DEL SCRIPT
-- ═══════════════════════════════════════════════════════════════════
