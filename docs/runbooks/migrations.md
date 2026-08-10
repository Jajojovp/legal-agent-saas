# Runbook — Database Migrations

## Background / P0 context

Before this remediation, the `vercel-build` npm script was:

```
"vercel-build": "npm run db:push && next build"
```

This ran `drizzle-kit push` against the production database on **every Vercel
build**. `drizzle-kit push` is a **stateless schema sync**: it diffs
`lib/db/schema.ts` against the live DB and applies changes directly, without
producing migration files, without review, and without a rollback path. Running
this from a build pipeline is dangerous because:

- Build artefacts should be immutable. Mutating prod state from `next build`
  breaks the "build is reproducible" invariant.
- A failed build could leave the DB in a half-applied state.
- There is no audit trail (no migration files in git).
- Rollbacks are impossible — there is no `down`.

The P0 remediation makes `vercel-build` (and `build`) **non-mutating**: they
only run `next build`. **No build step ever touches the DB.**

## Current scripts (`package.json`)

| Script             | Command                | When to run                                |
|--------------------|------------------------|--------------------------------------------|
| `db:generate`      | `drizzle-kit generate` | Locally, after changing `lib/db/schema.ts`. Produces migration SQL files in `./drizzle/`. **Works without a DB connection** — it diffs `schema.ts` against the last generated migration file, not the live DB. |
| `db:migrate`       | `drizzle-kit migrate`  | Against a target environment (dev/staging/prod) to apply the *generated* migration files previously committed. Requires a `DATABASE_URL`. **This is the safe path to prod.** |
| `db:push`          | `drizzle-kit push`     | **Dev sandbox only.** Stateless sync. Never run this against staging or prod. Kept for fast iteration on a throwable local DB. |
| `db:studio`        | `drizzle-kit studio`   | Local DB inspector UI. |
| `db:seed`          | `tsx lib/db/seed.ts`   | Local seed. Never against prod. |
| `vercel-build`     | `next build`           | Vercel build hook. **Non-mutating.** |

## Why we couldn't fully migrate right now

`drizzle-kit generate` operates off the migration files tracked in
`./drizzle/`. That directory is currently `.gitignore`d (see `.gitignore` line
`drizzle/`). Without a baseline migration file committed, `generate` would
re-diff against an absent history the first time, which still requires access
to the live schema or a baseline. We deliberately did **not** attempt to
auto-generate the initial migration set as part of this P0 — that requires a
 conscious human decision about the starting baseline:

- Pick a stable commit as the baseline.
- Run `npm run db:generate` against a DB at that baseline to capture it.
- Commit `./drizzle/*.sql` to git and **remove** `drizzle/` from `.gitignore`.

That work is intentionally deferred here because:

1. It requires DB access (this remediation is independent and credential-free).
2. It is a one-time-onboarding decision that the team must make deliberately.

## Safe migration procedure for production

1. **Develop locally** against a throwaway DB:
   ```sh
   npm run db:push  # iterate fast on local schema
   ```
2. **Capture the change** as a migration file (no DB required):
   ```sh
   npm run db:generate
   git add drizzle/*.sql
   git commit -m "db: add <change description>"
   ```
3. **Review the generated SQL** in `drizzle/` before committing. Drizzle
   migrations are code.
4. **Open a PR**. CI runs lint → typecheck → build. **CI never migrates.**
5. **After merge**, apply the migration to prod **out of band**, not from the
   build pipeline:
   ```sh
   DATABASE_URL="$PROD_DATABASE_URL" npm run db:migrate
   ```
   Run this from your laptop or a dedicated one-off job (Vercel cron / a
   Railway shell), **before** promoting the build that depends on the new
   schema.
6. **Promote the build.** Because `vercel-build` is now non-mutating, the
   deploy will not fight the migration you just ran.

## Rollback

- `drizzle-kit migrate` does not generate `down` files automatically. To
  roll back, write a hand-rolled `*.sql` migration that reverses the change
  and run it via the same out-of-band procedure.
- Keep each migration small and reversible. Avoid destructive `DROP` /
  `ALTER` ... `NOT NULL` without a default.

## What CI does and does not do

- CI runs `npm run lint`, `npm run typecheck`, `npm run build`.
- CI provides **placeholder** env vars (see
  `.github/workflows/ci.yml`). These are not real secrets. CI never connects
  to a DB and never runs migrations.
- CI does not run `db:push` or `db:migrate`. Ever.