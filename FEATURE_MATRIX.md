# FEATURE_MATRIX — Capabilities declaradas vs implementadas (vista 1:1 de la matriz canónica)

- **Auditoría:** 2026-08-11 (corrección documental final, sin cambios de código/tests/config).
- **Clasificación:** `EXISTE/FUNCIONAL` ✓ · `PARCIAL/STUB` ◐ · `NO EXISTE` ✗ (unificado con `docs/CAPABILITY_MATRIX.md`).
- **Acción:** `KEEP` · `EXTEND` · `REFACTOR` · `NEW` · `REPLACE` (definida; `REPLACE` no aplicada en Phase 0).
- **Prioridad:** P0 crítico → P5 backlog (visión §118 reordenada al flujo de fases §86–§96).
- **Dependencias:** referencian IDs de capability (`cap-*`) de la canónica.
- **Matriz canónica:** `docs/CAPABILITY_MATRIX.md` es la **matriz única**. Esta `FEATURE_MATRIX.md` es una **vista 1:1** con los mismos IDs, estados y acciones, en el **mismo orden A–J**; añade evidencia `path:line` y prioridad P0–P5. **No contradice** la canónica. Cualquier divergencia futura debe corregirse aquí primero y reflejarse en la canónica (TD-12 cleanup task).
- **Trazabilidad 1:1:** 77 filas en cada matriz; 0 alias ambiguos; 0 filas presentes solo en una matriz; 0 divergencias en estado o acción. Ver `docs/CAPABILITY_MATRIX.md §Cross-check`.

Leyenda evidencia: `path:line`. “—” indica ausencia.

---

## A. Foundaciones / Plataforma

| ID | Capability | Estado | Acción | Prio | Dep | Evidencia |
|---|---|---|---|---|---|---|
| cap-auth | Authentication (Credentials + Google + JWT) | EXISTE/FUNCIONAL | KEEP | P1 | — | `app/api/auth/[...nextauth]/auth-options.ts`, `lib/auth/session.ts` |
| cap-auth-context | Auth context (firmId/role/isActive) | EXISTE/FUNCIONAL | KEEP | P0 | cap-auth | `lib/auth/context.ts:39-95`, `auth-options.ts:108-119` |
| cap-tenant | Multi-tenancy por `firmId` con RLS por transacción | EXISTE/FUNCIONAL | KEEP | P0 | cap-auth-context | `lib/db/tenant-context.ts:20-26`, `migrations/rls_multitenant_up.sql` |
| cap-rbac | RBAC granular (tabla `permissions`) | PARCIAL/STUB (role-string) | EXTEND | P0 | cap-auth-context | `lib/auth/authorization.ts:13` ELEVATED_ROLES; sin `permissions` table |
| cap-rbac-admin | Roles admin/partner/lawyer/associate/paralegal/client | PARCIAL/STUB | EXTEND | P2 | cap-rbac | `users.role text`, sin enum ni tabla `role_permissions` |
| cap-register | Registro de firm + owner (frágil) | PARCIAL/STUB | REFACTOR | P1 | cap-auth | `app/api/auth/register/route.ts:32-46` auto-eleva `owner`, sin rate-limit/email-verify |
| cap-mfa-sso | MFA / SSO / SCIM | NO EXISTE | NEW | P4 | cap-rbac | — |
| cap-audit-log | Audit log persistente | PARCIAL/STUB | REFACTOR | P1 | cap-tenant | `lib/security/middleware.ts:293` solo console.log; sin `audit_logs` |
| cap-observ | Observability (logs estructurados, metrics, traces) | NO EXISTE | NEW | P1 | — | solo `console.log/error` |
| cap-headers | Security headers (CSP/HSTS/nosniff/Referrer/Permissions/COOP) | EXISTE/FUNCIONAL | KEEP | P1 | — | `next.config.js:22-55` |
| cap-ratelimit | Rate limiting | PARCIAL/STUB | REFACTOR | P1 | cap-redis | in-memory `Map` (`lib/security/middleware.ts:4`), no distribuido |
| cap-csrf | CSRF protection | PARCIAL/STUB (no cableado) | REFACTOR | P2 | — | `validateCSRFToken` definido, nunca invocado (grep) |
| cap-redis | Cache/queue distribuido | NO EXISTE | NEW | P1 | — | — |
| cap-build-ci | CI/CD (lint+typecheck+test+build+audit; sin SAST/SBOM gate) | EXISTE/FUNCIONAL | EXTEND | P1 | — | `.github/workflows/ci.yml` |
| cap-health | Health endpoints | EXISTE/FUNCIONAL | KEEP | P1 | — | `/api/health/{live,ready}` |
| cap-storage | Object Storage (Vercel Blob / S3-compatible) | NO EXISTE | NEW | P2 | — | `documents.fileUrl` es texto (sin storage real) |
| cap-vector | Vector Store (pgvector) | NO EXISTE | NEW | P3 | cap-rag | — |

