# CURRENT_STATE — Phase 0 Repository Capability Audit

- **Auditoría:** 2026-08-11
- **Repo:** `github.com/Jajojovp/legal-agent-saas` · commit `11bc4ca feat: Legal Agent SaaS Platform v2.0.0` · rama `main` (working tree con cambios sólo en `.md` de Phase 0; sin commit/push autorizado).
- **Source of truth:** código del checkout local. No se asume funcionalidad por nombre de archivo o UI.
- **Clasificación:** `EXISTE/FUNCIONAL` · `PARCIAL/STUB` · `NO EXISTE` · `DECLARADO NO CABLEADO`.
- **No production-ready.**

---

## 1. Resumen ejecutivo

El repositorio es un **monolito Next.js 14 (App Router) + Postgres/Drizzle** que ya pasó una ronda de hardening de auth y multi-tenancy (P0-001..P0-005, 2026-08-05). La plataforma se describe a sí misma como un SaaS legal (chatbot, CRM, casos, billing, analítica) pero, frente a la visión de *Legal Operating System* del documento de visión, cubre ~25% del producto objetivo: tiene fundaciones operables (auth, RLS, leads, KPIs, chatbot público/interno, suscripciones vía MercadoPago/Takenos) pero **no** tiene casos/tareas de escritura (solo GET de lectura), ni agentes, ni workflows, ni RAG/vector, ni research, ni contract review, ni document generation real, ni knowledge base persistente, ni conflict-check, ni intake, ni client portal, ni monetización avanzada.

La superficie existente está **razonablemente cableada al tenant** (`requireAuth` + `withTenantContext` + `resolveFirmId`) y respaldada por **tests unitarios de helpers puros** — pero **la suite es flaky**: en una corrida fresca se observaron **15 suites / 113 tests pasan / 0 unhandled errors**, y en otra corrida fresca (orquestador) **12 suites / 70 tests pasan / 3 unhandled timeout errors** (`fetch ["/@vite/env","ssr"]`). **La salida global no debe llamarse limpia.** El build **compila** (genera route table) pero **no se observó exit 0** en la corrida fresca del orquestador (excedió 300000 ms antes de cerrar); registra `DATABASE_URL not configured`, `Dynamic server usage` y errores `Get cases error`/`Get tasks error`/`Dashboard KPI error` durante la generación. Persisten controles de seguridad **declarados pero no cableados** (CSRF, audit log, file-upload real), deuda documental (el `SECURITY-AUDIT.md` raíz histórico contenía claims obsoletas, reconciliado en §6) y ausencia total de la capa de IA agéntica que define el producto final.

---

## 2. Verificación de calidad (ejecutada 2026-08-11, dos corridas frescas)

> **Honestidad metodológica (visión §56/§120):** se reportan **dos corridas frescas** en el mismo checkout — la del orquestador y la de cierre de Phase 0 — porque **divergen**, lo que prueba empiricamente que la suite es **flaky** y que la calidad no es reproducible. No se elige un sólo número para presentar como "verde".

