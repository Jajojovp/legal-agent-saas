CREATE TABLE IF NOT EXISTS subscriptions (
  id serial PRIMARY KEY,
  firm_id integer NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id),
  provider text NOT NULL DEFAULT 'mercadopago',
  provider_subscription_id text NOT NULL,
  plan_tier text NOT NULL,
  plan_interval text NOT NULL,
  currency text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','past_due','cancelled','expired')),
  provider_status text NOT NULL DEFAULT 'pending',
  current_period_start timestamp,
  current_period_end timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_firm_unique ON subscriptions(firm_id);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_id_unique ON subscriptions(provider, provider_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_user_idx ON subscriptions(user_id);

CREATE TABLE IF NOT EXISTS subscription_checkout_attempts (
  id serial PRIMARY KEY,
  firm_id integer NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id),
  provider_subscription_id text NOT NULL,
  plan_tier text NOT NULL,
  plan_interval text NOT NULL,
  currency text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscription_attempts_provider_id_unique ON subscription_checkout_attempts(provider_subscription_id);
CREATE INDEX IF NOT EXISTS subscription_attempts_firm_created_idx ON subscription_checkout_attempts(firm_id, created_at);

CREATE TABLE IF NOT EXISTS payment_events (
  id serial PRIMARY KEY,
  firm_id integer NOT NULL REFERENCES law_firms(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'mercadopago',
  request_id text NOT NULL,
  provider_event_id text NOT NULL,
  resource_id text NOT NULL,
  event_type text NOT NULL,
  action text NOT NULL,
  payload jsonb NOT NULL,
  processing_status text NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received','processed','failed','ignored')),
  error_code text,
  processed_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS payment_events_provider_request_unique ON payment_events(provider, request_id);
CREATE UNIQUE INDEX IF NOT EXISTS payment_events_provider_event_unique ON payment_events(provider, provider_event_id);
CREATE INDEX IF NOT EXISTS payment_events_resource_idx ON payment_events(resource_id);
CREATE INDEX IF NOT EXISTS payment_events_firm_idx ON payment_events(firm_id);