## B. CRM / Adquisición

| ID | Capability | Estado | Acción | Prio | Dep | Evidencia |
|---|---|---|---|---|---|---|
| cap-crm-leads | Lead CRUD + estados + assign | EXISTE/FUNCIONAL | EXTEND | P0 | cap-tenant | `app/api/leads/route.ts`, `schema.ts:188-207` |
| cap-lead-qualify | AI lead qualification | EXISTE/FUNCIONAL | EXTEND | P1 | cap-ai-llm | `app/api/leads/qualify/route.ts`, `legal-ai-service.ts:132` |
| cap-lead-intel | Lead intelligence (urgencia/valor/riesgo) | PARCIAL/STUB | EXTEND | P2 | cap-lead-qualify | `qualifyLead` solo score/area/urgency/contact |
| cap-conflict-check | Conflict Check | NO EXISTE | NEW | P2 | cap-crm-leads, cap-matters | — |
| cap-intake | Intake jurídico dinámico | NO EXISTE | NEW | P2 | cap-crm-leads | — |
| cap-website | Landing + blog + tools | EXISTE/FUNCIONAL | KEEP | P2 | — | `app/[locale]/{page,blog,tools}` |
| cap-seo | SEO programático (`práctica+jurisdicción+problema`) | NO EXISTE | NEW | P3 | cap-website | solo landing+blog; sin pages `practice+jurisdiction` |
| cap-sem | SEM tracking / Attribution | NO EXISTE | NEW | P3 | cap-crm-leads | — |
| cap-whatsapp | WhatsApp intake/recordatorios | NO EXISTE | NEW | P3 | cap-ai-assistant | — |
| cap-email-auto | Email automation | PARCIAL/STUB | EXTEND | P2 | cap-crm-leads | `lib/email/automation.ts` (log only); Resend dep, no wired |
| cap-voice | Voice / transcription pipeline | NO EXISTE | NEW | P5 | cap-ai-llm | — |

## C. Matters / Casos / Operación

