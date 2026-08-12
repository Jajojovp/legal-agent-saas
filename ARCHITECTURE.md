# ARCHITECTURE — Estado actual y arquitectura objetivo incremental

- **Auditoría:** 2026-08-11
- **Principio rector (visión §84/§119):** no reconstruir desde cero. Evolución por bounded capabilities, reutilizando el monolito Next.js + Drizzle/Postgres existente.
- Este documento describe **qué hay hoy** y **hacia dónde migra incrementalmente**, sin proponer un big-bang rewrite.

---

## 1. Estado actual

### 1.1 Mapa de capas (hoy)

```
                        ┌─────────────────────────────────┐
   Browser (CSS + JSX)  │  app/[locale]  (Next.js App Router) │
                        │  landing · blog · pricing · tools   │
                        │  (dashboard)/{analytics,billing,    │
                        │   cases,leads,messages,settings,   │
                        │   tasks}                            │
                        └───────────────┬─────────────────────┘
                                        │ fetch
                        ┌───────────────▼─────────────────────┐
                        │  app/api/*  (Route Handlers, Node)  │
                        │  auth · leads · cases · tasks       │
                        │  dashboard/kpi · chatbot/message     │
                        │  ai/{analyze-document,knowledge}    │
                        │  payments/mp/{checkout,webhook}      │
                        │  payments/takenos/info · health/*   │
                        └───────────────┬─────────────────────┘
                                        │
            ┌───────────────────────────┼───────────────────────────┐
            ▼                           ▼                           ▼
   ┌─────────────────────┐  ┌───────────────────────┐  ┌────────────────────────┐
   │ lib/auth (pure)     │  │ lib/db (Drizzle)      │  │ lib/ai (Gemini)        │
   │ context · session   │  │ schema · tenant-ctx   │  │ legal-ai-service ·     │
   │ authorization       │  │ migrate · seed        │  │ document-service ·     │
   │ dashboard-gate      │  │ RLS via SET LOCAL ROLE│  │ knowledge-base (in-mem)│
   └─────────────────────┘  └───────────┬───────────┘  └────────────┬────────────┘
                                        │                           │
                            ┌───────────▼──────────┐     ┌──────────▼──────────┐
                            │ PostgreSQL (Supabase) │     │ Google Gemini API    │
                            │ RLS: legal_agent_app │     │ (no router, no log)  │
                            └──────────────────────┘     └──────────────────────┘

   Middleware (edge): next-intl + dashboard-gate (cookie check)
   next.config.js: CSP / HSTS / X-Frame / nosniff / Referrer / Permissions-Policy / COOP
   External services: MercadoPago (procesador) + Takenos (marca) · Resend (dep, no wired)
   CI: GitHub Actions (lint+typecheck+test+build, npm audit advisory)
```

### 1.2 Decisiones de arquitectura actuales (resumen, ver ADRs)

- **ADR-0001** Auth context con `firmId/role/isActive` propagados por JWT.
- **ADR-0002** Aislamiento por tenant con query scope + tests IDOR.
- **ADR-0003** Middleware central: auth gate + headers + CSRF + throttle *(declarado; CSRF/throttle NO cableados hoy).*
- **ADR-0004** Payment webhooks: firma + idempotencia + estado *(implementado en MP).*
- **ADR-0005** Migraciones reversibles + RLS + RPO/RTO.
- **ADR-0006** Health + build + CI gates + SAST/SCA/SBOM *(parcial: SAST/SBOM no gate).*
- **ADR-0007** IA safeguards: auth/RBAC/prompt-injection/RAG scoped *(parcial: RAG scoped existe en interfaz pero el store es in-memory).*
- **ADR-0008** Errores tipados + logging estructurado + audit logs *(no implementado: solo console.log/error).*

### 1.3 Bounded contexts reconocibles en el monolito