| Comando | Resultado real observado (corrida A: orquestador) | Resultado real observado (corrida B: cierre Phase 0) | Notas / reconciliación |
|---|---|---|---|
| `npm test` (`vitest run`) | **12 suites / 70 tests pasan**; Vitest reporta **3 unhandled errors** por timeout `fetch ["/@vite/env","ssr"]`; salida global **no limpia**. | **15 suites / 113 tests pasan**, 0 fallos, 0 unhandled errors, duración *esta máquina* **42.84 s**; `auth-options.test.ts` ~7.89 s (7889 ms); ruido stderr Vite CJS deprecation. | **La divergencia es el hallazgo**: la suite es flaky (cold-start del adapter NextAuth + fetch de `vite/env` en SSR puede colgarse). No se afirma "tests estables". Ver `TECH_DEBT.md` TD-15/TD-19. **Cifra 113 sólo se cita porque se ejecutó y confirmó en este checkout**; la cifra 70 también se observó. La salida global **no debe llamarse limpia** mientras existan las dos observaciones. |
| `npm run lint` (`next lint`) | **Exit 0.** **~33 warnings** `no-console` en `app/api/**`, `lib/ai/**`, `lib/db/**`, `lib/email/**`, `lib/security/middleware.ts:295`. | Exit 0; mis warnings observados (`no-console`). TD-8 | Coincide entre ambas corridas. No bloquea merge pero es deuda (TD-8). |
| `npm run typecheck` (`tsc --noEmit`) | Limpio, sin output. | Limpio, sin output. | Coincide; pasamos. |
| `npm run build` (`next build`) | **Compila** (route table generado) pero **no se observó exit 0**: el comando **excedió 300000 ms** antes del cierre; registra `DATABASE_URL not configured`, `Dynamic server usage`, `Get cases error`, `Get tasks error`, `Dashboard KPI error` durante la generación. `λ (Dynamic)` server-rendered con Node; requieren `DATABASE_URL`/`POSTGRES_URL` + secretos en runtime. | No se re-ejecutó en Phase 0 cierre (la evidencia del orquestador prevalece; build >5min no es reproducible en esta sesión). | **No se afirma "exit 0 limpio".** Compila pero registra errores esperados por ausencia de `DATABASE_URL` en build-time. Rutas `λ` requieren runtime env + DB. Mitigación sugerida: `export const dynamic = 'force-dynamic'` en rutas afectadas o matriz de despliegue (TD-19 / `ARCHITECTURE.md` §2.5). |

> Nota de honestidad: el encargo pedía "no uses cifras antiguas de 113 tests salvo que ejecutes y confirmes exactamente esa cifra en el checkout actual". Se ejecutó `npm test -- --reporter=dot --testTimeout=30000` y se confirmó 15 suites / 113 tests pasan en la corrida B. **También se documenta la corrida A del orquestador (12 suites / 70 tests / 3 unhandled)** porque la divergencia es evidencia empírica de flakiness y presidente como P0/P1 de estabilización. Ninguna de las dos corridas se presenta como "limpia". El build no se declara "exit 0" porque esa salida no se observó en la corrida fresca del orquestador (timeout operacional >300 s). No se inventan fallos; tampoco se declara "build limpio" cuando la corrida documentada no lo confirma.

---

## 3. Inventario por área (EXISTE/FUNCIONAL · PARCIAL/STUB · NO EXISTE)

### 3.1 Framework, runtime, build

| Ítem | Estado | Evidencia |
|---|---|---|
| Framework | **EXISTE/FUNCIONAL** | `package.json:36` Next 14.1.4, React 18, TS 5, `next.config.js:9` `output: 'standalone'`. |
| Package manager | **EXISTE/FUNCIONAL** | npm + `package-lock.json`. CI usa `npm install --legacy-peer-deps` (`ci.yml:61`). |
| i18n | **EXISTE/FUNCIONAL** | `next-intl` 3.15, `app/[locale]`, `i18n/routing`, locales `en/es`. Build genera `/en` y `/es`. |
| Lint / typecheck / test | **EXISTE/FUNCIONAL** | scripts `lint`, `typecheck`, `test`, `test:watch` (`package.json:10-13`). |
| Docker | **EXISTE/FUNCIONAL** | `Dockerfile` + `output: standalone`. |
| CI/CD | **PARCIAL/STUB** | `.github/workflows/ci.yml` corre lint+typecheck+test+build y `npm audit` (`continue-on-error`). Sin SAST/SBOM gate, sin deploy, sin preview env. |

### 3.2 Backend / API