| ID | Capability | Estado | Acción | Prio | Dep | Evidencia |
|---|---|---|---|---|---|---|
| cap-matters | Matters CRUD + status + assigned attorney | PARCIAL/STUB (GET only) | EXTEND | P0 | cap-tenant | `app/api/cases/route.ts:7` GET only; sin POST/PATCH/DELETE/detail; `schema.ts:210-229` |
| cap-matter-parties | Parties / opposing counsel / lawyers model | PARCIAL/STUB | EXTEND | P2 | cap-matters | solo `courtInfo jsonb`; sin tabla parties |
| cap-tasks | Tasks / deadlines | PARCIAL/STUB (GET only) | EXTEND | P0 | cap-matters | `app/api/tasks/route.ts:7` GET only; sin POST/PATCH/DELETE; `schema.ts:232-248` |
| cap-deadlines | Deadline engine (reglas+jurisdicción) | NO EXISTE | NEW | P2 | cap-tasks | `tasks.dueDate` solo |
| cap-doc-vault | Document vault (carpetas/versions/OCR) | PARCIAL/STUB | EXTEND | P1 | cap-storage | `schema.ts:251-262` (`file_url` + `ai_analysis jsonb`); sin storage real |
| cap-doc-intel | Document Intelligence (parsing/OCR/extraction) | PARCIAL/STUB (text-only) | REFACTOR | P2 | cap-doc-vault, cap-ai-llm | `lib/ai/document-service.ts:79-84` solo `text/plain` |
| cap-evidence | Evidence management + chronology | NO EXISTE | NEW | P2 | cap-matters, cap-doc-vault | — |
| cap-timeline | Case timeline auditable | NO EXISTE | NEW | P2 | cap-matters | — |
| cap-review-table | Review Tables (extract/classify/compare/score) | NO EXISTE | NEW | P1 | cap-doc-intel | — |
| cap-search-global | Global search (Cmd+K) | NO EXISTE | NEW | P3 | cap-tenant | — |

## D. AI Platform

| ID | Capability | Estado | Acción | Prio | Dep | Evidencia |
|---|---|---|---|---|---|---|
| cap-ai-assistant | Legal AI Assistant (chat public + internal) | EXISTE/FUNCIONAL | EXTEND | P0 | cap-ai-llm | `app/api/chatbot/message/route.ts`, `lib/ai/legal-ai-service.ts:36` |
| cap-ai-llm | LLM providers (Gemini) | EXISTE/FUNCIONAL | EXTEND | P0 | — | `lib/ai/legal-ai-service.ts:1`, fallback models `:110` |
| cap-model-router | Model Router (por tarea/coste) | NO EXISTE | NEW | P3 | cap-ai-llm | hardcoded fallback list |
| cap-rag | RAG (hybrid search + reranking + permissions) | NO EXISTE | NEW | P3 | cap-kb, cap-ai-llm | — (knowledge-base in-memory) |
| cap-citations | Citation engine + hallucination guard | NO EXISTE | NEW | P3 | cap-rag | prompt pide cite, sin checker |
| cap-kb | Knowledge Base persistente | PARCIAL/STUB | REFACTOR | P2 | cap-tenant, cap-rag | `lib/ai/knowledge-base.ts:14` Map in-memory |
| cap-doc-gen | Document Generator (templates + precedent) | NO EXISTE | NEW | P2 | cap-kb, cap-matters | — (sólo `generateMarketingEmail`, `generateCaseStrategy`) |
| cap-contract-review | Contract Intelligence (review/compare/redlining) | NO EXISTE | NEW | P2 | cap-doc-intel, cap-rag | — |
| cap-research | Legal Research Engine | NO EXISTE | NEW | P2 | cap-rag, cap-citations | — |
| cap-strategy | Case Strategy Engine | PARCIAL/STUB | EXTEND | P2 | cap-ai-llm | `generateCaseStrategy` simple, sin evidence-law integration |
| cap-agents | Agentes (orchestrator + especializados) | NO EXISTE | NEW | P3 | cap-ai-llm, cap-tool-registry | — |
| cap-tool-registry | Tool Registry con permisos/riesgo | NO EXISTE | NEW | P3 | cap-agents | — |
| cap-ai-audit | AI audit trail persistente | NO EXISTE | NEW | P3 | cap-audit-log | sin `ai_usage`/`agent_runs` |
| cap-ai-eval | AI evaluation / golden dataset | NO EXISTE | NEW | P3 | cap-agents | — |

## E. Workflows / Orquestación