| Contexto | Archivo raíz hoy | Madurez |
|---|---|---|
| IAM (auth + tenant) | `lib/auth/*`, `lib/db/tenant-context.ts` | Alta |
| CRM / Leads | `app/api/leads`, `lib/leads/dashboard.ts` | Media |
| Matters / Cases | `app/api/cases`, `schema.ts` cases+tasks | Baja |
| Documents | `schema.ts documents`, `lib/ai/document-service.ts` | Stub |
| AI Assistant | `app/api/chatbot`, `app/api/ai/*`, `lib/ai/*` | Media (chatbot) / Stub (resto) |
| Billing / Subscriptions | `app/api/payments`, `lib/payments/*` | Alta |
| Marketing / Public | `app/[locale]/{page,pricing,sales,blog,tools}` | Baja-mediana |
| Platform / Operations | `middleware.ts`, `next.config.js`, `lib/security/*`, CI | Mixta |

> No existen aún: **Workflows, Agents, Knowledge/RAG real, Conflict Check, Intake, Client Portal, Profitability, Observability, Compliance.** Son NEW.

### 1.4 Limitaciones estructurales actuales

1. **Monolito tipo**: toda la lógica vive en `app/api` + `lib/`; no hay separación de *application services* / *domain* / *infrastructure*. Aceptable ahora; se segmentará por bounded capability.
2. **Knowledge store en memoria** (`lib/ai/knowledge-base.ts:14`) — se pierde al reiniciar y no aísla por tenant a nivel de persistencia (solo por `firmId` key del Map).
3. **Controles de seguridad duales**: headers viven en `next.config.js`; `lib/security/middleware.ts` redefine `addSecurityHeaders`/`validateCSRFToken` que **nunca se invocan** → deuda técnica y confusión.
4. **Sin capa de eventos/background jobs**: OCR, embeddings, document generation, transcription se ejecutarían dentro de la request HTTP (ver visión §76–§77) — no hay infraestructura de colas.
5. **Modelo de tenant único nivel**: `law_firms` es el tenant; no existe `organizations` supra-firm. Para multi-firma por organización se requerirá una capa arriba (decisión de diseño futura).
6. **RBAC de string**: `role` como `text`; no hay tabla `permissions` ni `role_permissions`. No cumple RBAC granular de visión §52.

---

## 2. Arquitectura objetivo (incremental, por bounded capabilities)

No se reescribe el monolito. Se **extiende por capacidades acotadas**, introduciendo progresivamente contratos (interfaces) y, cuando el volumen lo justifique, servicios separables. Cada capability se construye detrás de una **interface estable** para que la implementación pueda cambiarse sin romper consumidores.

### 2.1 Mapa objetivo

```
                         ┌────────────────────────────────────────┐
                         │            LEGAL OPERATING SYSTEM        │
                         └───────────────────┬────────────────────┘
                                             │
        ┌────────────────────┬───────────────┼───────────────┬────────────────────┐
        ▼                    ▼               ▼               ▼                    ▼
   ACQUISITION          PRACTICE          AI PLAT.       CLIENT/FINANCE      PLATFORM/SEC
   Website·SEO          CRM·Intake        Agents          Client Portal        IAM·RBAC
   SEM·WhatsApp         Conflicts         Workflows       Billing·Profit       Audit·Privacy
   Lead scoring         Matters           RAG·Citations   Time·Invoices        Observability
                        Documents          Research        Payments (MP/Takenos)
                        Tasks/Deadlines    Knowledge
                        Evidence           Model Router
                        Review Tables      AI Audit/Cost
                                             │
                                             ▼
                              ┌───────────────────────────────┐
                              │   INTEGRATION LAYER (MCP/API)   │
                              │ adapters: Google·MS365·Calendar │
                              │ ·Email·DMS·Legal sources        │
                              └───────────────────────────────┘
                                             │
                              ┌──────────────▼───────────────┐
                              │  DATA: Postgres + RLS · Object │
                              │  Storage · Vector (pgvector)    │
                              │  · Cache (Redis) · Search       │
                              └────────────────────────────────┘
```

### 2.2 Reglas de evolución (no rewrite)