| Capability | Estado | Evidencia |
|---|---|---|
| Auth API | **EXISTE/FUNCIONAL** | `app/api/auth/[...nextauth]/auth-options.ts` (Credentials + Google opcional, JWT 30d), `app/api/auth/register/route.ts`. |
| Leads API (CRUD + qualify) | **EXISTE/FUNCIONAL** | `app/api/leads/route.ts` (GET/POST/PATCH), `app/api/leads/qualify/route.ts`. Tenant+ownership en PATCH vía `canModifyLead`. |
| Cases API | **PARCIAL/STUB** | `app/api/cases/route.ts` **GET solamente** (1 handler, línea 7). **No** tiene POST/PATCH/DELETE ni endpoint de detalle/timeline/parties/evidence. `schema.ts:210-229` define la tabla pero la API está limitada a lectura. |
| Tasks API | **PARCIAL/STUB** | `app/api/tasks/route.ts` **GET solamente** (1 handler, línea 7). **No** tiene POST/PATCH/DELETE. Schema existe (`schema.ts:232-248`) pero la API sólo lista tareas asignadas al usuario. |
| Dashboard KPI API | **EXISTE/FUNCIONAL** | `app/api/dashboard/kpi/route.ts`. |
| Chatbot API (public + internal) | **EXISTE/FUNCIONAL** | `app/api/chatbot/message/route.ts`; modo `internal` gated (`isInternalModeAllowed`), firmId derivado del contexto (`resolveChatFirmId`), cookie HttpOnly para sesión pública. |
| AI knowledge API | **PARCIAL/STUB** | `app/api/ai/knowledge/route.ts` auth + `resolveFirmId`, pero el store es **in-memory** (`lib/ai/knowledge-base.ts:14` `Map`), no persistido en DB, sin chunking/embeddings. |
| AI analyze-document API | **PARCIAL/STUB** | `app/api/ai/analyze-document/route.ts` auth ok, pero `extractTextFromFile` (`lib/ai/document-service.ts:79-84`) solo soporta `text/plain`; sin PDF/DOCX/OCR ni storage real. |
| Payments (MercadoPago/Takenos) | **EXISTE/FUNCIONAL** | `app/api/payments/mp/checkout`, `/mp/webhook` (verifica firma HMAC + idempotencia vía `payment_events`), `/takenos/info`. `lib/payments/{contracts,mercadopago,repository,subscription-state,webhook-service}`. |
| Health | **EXISTE/FUNCIONAL** | `/api/health/live`, `/api/health/ready`. |
| Webhooks externos (visión) | **NO EXISTE** | Solo webhook de MP. Sin `lead.created`, `document.uploaded`, etc. |
| API REST versionada pública (visión §74) | **NO EXISTE** | No hay `/api/v1/*`. |

### 3.3 Base de datos / multi-tenancy

| Capability | Estado | Evidencia |
|---|---|---|
| Drizzle schema + migrations | **EXISTE/FUNCIONAL** | `lib/db/schema.ts` (345 líneas, **17 tablas** = 4 auth/users + 13 de negocio): `users, accounts, sessions, verificationTokens, lawFirms, subscriptions, subscriptionCheckoutAttempts, paymentEvents, leads, cases, tasks, documents, timeEntries, invoices, chatConversations, kpiMetrics, emailCampaigns`. `lib/db/migrations/` (RLS up/down + `payments_001_subscriptions.sql`), `drizzle.config.ts`, `lib/db/migrate.ts` (stub: 12 líneas, sólo `console.log`), `seed.ts`. |
| Multi-tenancy por `firmId` | **EXISTE/FUNCIONAL** | Cada tabla de negocio lleva `firm_id` FK a `law_firms` (`schema.ts:48,124,190,213,234,253,267,282,299,315,333`). |
| RLS fail-closed + contexto por transacción | **EXISTE/FUNCIONAL** | `lib/db/tenant-context.ts:20-26` `SET LOCAL ROLE legal_agent_app` + `private.set_tenant_context(firmId)`. Migraciones `rls_multitenant_up.sql` / `_down.sql`. |
| firmId derivado del contexto (no body) | **EXISTE/FUNCIONAL** | `resolveFirmId` (`lib/auth/authorization.ts:51`) ignora body; confirmado por `tests/auth/authorization.test.ts`. |
| Entidades de visión ausentes | **NO EXISTE** | Sin tablas: `organizations` (solo `law_firms`), `permissions`, `documents.document_versions/_chunks`, `deadlines`, `events`, `messages/emails`, `agents/agent_runs`, `workflows/workflow_runs`, `knowledge_bases/_items`, `templates/clauses/playbooks`, `research/sources/citations`, `audit_logs`, `ai_usage`. |