| ID | Capability | Estado | Acción | Prio | Dep | Evidencia |
|---|---|---|---|---|---|---|
| cap-wf-engine | Workflow Engine | NO EXISTE | NEW | P3 | cap-agents | — |
| cap-wf-builder | Workflow Builder visual | NO EXISTE | NEW | P3 | cap-wf-engine | — |
| cap-wf-approval | Human Approval nodes | NO EXISTE | NEW | P3 | cap-wf-engine | — |
| cap-playbooks | Playbooks por práctica | NO EXISTE | NEW | P3 | cap-wf-engine, cap-kb | — |

## F. Client Portal

| ID | Capability | Estado | Acción | Prio | Dep | Evidencia |
|---|---|---|---|---|---|---|
| cap-portal | Client Portal (dashboard/docs/tasks/messages) | NO EXISTE | NEW | P3 | cap-matters | — |
| cap-portal-invoices | Invoices + payments vista cliente | NO EXISTE | NEW | P3 | cap-billing-api | — |
| cap-portal-sign | E-signature | NO EXISTE | NEW | P4 | cap-portal | — |
| cap-client-comm-agent | Client Communication Agent (admin only) | NO EXISTE | NEW | P3 | cap-agents, cap-portal | — |

## G. Finance / Billing

| ID | Capability | Estado | Acción | Prio | Dep | Evidencia |
|---|---|---|---|---|---|---|
| cap-subscriptions | Subscriptions (MP/Takenos) | EXISTE/FUNCIONAL | KEEP | P3 | cap-tenant | `app/api/payments/mp/*`, `schema.ts:122-180` |
| cap-webhooks-mp | MP webhook firma + idempotencia + estado | EXISTE/FUNCIONAL | KEEP | P3 | cap-subscriptions | `webhook-service.ts`, `repository.claimPaymentEvent`, `mercadopago.verifyMPWebhook:122-151` |
| cap-billing-api | Invoice / time-entry API | NO EXISTE (schema only) | NEW | P3 | cap-matters | `schema.ts:265-294` `time_entries`/`invoices`; sin routes |
| cap-time-tracking | Time tracking UI + captura | NO EXISTE | NEW | P3 | cap-billing-api | — |
| cap-payments-extra | Stripe / Payment Adapter | NO EXISTE | NEW | P4 | cap-subscriptions | README menciona Stripe; no existe |
| cap-profitability | Profitability Engine | NO EXISTE | NEW | P3 | cap-billing-api, cap-ai-cost | — |
| cap-ai-cost | AI cost tracking / management | NO EXISTE | NEW | P3 | cap-ai-audit | sin `ai_usage`/`agent_runs` persistentes (alias histórico `cap-ai-cost-mgmt` eliminado) |

## H. Integrations / Mobile

| ID | Capability | Estado | Acción | Prio | Dep | Evidencia |
|---|---|---|---|---|---|---|
| cap-integrations | Calendar/Email/DMS/Google/MS365 adapters | NO EXISTE | NEW | P4 | cap-mcp | — |
| cap-mcp | MCP integration layer | NO EXISTE | NEW | P4 | cap-tool-registry | — |
| cap-mobile | iOS/Android | NO EXISTE | NEW | P5 | cap-matters, cap-ai-assistant | solo responsive web |
| cap-notifications | Notifications (in-app/email/push/SMS) | NO EXISTE | NEW | P2 | cap-tenant | — |
| cap-i18n | i18n en/es | EXISTE/FUNCIONAL | KEEP | P2 | — | next-intl, `app/[locale]` |

## I. Knowledge / Templates

| ID | Capability | Estado | Acción | Prio | Dep | Evidencia |
|---|---|---|---|---|---|---|
| cap-template-engine | Template Engine (variables/cláusulas) | NO EXISTE | NEW | P3 | — | — |
| cap-clause-library | Clause Library (version/jurisdiction/risk/approved_by) | NO EXISTE | NEW | P3 | — | — |
| cap-precedent-store | Precedent Store | NO EXISTE | NEW | P3 | cap-kb | — |
| cap-institutional-memory | Institutional Memory + Governance | NO EXISTE | NEW | P4 | cap-kb | — |

