# docs/CAPABILITY_MATRIX — Matriz canónica única de capacidades (Phase 0)

- **Auditoría:** 2026-08-11 (corrección documental final, sin cambios de código/tests/config).
- **Fuente:** reconciliación de código real (no README/ROADMAP). Ver `CURRENT_STATE.md` y `FEATURE_MATRIX.md`.
- **Leyenda Current:** `EXISTE/FUNCIONAL` ✓ · `PARCIAL/STUB` ◐ · `NO EXISTE` ✗ (unificado con `FEATURE_MATRIX.md`).
- **Leyenda Action:** `KEEP` · `EXTEND` · `REFACTOR` · `NEW` · `REPLACE`.
- **Target** = nivel objetivo en el Legal Operating System (visión §117–§127).
- **IDs:** todos los IDs usan el prefijo `cap-` en ambas matrices (canónica y view). Un ID = una fila = una capability; **sin alias ambiguos** (p.ej. `register` y `cap-register` no coexisten: aquí se usa `cap-register`; `ai-cost-mgmt` y `ai-cost` no coexisten: aquí se usa `cap-ai-cost`).
- **Matriz canónica:** este archivo es la **matriz única** de capabilities. `FEATURE_MATRIX.md` replica **exactamente** los mismos IDs, estados y acciones, en el **mismo orden**, añadiendo evidencia `path:line` y prioridad P0–P5. No contradice a esta matriz. Si se detecta divergencia histórica futura, abrir tarea de cleanup (TD-12) y reconducir aquí primero.
- **Trazabilidad 1:1:** ambos archivos comparten el mismo set de 77 filas y el mismo orden A–J. No existe fila presente en solo una matriz. Verificación al final del archivo (§Cross-check).

---

## A. Foundaciones / Plataforma

| ID (cap-) | Capability | Current | Target | Action | Owner | Tests hoy | Spec ref |
|---|---|---|---|---|---|---|---|
| cap-auth | Authentication (Credentials + Google + JWT) | ✓ | Enterprise | KEEP | platform | auth-options, flow | §51 |
| cap-auth-context | Auth context (firmId/role/isActive) | ✓ | Enterprise | KEEP | platform | context, authorization | §52 |
| cap-tenant | Multi-tenancy por `firmId` con RLS por transacción | ✓ | Required | KEEP | platform | tenant-context, rls-migration | §6, §51 |
| cap-rbac | RBAC granular (tabla `permissions`) | ◐ | Enterprise RBAC | EXTEND | platform | — | §52 |
| cap-rbac-admin | Roles admin/partner/lawyer/associate/paralegal/client | ◐ | Enterprise RBAC | EXTEND | platform | — | §52 |
| cap-register | Registro de firm + owner (frágil: auto-eleva owner) | ◐ | Hardened | REFACTOR | platform | register (2) | §52 |
| cap-mfa-sso | MFA / SSO / SCIM | ✗ | Enterprise | NEW | platform | — | §51, §95 |
| cap-audit-log | Audit log persistente | ◐ | Required | REFACTOR | platform | — | §53, §54 |
| cap-observ | Observability (logs estructurados, metrics, traces) | ✗ | Required | NEW | platform | — | §101 |
| cap-headers | Security headers (CSP/HSTS/X-Frame/nosniff/Referrer/Permissions/COOP) | ✓ | Required | KEEP | platform | — | §51 |
| cap-ratelimit | Rate limiting (in-memory, no distribuido) | ◐ | Distributed | REFACTOR | platform | — | §51 |
| cap-csrf | CSRF protection (definido, no cableado) | ◐ | Required | REFACTOR | platform | — | §51 |
| cap-redis | Cache/queue distribuido | ✗ | Required | NEW | platform | — | §77, §110 |
| cap-build-ci | CI/CD (lint+typecheck+test+build+audit; sin SAST/SBOM gate) | ✓ | SBOM/SAST-gate | EXTEND | platform | — | §88 |
| cap-health | Health endpoints (`/api/health/{live,ready}`) | ✓ | Required | KEEP | platform | — | §101 |
| cap-storage | Object Storage (Vercel Blob / S3-compatible) | ✗ | Required | NEW | platform | — | §78, §79 |
| cap-vector | Vector Store (pgvector) | ✗ | Required | NEW | platform | — | §78, §79 |