### 3.4 Auth / RBAC / session

| Capability | Estado | Evidencia |
|---|---|---|
| Credentials + bcrypt + JWT | **EXISTE/FUNCIONAL** | `auth-options.ts:41-85`, bcrypt rounds 12 (`register/route.ts:21`). |
| Google OAuth | **PARCIAL/STUB** | Registrado solo si DB + env presentes (`auth-options.ts:88-97`); sin onboarding de perfil post-OAuth (F-note en P0 doc). |
| Auth context (firmId/role/isActive) | **EXISTE/FUNCIONAL** | `lib/auth/context.ts`, `lib/auth/session.ts:requireAuth`. |
| Edge gate `/dashboard` | **EXISTE/FUNCIONAL** | `middleware.ts` + `lib/auth/dashboard-gate.ts` (check de cookie). |
| RBAC granular por permiso | **PARCIAL/STUB** | Solo `role` string (`owner/admin/attorney/...`); `ELEVATED_ROLES = owner|admin` (`authorization.ts:13`). Sin tabla `permissions` ni checks `matter.read` etc. |
| MFA / SSO / SCIM / IP allow-list | **NO EXISTE** | — |
| Refresh / revocación en caliente | **NO EXISTE** | JWT `maxAge: 30d` sin refresh (`auth-options.ts:100-102`). |
| Email verification / password policy en API | **PARCIAL/STUB** | `registerSchema` existe, pero la ruta no aplica rate-limit ni verificación de email; `role: 'owner'` auto-asignado (`register/route.ts:44`). |

### 3.5 Frontend / UI

| Capability | Estado | Evidencia |
|---|---|---|
| Landing / pricing / sales / blog / tools | **EXISTE/FUNCIONAL** | `app/[locale]/{page,pricing,sales,blog,tools}`. Blog con `[slug]` dinámico. |
| Dashboard module páginas | **EXISTE/FUNCIONAL** | `app/[locale]/(dashboard)/dashboard/{analytics,billing,cases,leads,messages,settings,tasks}` + `page.tsx`. |
| Component library | **PARCIAL/STUB** | `components/ui` (Radix slot/label solo), `components/{ads,chatbot,payment,providers,tools}`. No es un design system formal; CSS Tailwind. |
| Client Portal | **NO EXISTE** | Sin `/portal` ni rutas de cliente; `/messages` es interna. |
| Mobile (iOS/Android) | **NO EXISTE** | Solo responsive web. |
| Accessibility / a11y auditada | **NO VERIFICADO** | Sin tests de a11y. |

### 3.6 IA / Agentes / RAG

| Capability | Estado | Evidencia |
|---|---|---|
| Chatbot Gemini (public + internal) | **EXISTE/FUNCIONAL** | `lib/ai/legal-ai-service.ts:36-127` con fallback de modelos y prompts bilingües. |
| Calificación de leads con IA | **EXISTE/FUNCIONAL** | `qualifyLead` (`legal-ai-service.ts:132-207`), `POST /api/leads/qualify`. |
| Análisis de documentos (contrato/compliance/riesgo) | **PARCIAL/STUB** | `analyzeDocument`/`document-service.analyzeDocument` generan JSON desde texto; sin parsing real de archivos, sin citations, sin review table. |
| Generación de email marketing / estrategia de caso | **EXISTE/FUNCIONAL (simple)** | `generateMarketingEmail`, `generateCaseStrategy`. |
| Knowledge Base | **PARCIAL/STUB** | `lib/ai/knowledge-base.ts` in-memory `Map`, substring filter, no persistencia, no embeddings, no reranking. |
| Agentes / Orchestrator / Tool Registry | **NO EXISTE** | Sin directorio `agents/`, sin runtime, sin tool registry. |
| RAG / Vector / Embeddings | **NO EXISTE** | No hay pgvector, no embeddings, no hybrid search. |
| Citations / Hallucination guard | **NO EXISTE** | Las respuestas del LLM no se validan contra fuentes; el prompt pide “cita” pero sin checker. |
| Model Router / AI cost tracking / AI audit trail | **NO EXISTE** | Modelo hardcoded con fallback; sin `ai_usage`/`agent_runs` persistentes. |