## J. Tools legales (existentes)

| ID | Capability | Estado | Acción | Prio | Dep | Evidencia |
|---|---|---|---|---|---|---|
| cap-tools | Calculadoras legales (8) + generador contratos + documentos | EXISTE/FUNCIONAL | KEEP | P2 | — | `lib/tools/{8 archivos}`, `app/[locale]/tools/[tool]` |

---

## Resumen cuantitativo (vista 1:1 con canónica)

| Clasificación | Count |
|---|---:|
| EXISTE/FUNCIONAL (✓) · KEEP o EXTEND | 15 |
| PARCIAL/STUB (◐) · EXTEND o REFACTOR | 15 |
| NO EXISTE (✗) · NEW | 47 |
| **Total capabilities** | **77** |

> Los recuentos se alinean 1:1 con `docs/CAPABILITY_MATRIX.md` (matriz canónica). Cambio vs versión previa: `cap-matters` y `cap-tasks` bajan de ✓ a ◐ porque el código actual sólo implementa **GET** (sin POST/PATCH/DELETE en `app/api/cases/route.ts` ni `app/api/tasks/route.ts`); verificado por `grep 'export async function (GET|POST|PATCH|PUT|DELETE)' app/api/**`. Acción `REPLACE` definida en leyenda pero no aplicada en Phase 0.

> Frente a la visión §117 (Legal Agent OS), la cobertura actual es de anchura limitada: el *PRACTICE* básico y *AI* mínima existen; *GROWTH* (CRM/SEO/WhatsApp), *WORKFLOWS*, *KNOWLEDGE/Templates real*, *RAG real*, *CLIENT PORTAL*, *FINANCE avanzada*, *ENTERPRISE* y *MOBILE* son **NEW**.

## Cross-check FEATURE_MATRIX ↔ canónica

| Verificación | Resultado |
|---|---|
| Filas en `FEATURE_MATRIX.md` | 77 |
| Filas en `docs/CAPABILITY_MATRIX.md` | 77 (mismos IDs, mismo orden) |
| IDs con prefijo `cap-` en ambas | 77/77 |
| Orden de filas `cap-*` en §A–§J | **idéntico** al de `docs/CAPABILITY_MATRIX.md` (verificado por `grep '^\| cap-'` en ambos; 0 divergencias posicional) |
| Alias ambiguos residuales | 0 — `cap-register`, `cap-ai-cost`, `cap-kb` consolidados |
| Filas presentes solo en una matriz | 0 |
| Estados divergentes entre matrices en el mismo ID | 0 |
| Acciones divergentes entre matrices en el mismo ID | 0 |
| Recuento ✓/◐/✗ en ambas matrices | **15 / 15 / 47** (igual en ambas; docs/CAPABILITY_MATRIX.md §Recuento y FEATURE_MATRIX.md §Resumen coinciden) |

### Verificación de consistencia final (post-reconciliación 2026-08-11)

