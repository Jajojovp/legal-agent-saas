# ADR-0005: Estrategia de migraciones reversibles (reemplazar db:push)

- **Estado:** Propuesto
- **Fecha:** 2026-08-05
- **Contexto:** `package.json:11-16` define `db:migrate` y `db:push` como `drizzle-kit push` (sin versionar ni revertir). `vercel-build` ejecuta `db:push` antes del build: schema aplicado sin revisión en cada deploy. database.spec R1/R2/R5 violados. RISK-004 del intake. Gaps: ID-GAP-004. F21 (RLS Postgres `lib/db/supabase-init.sql` vacío, zero RLS).
- **Decisión:**
  1. Reemplazar `db:migrate` por `drizzle-kit migrate`; quitar `db:push` de `vercel-build` (build no muta schema productivo).
  2. Generar migraciones versionadas con `drizzle-kit generate` (archivos `drizzle/*.sql` con `up`; revisar y añadir manualmente `down`).
  3. Toda migración nueva es reversible (`up`/`down`); las destructivas requieren ADR dedicado.
  4. RPO/RPO declarados: **RPO ≤ 24h** (backups diarios Supabase), **RTO ≤ 4h**. Restores ensayados trimestralmente (calendar P1).
  5. RLS Postgres como defense-in-depth en P1 tardía: policy por tabla `firm_id = current_setting('app.firm_id')`; setter `SET LOCAL app.firm_id = $firmId` al inicio de cada query/transacción del handler. **No sustituye** la capa app ADR-0002.
  6. Snapshot inicial de schema actual como migración 0000 baseline; produccion etiquetada.
- **Alternativas consideradas:**
  - *Mantener `db:push`.* Contras: no versionado, no reversible, propaga cambios por omisión — rechazado (R2).
  - *Flyway/Alembic externo a Drizzle.* Contras: doble toolchain; Drizzle ya está en uso. Se reevalúa si se necesita audit trail de migraciones más rico en P2.
  - *Sólo RLS, sin migraciones reversibles.* Contras: RLS no aborda reversibilidad ni deploy-time safety.
- **Consecuencias:**
  - Positivas: deploys sin mutaciones inesperadas; rollback posible; auditoría de cambios.
  - Negativas: proceso manual de revisión de SQL generado; curva del equipo con `drizzle-kit migrate`.
  - Neutralizadas: docs internos + checklist de revisión; CI valida que toda migración tenga `down`.
- **Módulos afectados:** `package.json`, `drizzle.config.ts`, `drizzle/` (carpeta nueva), `lib/db/index.ts`, `lib/db/supabase-init.sql` (RLS), CI workflow (validar `down`).
- **Riesgos:** RLS mal aplicado rompe queries existentes → mitigación: feature flag, staging, aplicado por tabla. Baseline de schema descalce → mitigación: snapshot + dry-run en staging. `down` destructivo que pierde datos → mitigación: lint ci prohíbe `down` que haga `DROP TABLE` de tabla con datos (requiere revision semanal).
- **Reversión:** Reponer `db:push`. Coste: bajo. Riesgo de reversión ALTO (revive RISK-004 y pierde trazabilidad).
- **Ruptura de contrato:** Interna (proceso de deploy). No afecta HTTP.
- **Specs:** database.spec R1/R2/R3/R4/R5/R11, architecture.spec R9.