### 3.7 Workflows / Orquestación

| Capability | Estado | Evidencia |
|---|---|---|
| Workflow engine / builder / human approval | **NO EXISTE** | Sin tablas ni código. |
| Playbooks | **NO EXISTE** | Sin entidades. |

### 3.8 CRM / Adquisición / Portal

| Capability | Estado | Evidencia |
|---|---|---|
| CRM (leads) + estados | **PARCIAL/STUB** | `leadStatusEnum` 6 estados (`schema.ts:23-30`); sin pipeline visual, sin conflict-check, sin intake dinámico, sin lead intelligence dedicada (la IA qualify es lo más cercano). |
| Conflict Check | **NO EXISTE** | — |
| Intake jurídico dinámico | **NO EXISTE** | — |
| Website / SEO programático / SEM tracking | **NO EXISTE** | Landing simple + blog. Sin página por `práctica+jurisdicción+problema`. |
| WhatsApp / Voice | **NO EXISTE** | — |
| Email automation | **PARCIAL/STUB** | `lib/email/automation.ts` existe (logs de error `no-console`); sin scheduler, sin templates reales, sin Resend wired en producción. |
| Client Portal / Client Communication Agent | **NO EXISTE** | — |

### 3.9 Finance / Billing

| Capability | Estado | Evidencia |
|---|---|---|
| Suscripciones (MP/Takenos) + webhooks idempotentes | **EXISTE/FUNCIONAL** | `schema.ts:122-180` (subscriptions, payment_events, attempts), `webhook-service.ts` + `repository.claimPaymentEvent` (idempotencia). |
| Invoices / time entries schema | **EXISTE/FUNCIONAL (schema only)** | `time_entries`, `invoices` (`schema.ts:265-294`); **sin API routes** de facturación; solo página dashboard. |
| Profitability / AI cost / Collections | **NO EXISTE** | — |
| Stripe | **NO EXISTE** | A pesar de `README.md` y `ROADMAP.md`, no hay código de Stripe. Proveedor activo: MercadoPago (procesador) + Takenos (marca). |

### 3.10 Observabilidad / Seguridad / Compliance

> Clasificación de controles (visión §56/§120): **Declarado** (definido en código/doc pero no invocado) · **Cableado** (invocado en runtime) · **Verificado** (cableado + test automatizado o evidencia operacional).

