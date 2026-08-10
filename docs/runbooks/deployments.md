# Runbook — Deployments & Health Probes

## Build is non-mutating

As of the P0 remediation, the build pipeline never touches the database:

- `npm run build` → `next build` only.
- `npm run vercel-build` → `next build` only.
- The Dockerfile runs `npm run build` only.

Migrations are now an explicit, separate, human-driven step. See
[`migrations.md`](./migrations.md).

## Container image

`next.config.js` now sets `output: 'standalone'`. This makes Next.js emit a
self-contained trace in `.next/standalone` that the existing `Dockerfile`
copies into the final image. Before this change, the Dockerfile was copying a
directory that `next build` never produced, so the container would not start.

To build the image locally:

```sh
docker build -t legal-agent-saas:local .
docker run --rm -p 3000:3000 \
  -e DATABASE_URL=... \
  -e NEXTAUTH_SECRET=... \
  -e NEXTAUTH_URL=http://localhost:3000 \
  legal-agent-saas:local
```

Never bake secrets into the image. Pass them at runtime via `-e` or your
orchestrator's secret mechanism.

## Health probes

Two endpoints are exposed and **intentionally do not read secrets**:

### `GET /api/health/live`
- **Purpose:** liveness. "Is the process alive and serving requests?"
- **Behaviour:** always returns `200 {"status":"alive","uptime":<seconds>}`
  unless the process is unreachable.
- **Use as:** Kubernetes `livenessProbe`, container restart policy trigger.
- **Never touches the DB.** Never reads env values.

### `GET /api/health/ready`
- **Purpose:** readiness. "Is this instance configured to receive traffic?"
- **Behaviour:** returns `200 {"status":"ready",...}` when required env vars
  are *present* (boolean check on `length > 0`, never the value), `503`
  otherwise. Returns named per-check `ok`/`missing` so operators can see
  *which* var is missing without exposing the value.
- **Use as:** Kubernetes `readinessProbe`, load-balancer gate.
- **Limitation:** does not ping the DB. A DB-readiness check belongs here
  eventually, but it requires a runtime DB client and careful secret
  handling. Keeping this probe independent of the DB and free of secret
  echo was an explicit P0 requirement.

### Example Kubernetes snippet

```yaml
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15
  failureThreshold: 3
readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 3
```

## CI

`.github/workflows/ci.yml` runs on push and pull_request against `main`:

1. `npm run lint`
2. `npm run typecheck` (added in this P0)
3. `npm run build`

Environment is **placeholder-only** (see the `env:` block in the workflow).
CI has `permissions: contents: read` only. It never deploys, never connects to
a DB, and never sees real secrets.

## Out of scope for this P0 (do later)

- DB ping in `/api/health/ready`.
- Real migration baseline (see `migrations.md`).
- Vercel preview deploys gated by CI status.
- Container image SBOM + signature (cosign).
- Structured logging / OpenTelemetry traces.