## B. CRM / Adquisición

| ID (cap-) | Capability | Current | Target | Action | Dep |
|---|---|---|---|---|---|
| cap-crm-leads | Lead CRUD + estados + assign | ✓ | Required | EXTEND | cap-tenant |
| cap-lead-qualify | AI lead qualification | ✓ | Differentiator | EXTEND | cap-ai-llm |
| cap-lead-intel | Lead intelligence (urgencia/valor/riesgo) | ◐ | Required | EXTEND | cap-lead-qualify |
| cap-conflict-check | Conflict Check | ✗ | Required | NEW | cap-crm-leads, cap-matters |
| cap-intake | Intake jurídico dinámico | ✗ | Required | NEW | cap-crm-leads |
| cap-website | Landing + blog + tools | ✓ | Keep | KEEP | — |
| cap-seo | SEO programático (`práctica+jurisdicción+problema`) | ✗ | Required | NEW | cap-website |
| cap-sem | SEM tracking / Attribution | ✗ | Required | NEW | cap-crm-leads |
| cap-whatsapp | WhatsApp intake/recordatorios | ✗ | Required | NEW | cap-ai-assistant |
| cap-email-auto | Email automation (Resend dep, no wired) | ◐ | Required | EXTEND | cap-crm-leads |
| cap-voice | Voice / transcription pipeline | ✗ | Later | NEW | cap-ai-llm |

## C. Matters / Casos / Operación

| ID (cap-) | Capability | Current | Target | Action | Dep |
|---|---|---|---|---|---|
| cap-matters | Matters CRUD + status + assigned attorney | ◐ | Required | EXTEND | cap-tenant |
| cap-matter-parties | Parties / opposing counsel / lawyers model | ◐ | Required | EXTEND | cap-matters |
| cap-tasks | Tasks / deadlines (mínimo) | ◐ | Required | EXTEND | cap-matters |
| cap-deadlines | Deadline engine (reglas + jurisdicción) | ✗ | Required | NEW | cap-tasks |
| cap-doc-vault | Document vault (carpetas/versions/OCR) | ◐ | Required | EXTEND | cap-storage |
| cap-doc-intel | Document Intelligence (parsing/OCR/extraction; text-only) | ◐ | Required | REFACTOR | cap-doc-vault, cap-ai-llm |
| cap-evidence | Evidence management + chronology | ✗ | Required | NEW | cap-matters, cap-doc-vault |
| cap-timeline | Case timeline auditable | ✗ | Required | NEW | cap-matters |
| cap-review-table | Review Tables (extract/classify/compare/score) | ✗ | Differentiator | NEW | cap-doc-intel |
| cap-search-global | Global search (Cmd+K) | ✗ | Required | NEW | cap-tenant |

## D. AI Platform

| ID (cap-) | Capability | Current | Target | Action | Dep |
|---|---|---|---|---|---|
| cap-ai-assistant | Legal AI Assistant (chat public + internal) | ✓ | Differentiator | EXTEND | cap-ai-llm |
| cap-ai-llm | LLM providers (Gemini + fallback models) | ✓ | Multi-provider | EXTEND | — |
| cap-model-router | Model Router (por tarea/coste) | ✗ | Required | NEW | cap-ai-llm |
| cap-rag | RAG (hybrid search + reranking + permissions) | ✗ | Required | NEW | cap-kb, cap-ai-llm |
| cap-citations | Citation engine + hallucination guard | ✗ | Required | NEW | cap-rag |
| cap-kb | Knowledge Base persistente (in-memory Map hoy) | ◐ | Required | REFACTOR | cap-tenant, cap-rag |
| cap-doc-gen | Document Generator (templates + precedent) | ✗ | Required | NEW | cap-kb, cap-matters |
| cap-contract-review | Contract Intelligence (review/compare/redlining) | ✗ | Required | NEW | cap-doc-intel, cap-rag |
| cap-research | Legal Research Engine | ✗ | Required | NEW | cap-rag, cap-citations |
| cap-strategy | Case Strategy Engine | ◐ | Required | EXTEND | cap-ai-llm |
| cap-agents | Agentes (orchestrator + especializados) | ✗ | Differentiator | NEW | cap-ai-llm, cap-tool-registry |
| cap-tool-registry | Tool Registry con permisos/riesgo | ✗ | Required | NEW | cap-agents |
| cap-ai-audit | AI audit trail persistente | ✗ | Required | NEW | cap-audit-log |
| cap-ai-eval | AI evaluation / golden dataset | ✗ | Required | NEW | cap-agents |

