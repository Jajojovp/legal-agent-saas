# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Select your organization or create one
4. Enter a project name (e.g., `legal-agent-saas`)
5. Set a strong database password (save it securely)
6. Choose a region closest to your users
7. Click **Create project** (takes ~2 minutes to provision)

## 2. Get Credentials

### Connection String (for Drizzle ORM)
1. Go to **Settings** → **Database** → **Connection string**
2. Select **URI** tab
3. Copy the connection string (replace `[YOUR-PASSWORD]` with your DB password)
4. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

### API Keys
1. Go to **Settings** → **API**
2. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon` / `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-ID].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

## 4. Run Database Migrations

```bash
npm run db:push
```

This will create all tables defined in `lib/db/schema.ts` on your Supabase database.

## 5. Enable Row Level Security (Optional)

Supabase supports Row Level Security (RLS) for fine-grained access control. To enable it per table, run in Supabase SQL Editor:

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- Add policies as needed
```

## 6. Supabase Free Tier Limits

| Resource | Limit |
|----------|-------|
| Database | 500 MB |
| Auth users | 50,000 MAU |
| Storage | 1 GB |
| Bandwidth | 2 GB/month |
| Edge Functions | 500K invocations/month |
| Realtime | 200 concurrent connections |

## 7. Useful Commands

```bash
# Push schema changes to Supabase
npm run db:push

# Open Drizzle Studio to inspect data
npm run db:studio

# Generate migrations
npm run db:generate
```