| Capability | Declarado | Cableado | Verificado | Evidencia |
|---|---|---|---|---|
| Health endpoints | — | ✅ | parcial (sin test e2e) | `/api/health/{live,ready}` |
| Security headers (CSP/HSTS/X-Frame/nosniff/Referrer/Permissions/COOP) | — | ✅ (`next.config.js:22-55`) | ❌ sin header test | `next.config.js:22-55` |
| Rate limiting | ✅ (`lib/security/middleware.ts:4`) | ✅ parcial (chatbot + register) | ❌ sin test de contador | in-memory `Map`, no distribuido (S-8) |
| CSRF (`validateCSRFToken`) | ✅ (`lib/security/middleware.ts:61`) | ❌ nunca invocado | ❌ | grep sin callers (S-1) |
| `addSecurityHeaders` | ✅ (`:161`) | ❌ duplicado muerto (headers viven en `next.config`) | ❌ | S-2 |
| Audit log (`logSecurityEvent`) | ✅ (`:293`) | ⚠️ solo `console.log`, no persistente | ❌ | sin tabla `audit_logs` (S-3) |
| `validateFileUpload` | ✅ (`:240`) | ❌ no usado en analyze-document | ❌ | S-4 |
| `sanitizeInput`/`sanitizeHTML` | ✅ (`:73/91`) | uso parcial no verificado | ❌ | — |
| `validateAPIKey` | ✅ (`:203`) | ❌ sin API pública todavía | ❌ | — |
| Webhook MP HMAC + idempotencia | ✅ | ✅ | ✅ unit (contracts/service) | `lib/payments/mercadopago.ts:122-151`, tests `tests/payments/*` |
| Auth Credentials + bcrypt + JWT context | ✅ | ✅ | ✅ unit | `auth-options.ts`, `tests/auth/*` |
| Tenant RLS por transacción (fail-closed) | ✅ | ✅ | ✅ unit (helper) | `lib/db/tenant-context.ts`, `tests/db/*` |
| Dashboard cookie gate (edge) | ✅ | ✅ | ✅ unit | `middleware.ts`, `tests/auth/dashboard-gate.test.ts` |
| Observability (logs estructurados, metrics, traces, alertas) | ❌ | ❌ | ❌ | solo `console.log/error` |
| Privacy (RoPA, DPIA, consent, retención, ARCO-PM, TIA) | ❌ | ❌ | ❌ | ver `docs/audit/findings-tracker.csv` (matriz privacidad, S-13) |

> **Advertencia (no production-ready):** la presencia de controles **Declarados no Cableados** (CSRF, audit log, file-upload, headers en `lib/security/middleware.ts`) y la ausencia total de **Verificación operacional** (no integration/E2E, no SAST/DAST, no pentest, no observabilidad) implican que **la plataforma NO está production-ready**. Cualquier claim de “Production Ready” heredado de `SECURITY-AUDIT.md` v3.0 (2024-04-22) está marcado SUPERSEDED en §6 del nuevo audit y en `TECH_DEBT.md` TD-1.

---

## 4. Documentación y trazabilidad

- **Vigente:** `docs/adr/0001..0008` (8 ADRs), `docs/audit/P0-AUTH-FIXES.md`, `docs/audit/findings-tracker.csv`, `DEPLOYMENT.md`, `QUICKSTART.md`, `STRIPE-SETUP.md` (obsoleto: no hay Stripe), `MARKET-RESEARCH.md`, `CRM-COMPLETO.md`, `LANDING-PAGE.md`, `EMAIL-AUTOMATION-GUIDE.md`, `GOOGLE-GEMINI-SETUP.md`, `CHANGELOG-GEMINI.md`.
- **Obsoleto / contradictorio:** `SECURITY-AUDIT.md` raíz (v3.0, 2024-04-22) afirma “Production Ready 92/100”, “Auth 0/100 NOT IMPLEMENTED”, “CSRF 100%” — **refutado por código**: auth sí está implementada (`auth-options.ts`), CSRF no está cableado. `README.md` afirma RBAC, audit logs, HIPAA-ready — **no verificado**. `ROADMAP.md` enumera Stripe, Calendly, Clio, etc. como planificados (no presentes).
- **Supersede:** la auditoría estática del 2026-08-05 (`findings-tracker.csv`) sigue siendo la referencia de seguridad; este `CURRENT_STATE.md` la reconcilia con el estado del código al 2026-08-11.

---

## 5. Dependencias y supply chain

- Rangos sueltos (`^`) en la mayoría de dependencias (`package.json:21-45`). `@next/swc-win32-x64-msvc@^14.1.4` está como dependencia directa (binario de plataforma) — smell de build específico de Windows.
- CI ejecuta `npm audit` con `continue-on-error: true` (`ci.yml:80-83`) — **no es un gate**. Sin SBOM, sin SAST/DAST, sin Dependabot verificado.
- No se introducen dependencias nuevas en este trabajo.

---

## 6. Tabla A del documento de visión (§84)