## E. Workflows / Orquestación

| ID (cap-) | Capability | Current | Target | Action | Dep |
|---|---|---|---|---|---|
| cap-wf-engine | Workflow Engine | ✗ | Differentiator | NEW | cap-agents |
| cap-wf-builder | Workflow Builder visual | ✗ | Required | NEW | cap-wf-engine |
| cap-wf-approval | Human Approval nodes | ✗ | Required | NEW | cap-wf-engine |
| cap-playbooks | Playbooks por práctica | ✗ | Required | NEW | cap-wf-engine, cap-kb |

## F. Client Portal

| ID (cap-) | Capability | Current | Target | Action | Dep |
|---|---|---|---|---|---|
| cap-portal | Client Portal (dashboard/docs/tasks/messages) | ✗ | Required | NEW | cap-matters |
| cap-portal-invoices | Invoices + payments vista cliente | ✗ | Required | NEW | cap-billing-api |
| cap-portal-sign | E-signature | ✗ | Required | NEW | cap-portal |
| cap-client-comm-agent | Client Communication Agent (admin only) | ✗ | Required | NEW | cap-agents, cap-portal |

## G. Finance / Billing

| ID (cap-) | Capability | Current | Target | Action | Dep |
|---|---|---|---|---|---|
| cap-subscriptions | Subscriptions (MP/Takenos) | ✓ | Keep | KEEP | cap-tenant |
| cap-webhooks-mp | MP webhook firma + idempotencia + estado | ✓ | Keep | KEEP | cap-subscriptions |
| cap-billing-api | Invoice / time-entry API (solo schema) | ✗ | Required | NEW | cap-matters |
| cap-time-tracking | Time tracking UI + captura | ✗ | Required | NEW | cap-billing-api |
| cap-payments-extra | Stripe / Payment Adapter | ✗ | Optional | NEW | cap-subscriptions |
| cap-profitability | Profitability Engine | ✗ | Differentiator | NEW | cap-billing-api, cap-ai-cost |
| cap-ai-cost | AI cost tracking / management | ✗ | Required | NEW | cap-ai-audit |

## H. Integrations / Mobile

| ID (cap-) | Capability | Current | Target | Action | Dep |
|---|---|---|---|---|---|
| cap-integrations | Calendar/Email/DMS/Google/MS365 adapters | ✗ | Required | NEW | cap-mcp |
| cap-mcp | MCP integration layer | ✗ | Required | NEW | cap-tool-registry |
| cap-mobile | iOS/Android | ✗ | Later | NEW | cap-matters, cap-ai-assistant |
| cap-notifications | Notifications (in-app/email/push/SMS) | ✗ | Required | NEW | cap-tenant |
| cap-i18n | i18n en/es | ✓ | Keep + grow | KEEP | — |

## I. Knowledge / Templates

| ID (cap-) | Capability | Current | Target | Action | Dep |
|---|---|---|---|---|---|
| cap-template-engine | Template Engine (variables/cláusulas) | ✗ | Required | NEW | — |
| cap-clause-library | Clause Library (version/jurisdiction/risk/approved_by) | ✗ | Required | NEW | — |
| cap-precedent-store | Precedent Store | ✗ | Required | NEW | cap-kb |
| cap-institutional-memory | Institutional Memory + Governance | ✗ | Required | NEW | cap-kb |

## J. Tools legales (existentes)