| # | Afirmación | Verificación ejecutada | Resultado |
|---|---|---|---|
| V1 | `cap-matters` y `cap-tasks` ya no son ✓; son ◐ porque la API es GET-only | `grep 'export async function (GET|POST|PATCH|PUT|DELETE)' app/api/**` | **cases: GET 只有** (1 match en `app/api/cases/route.ts:7`); **tasks: GET 只有** (1 match en `app/api/tasks/route.ts:7`); 0 POST/PATCH/PUT/DELETE en ambos. ✓ Alineado con matrices. |
| V2 | El recuento 15/15/47 = 77 en ambas matrices | Suma manual de estados en `docs/CAPABILITY_MATRIX.md` y `FEATURE_MATRIX.md` | 15 ✓ + 15 ◐ + 47 ✗ = 77 en ambas. ✓ |
| V3 | Ningún doc afirma "Cases API GET/POST" | `grep -i 'cases.*GET/POST\|cases.*GET / POST\|cases.*POST' CURRENT_STATE.md FEATURE_MATRIX.md docs/CAPABILITY_MATRIX.md` | 0 hits pendientes de revisión; el único remanente es histórico en `TECH_DEBT.md` TD-15b marcado como **afirmación falsa previa, reconciliada**. ✓ |
| V4 | Schema tiene 17 tablas (no 14) | Cuenta de `pgTable(` en `lib/db/schema.ts` | 17 ocurrencias. ✓ |
| V5 | Tests flaky documentado (no "113 estable") | `grep 'flaky\|70 tests\|unhandled' TECH_DEBT.md CURRENT_STATE.md SECURITY-AUDIT.md` | hits en TD-15/TD-19, §2 CURRENT_STATE, header SECURITY-AUDIT. ✓ |
| V6 | Build no declarado "exit 0 limpio" | `grep 'exit 0' CURRENT_STATE.md` | HITS restantes referencian lint/typecheck, no build. Build descrito como "compila pero no se observó exit 0 / errores esperados". ✓ |
| V7 | No se declara production-ready | `grep -i 'production.ready\|production-ready' CURRENT_STATE.md analysis-intake.md` | Menciones sólo con `no`/`no se declara`. ✓ |

> Si futuras ediciones rompen la consistencia V1–V7, abrir tarea TD-12 cleanup y reconducir aquí primero, reflejando el cambio en `docs/CAPABILITY_MATRIX.md`.

### Notas de estructura matrix vs canónica (histórico resuelto)
- ~~`cap-storage`, `cap-vector`, `cap-i18n`, `cap-mcp`, `cap-integrations`, `cap-mobile`, `cap-notifications` vivían en §8 aquí y repartidos entre A y H en la canónica~~ — **resuelto**: ambos archivos usan secciones A–J idénticas; `cap-storage`/`cap-vector` viven en §A en ambas.
- ~~`cap-rbac-admin` sub-item de `cap-rbac` aquí vs fold en canónica~~ — **resuelto**: `cap-rbac-admin` es fila propia en §A de ambas matrices.
- ~~`cap-ai-cost`/`cap-ai-cost-mgmt` alias entre §3 y §6~~ — **resuelto**: una sola capability `cap-ai-cost` en §G (Finance) de ambas matrices, con `Dep: cap-ai-audit`.
- ~~`cap-kb` duplicado en §D y §I canónica~~ — **resuelto**: una sola capability `cap-kb` en §D (AI Platform) de ambas matrices; §I contiene solo templates/clauses/precedent/memory (todos NEW).
- **v2.1 (2026-08-11):** `cap-matters` y `cap-tasks` reclasificados ✓→◐ por evidencia fresca (GET-only). Recuento pasa de 17/13/47 → 15/15/47.

### Notas de estructura matrix vs canónica (histórico resuelto)
- ~~`cap-storage`, `cap-vector`, `cap-i18n`, `cap-mcp`, `cap-integrations`, `cap-mobile`, `cap-notifications` vivían en §8 aquí y repartidos entre A y H en la canónica~~ — **resuelto**: ambos archivos usan secciones A–J idénticas; `cap-storage`/`cap-vector` viven en §A en ambas.
- ~~`cap-rbac-admin` sub-item de `cap-rbac` aquí vs fold en canónica~~ — **resuelto**: `cap-rbac-admin` es fila propia en §A de ambas matrices.
- ~~`cap-ai-cost`/`cap-ai-cost-mgmt` alias entre §3 y §6~~ — **resuelto**: una sola capability `cap-ai-cost` en §G (Finance) de ambas matrices, con `Dep: cap-ai-audit`.
- ~~`cap-kb` duplicado en §D y §I canónica~~ — **resuelto**: una sola capability `cap-kb` en §D (AI Platform) de ambas matrices; §I contiene solo templates/clauses/precedent/memory (todos NEW).