| Área | Existente | Calidad | Reutilizar | Modificar | Reemplazar |
|---|---|---|---|---|---|
| Auth | Sí | Buena (JWT+ctx) | ✅ | Añadir refresh/MFA/email-verify | — |
| Database | Sí | Buena (Drizzle+RLS) | ✅ | Extender schema (insurance entidades) | — |
| Multi-tenancy | Sí | Buena (RLS x txn) | ✅ | — | — |
| RBAC | Parcial | Role-string | ✅ | Añadir permisos granulares | — |
| AI | Parcial | Gemini single-model | ✅ chatbot/qualify | Añadir citations, audit, model router | — |
| Agents | No | — | — | — | NEW |
| Documents | Stub | text-only | ✅ schema | Añadir storage/OCR/versions | — |
| Knowledge/RAG | Stub | in-memory | ✅ interfaz | Reemplazar store por DB+vector | — |
| Workflows | No | — | — | — | NEW |
| Client Portal | No | — | — | — | NEW |
| Billing | Parcial | MP/Takenos OK; invoices schema-only | ✅ | Añadir API de invoices/time | — |
| SEO/SEM/CRM/Intake | No (CRM mínimo) | — | ✅ leads | — | NEW (resto) |
| Tests | Sí | 113 unit (corrida B; corrida A: 70 pasan/3 unhandled — flaky) | ✅ | Añadir integration/E2E/IA eval; estabilizar suite | — |
| Security | Mixta | Headers+RLS OK; CSRF/audit stub | ✅ | Cablear controles declarados | — |
| Observability | No | — | — | — | NEW |

---

## 7. Respuestas A–J del documento de visión (§120)

- **A. ¿Qué existe?** Next.js monolito con auth, RLS multi-tenant, leads, KPIs, chatbot Gemini, suscripciones MP/Takenos, blog/tools/landing; **cases/tasks sólo GET (no escritura)**; suite unit de helpers puros (flaky: 113 o 70 tests según corrida).
- **B. ¿Qué funciona?** Auth (Credentials, JWT con firmId/role/isActive), gate de dashboard, leads CRUD tenant-scoped (GET/POST/PATCH), chatbot publico/interno, webhook MP con firma+idempotencia, lint/typecheck; **tests unit pasan pero suite flaky**; build compila pero registra errores de DB esperados y no se observó exit 0 en corrida del orquestador.
- **C. ¿Qué está incompleto?** Knowledge base (in-memory), analyze-document (text-only), invoices (solo schema), Google OAuth onboarding, RBAC granular, observability, RAG sin permisos reales (no hay permisos por doc).
- **D. ¿Qué debe refactorizarse?** `lib/security/middleware.ts` (controles muertos), knowledge-base store, document-service parsing, role-string→permisos, rate-limit in-memory→Redis.
- **E. ¿Qué debe eliminarse?** `SECURITY-AUDIT.md` raíz debe **rescribirse** (claims falsos); `STRIPE-SETUP.md` obsoleto; `@next/swc-win32-x64-msvc` como runtime dep.
- **F. ¿Qué puede reutilisarse?** Esquema Drizzle+RLS, helpers auth puros, estructura `[locale]`, payment service layer, Vitest config, ADRs.
- **G. ¿Qué debe añadirse?** Agents, workflows, RAG/vector, citations, document vault, contract review, conflict-check, intake, client portal, profitability, AI cost/audit, observability, MFA/SSO.
- **H. ¿Dependencias obsoletas?** Rangos `^` sueltos; `@next/swc-win32...` como dep directa; `next-auth` v4 (v5 disponible pero fuera de scope auditar migración).
- **I. ¿Vulnerabilidades?** Ver `SECURITY-AUDIT.md` (nueva) y `docs/audit/findings-tracker.csv` F1–F22.
- **J. ¿Arquitectura a evolucionar?** A un *Legal OS* por bounded capabilities (ver `ARCHITECTURE.md` e `IMPLEMENTATION_PLAN.md`). No reescritura total.