1. **Reutilizar primero.** El código existente que funciona (auth, RLS, payment webhooks, leads) se **conserva**; solo se refactoriza si bloquea una capability.
2. **Una capability por PR.** Cada capability define: issue → acceptance criteria → implementación mínima → tests → docs → PR (visión §124).
3. **Interfaces estables.** Toda integración externa y todo agent tool se accede por interface (adapter/MCP), no por acoplamiento directo al dominio legal.
4. **Sin secretos en código/ci.** Solo `process.env` + placeholder en CI.
5. **DoD = code + tests + security + permissions + observability + docs + UX + error handling** (visión §104).
6. **Event-driven cuando hay latencia.** OCR, embeddings, indexing, transcription → background jobs (visión §76–§77). Hoy no hay cola; se introduce una primitiva mínima (Vercel cron + tabla `jobs` o queue service) en Phase 3/4.
7. **DB como source de truth de tenant.** `firmId` siempre del contexto autenticado (ya vigente). Cada nueva tabla lleva `firm_id` (+ `matter_id`/`client_id` cuando corresponda).
8. **No nuevos módulos legales acoplados al core.** Research, contract review, etc. son capabilities que consumen la capa de IA por interface.

### 2.3 Migración por capability (target por fase)

| Capability actual | Migración |
|---|---|
| `lib/auth/*` | Mantener; añadir refresh/revocation (ADR), email verification, MFA en P4. |
| `lib/db/tenant-context.ts` RLS | Mantener; extender a nuevas tablas con FK `firm_id`. |
| `lib/ai/knowledge-base.ts` (in-memory) | Reemplazar almacén por Postgres + pgvector; conservar la firma `queryWithContext(search, firmId, locale)` con permisos como gate (ADR-0007). |
| `lib/ai/document-service.ts` (text-only) | Añadir storage + OCR via background job; mantener `analyzeDocument(text)`. |
| `lib/security/middleware.ts` (stubs) | Cablear `validateCSRFToken` o eliminar y documentar que el doble submit no aplica (API JSON con SameSite). Persistir `logSecurityEvent` en `audit_logs`. |
| `app/api/payments/*` | Mantener; añadir Stripe como adapter opcional vía `PaymentAdapter`. |
| Facturación (schema-only) | Crear `app/api/billing/*` sobre tablas existentes `time_entries`/`invoices`. |

### 2.4 Decisiones de plataforma (alineadas con visión §109–§110)

- **Frontend:** Next.js 14 App Router (mantener). Client Portal como segmento de rutas `app/[locale]/portal/*` en una primera fase, separable más tarde.
- **API:** Route Handlers como API interna. API pública versionada `/api/v1/*` se introduce en P3/Enterprise con contract tests.
- **Workers:** introducir cola (cola gestionada otabla `jobs` + cron) cuando se necesite OCR/embeddings. No antes.
- **Storage:** object storage (Vercel Blob o S3-compatible) para documentos; **no** blobs en Postgres.
- **Vector:** pgvector en la misma Postgres/Supabase cuando RAG exista (P3).
- **Cache/Rate-limit distribuido:** Redis cuando se pase a multi-instancia (P1 stabilization → P4 enterprise).
- **Observability:** Sentry + structured logger (no `console.*`) — introduce en P1.

### 2.5 Riesgos arquitectónicos vigentes

- **Ausencia de tests de integración/E2E** sobre route handlers (solo helpers puros). Riesgo de regresión en cableado.
- **Build dinámico**: muchas rutas `λ` dependen de env/DB; en entornos sin DB el adapter se omite pero las rutas siguen necesitando runtime. Requiere documentar matrix de despliegue.
- **Knowledge in-memory** puede inducir falsa confianza de aislamiento por tenant.
- **Escalar horizontal sin Redis** rompería rate-limit in-memory.

---

## 3. Referencias

- Visión: `C:\Users\jairo\Downloads\Legal Agent SaaS.md` §5, §83, §109–§110, §127.
- ADRs: `docs/adr/0001..0008`.
- Estado detallado: `CURRENT_STATE.md`, `FEATURE_MATRIX.md`, `TECH_DEBT.md`.
- Plan de fases: `IMPLEMENTATION_PLAN.md`.