| ID (cap-) | Capability | Current | Target | Action | Dep |
|---|---|---|---|---|---|
| cap-tools | Calculadoras legales (8) + generador contratos + docs | ✓ | Keep + grow | KEEP | — |

---

## Recuento cuantitativo (canónico)

| Clasificación | Count |
|---|---:|
| EXISTE/FUNCIONAL (✓) · KEEP o EXTEND | 15 |
| PARCIAL/STUB (◐) · EXTEND o REFACTOR | 15 |
| NO EXISTE (✗) · NEW | 47 |
| **Total capabilities** | **77** |

> Action `REPLACE` está definida en la leyenda pero no se aplica en Phase 0. Cambio vs versión previa: `cap-matters` y `cap-tasks` bajan ✓→◐ (sólo **GET** en `app/api/cases/route.ts` y `app/api/tasks/route.ts`; sin POST/PATCH/DELETE). Verificado por `grep 'export async function (GET|POST|PATCH|PUT|DELETE)' app/api/**`.

## Score de cobertura por bloque (visión §117, estimado)

| Bloque | % EXISTE/FUNCIONAL |
|---|---:|
| A. Fundaciones / Plataforma | ~55% (auth+RLS+headers+payments+health; faltan redis/audit/observ/SBOM/storage/vector) |
| B. CRM / Adquisición | ~27% (leads+qualify+website; faltan conflict/intake/SEO/SEM/WhatsApp/voice) |
| C. Matters / Operación | ~15% (matters+tasks **GET-read only**; schema existe; sin POST/PATCH/DELETE/detail; faltan deadlines/vault real/evidence/timeline/search) |
| D. AI Platform | ~20% (chatbot+qualify+LLM; faltan agents/rag/citations/kb-real/gen/contract/research/audit/eval) |
| E. Workflows | 0% |
| F. Client Portal | 0% |
| G. Finance | ~30% (subscriptions+webhooks+ai-cost nuclear NO EXISTE aún; faltan billing-api/time/profitability) |
| H. Integraciones/Mobile | ~20% (i18n; faltan integrations/mcp/mobile/notifications) |
| I. Knowledge/Templates | 0% (sólo cap-kb en §D que es ◐; templates/clauses/precedent/memory son NEW) |
| J. Tools legales | 100% del scope actual |

## Cross-check canónica ↔ FEATURE_MATRIX

| Verificación | Resultado |
|---|---|
| Filas en `docs/CAPABILITY_MATRIX.md` | 77 |
| Filas en `FEATURE_MATRIX.md` | 77 (mismos IDs, mismo orden) |
| IDs con prefijo `cap-` en ambas | 77/77 |
| Orden de filas `cap-*` en §A–§J | **idéntico byte-a-byte** entre este archivo y `FEATURE_MATRIX.md` (verificación 2026-08-11 por extracción secuencial de IDs; 0 divergencias posicional) |
| Alias ambiguos residuales (`register`/`cap-register`; `ai-cost`/`ai-cost-mgmt`; `knowledge-base` duplicada en §D y §I) | **0** — resueltos |
| Filas presentes solo en una matriz | **0** |
| Estados divergentes entre matrices en el mismo ID | **0** |
| Acciones divergentes entre matrices en el mismo ID | **0** |
| Sección canónica donde vive `cap-storage`/`cap-vector` | A (Foundaciones/Plataforma) — replicado en FEATURE_MATRIX §A |
| Sección canónica donde vive `cap-rbac-admin` | A (fila propia) — replicado en FEATURE_MATRIX §A |
| Sección canónica donde vive `cap-ai-cost` | G (Finance) — replicado en FEATURE_MATRIX §G; el antiguo alias `cap-ai-cost-mgmt` se elimina |
| Sección canónica donde vive `cap-kb` | D (AI Platform) — única entrada; el antiguo duplicado en §I se elimina |

> Esta matriz es la fuente **única** para la planificación de `IMPLEMENTATION_PLAN.md`; cualquier documento que contradiga `EXISTE/FUNCIONAL` en esta matriz debe corregirse (TD-12).