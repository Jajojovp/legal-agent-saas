# IMPLEMENTATION_PLAN — Plan de implementación por bounded capabilities

- **Auditoría base:** 2026-08-11 (`CURRENT_STATE.md`, `FEATURE_MATRIX.md`, `TECH_DEBT.md`, `SECURITY-AUDIT.md`, `ARCHITECTURE.md`, `docs/CAPABILITY_MATRIX.md` — matriz canónica única de 77 capabilities `cap-*`; `FEATURE_MATRIX.md` es vista 1:1 con los mismos IDs/estados/acciones, en el mismo orden A–J).
- **Orden obligatorio (visión §86–§96, §118):** `audit → stabilization → core legal OS → AI foundation → legal intelligence → workflows → CRM/acquisition → portal → finance → enterprise → mobile`.
- **Reglas:** una capability por PR; DISCOVER → VERIFY → REUSE → EXTEND → TEST → VALIDATE (visión §85). DoD = code + tests + security + permissions + observability + docs + UX + error handling (visión §104). **No se reescribe código funcional.**
- **Notación:** cada item referencia `cap-*` (de `docs/CAPABILITY_MATRIX.md`) y `S-*`/`TD-*`/`F-*`. Owner inicial = rol responsable (asignación de persona humana queda `EXTERNAL_SIGN-OFF_REQUIRED` antes de cada release). Prioridad P0–P5.

---

## Phase 0 — Audit (COMPLETADO en este trabajo; revisión conditional approval — ver `docs/release/2026-08-11-phase0-final-review.md`)

Entregables: `CURRENT_STATE.md`, `ARCHITECTURE.md`, `FEATURE_MATRIX.md`, `SECURITY-AUDIT.md` (re-escrito), `TECH_DEBT.md`, `docs/CAPABILITY_MATRIX.md`, `analysis-intake.md`, `docs/release/2026-08-11-phase0-final-review.md`.
- **Cierre (no approval):** árbol de docs **reconciliado** (no “coherente” en sentido estricto — ver contradicciones conocidas abajo). Claims refutados marcados SUPERSEDED; matriz única de capabilities (`docs/CAPABILITY_MATRIX.md` canónica). **No es aprobación de producción**; es conditional approval a Phase 1.

### Contradicciones conocidas y tareas de cleanup (no bloquean entrada a Phase 1)

| ID | Contradicción residual | Origen | Tarea de cleanup |
|---|---|---|---|
| CL-1 | `SECURITY-AUDIT.md` v3.0 (2024-04-22) con claims “Production Ready 92/100”, “Auth 0/100”, “CSRF 100%”, “File Upload 100%”. | Histórico `git history` + `TECH_DEBT.md` TD-1.| Phase 1.10: archivar v3.0 a `docs/audit/SECURITY-AUDIT-v3.0-archived.md` con cabecera SUPERSEDED. La reconciliación ya vive en `SECURITY-AUDIT.md` §6.1; el contenido íntegro del v3.0 no está archivado todavía. |
| CL-2 | `README.md` (`:307-336` histórico, no re-verificado), `ROADMAP.md`, `STRIPE-SETUP.md` mencionan Stripe, Clio, Calendly, HIPAA-ready, RBAC granular, audit logs, como **presentes** cuando **no lo están** (capability `cap-payments-extra` = `NEW Stripe`; `cap-rbac` = `EXTEND`; `cap-audit-log` = `REFACTOR` — ver `docs/CAPABILITY_MATRIX.md §A/§G`). | `TECH_DEBT.md` TD-12; `CURRENT_STATE.md` §4. | Phase 1.10: marcar claims como “Planned/not implemented”; mover `STRIPE-SETUP.md` a `docs/archive/`; reconciliar README línea-a-línea. |
| CL-3 | `supabase-init.sql` placeholder induce a creer que RLS falta — la RLS real está en `migrations/rls_multitenant_up.sql`. | `TECH_DEBT.md` TD-17. | Phase 1.1/1.2: aclarar el flujo de init.sql o eliminar comentario ambiguos. |
| CL-4 | `docs/audit/findings-tracker.csv:62` reclama F1 como **blocker** del chatbot POST — **refutado por código** (`app/api/chatbot/message/route.ts:78-118` ya scopea por `sessionId AND firmId`). | `SECURITY-AUDIT.md` §1.1 S-14. | Phase 1.10: mover F1 a **Confirmed Fixed** en el tracker. |

> Reglas: cada contradicción se **declara explícitamente** y se le asigna una tarea de cleanup en Phase 1. **No se afirma “documentación coherente”** mientras existan claims históricos no archivados.

---

## Phase 1 — Stabilization (DoD: `npm test && npm run lint && npm run build` verdes y reproducibles en CI)

**Objetivo:** corregir deuda crítica antes de añadir features. Nada de funcionalidades nuevas salvo las necesarias para estabilizar.

| # | cap/issue | Acción | Dep | Criterio de cierre |
|---|---|---|---|---|
| 1.1 | S-2/TD-2 | Eliminar `lib/security/middleware.ts` muerto (`addSecurityHeaders`, `validateCSRFToken`) o cablear con tests. Documentar que headers viven en `next.config.js` y CSRF se cubre con SameSite + API JSON. | — | grep sin callers huérfanos; test de cabeceras via next.config. |
| 1.2 | S-1 | Decidir política CSRF: si API JSON + SameSite cookies es suficiente → documentar y **borrar** el stub; si no → cablear con tests en rutas mutativas. | 1.1 | decision registrada en ADR-0003 (update). |
| 1.3 | TD-15/TD-19 | **Estabilizar la suite flaky.** Evidencia fresca: corrida A = 12 suites/70 tests/3 unhandled timeout `fetch ["/@vite/env","ssr"]`; corrida B = 15 suites/113 tests/0 unhandled. Resolver `vitest.config.ts` (sin SSR/Vite env alias, refetch cold-start del adapter NextAuth), reducir ruido stderr de Vite CJS, fijar `auth-options.test.ts` (<1s estable). | — | `npm test` produce 15/113/0 unhandled en 5 corridas consecutivas + CI; salida global **limpia** sin stderr relevante; ya no se observan caídas a 70 tests. |
| 1.4 | TD-14, TD-15b | Añadir **integration tests** de route handlers con Postgres local (supabase contenedor) para: leads GET/POST/PATCH, chatbot message, payments webhook, ai/knowledge. **Y construir las rutas de escritura de cases/tasks** (POST/PATCH + rutas de detalle) que hoy **no existen** (`app/api/cases/route.ts` y `app/api/tasks/route.ts` son GET-only). | — | cobertura de integration > rutas críticas; pipeline corre integration; cases/tasks tienen POST/PATCH/test. |
| 1.5 | cap-build-ci | Activar `npm audit` high/critical como **gate**; emitir SBOM; añadir header test + typecheck en CI (ya). | — | merge bloqueado si high+ advisory; SBOM artefacto. |
| 1.6 | TD-13 | Mover `@next/swc-win32-x64-msvc` a `optionalDependencies` o eliminar. | — | `npm ci` en ubuntu/Mac OK. |
| 1.7 | S-8/TD-7 | Introducir Redis/Upstash para rate-limit distribuido (mantener in-memory fallback en dev). | cap-redis | test de dos instancias compartiendo contador. |
| 1.8 | TD-8 | Introducir logger estructurado + Sentry; reducir `console.*`. | cap-observ | 0 console en prod runtime; alerta de error rate. |
| 1.9 | S-13 (privacy) | Crear RoPA draft + DPIA checklist; mapeo de PII por tabla; captura de consentimiento en leads/chat (mínimo: columna `consent_at`/`consent_ip`). | — | RoPA en `docs/seguridad/`; DPIA draft entregado. |
| 1.10 | archivar histórico | Mover `SECURITY-AUDIT.md` v3.0 a `docs/audit/SECURITY-AUDIT-v3.0-archived.md` con cabecera SUPERSEDED; corregir `README.md`/`ROADMAP.md` claims (TD-12). | — | docs no afirman lo inexistente. |

**Salida Phase 1:** DoD de visión §87 alcanzado de forma reproducible; lista para construcción sin reescritura.

---

## Phase 2 — Core Legal OS (visión §88)

Construir/extendre el mínimo viable para un abogado: organizations→users→roles→clients→matters→documents→tasks→deadlines→audit.

| # | cap | Acción | Dep | Criterio de cierre |
|---|---|---|---|---|
| 2.1 | cap-rbac | Añadir tabla `permissions` + `role_permissions`; checks centralizados (`requirePermission(ctx, 'matter.write')`). | cap-tenant | test por endpoint con lista de permisos. |
| 2.2 | cap-matters | Extender cases: endpoints `GET/PATCH /api/cases/:id`; tabla `matter_parties` (client + opposing + lawyers); estados expandidos (visión §12). | 2.1 | flujo create matter + parties. |
| 2.3 | cap-matter-clients | Separar entidad `clients` de leads/cases (hoy clientName es string). | cap-crm | test de client 360 mínimo. |
| 2.4 | cap-doc-vault | Introducir object storage; upload real de archivos; tabla `document_versions`. Validar con `validateFileUpload` cableado + magic-byte. | cap-storage (Phase 4?) — pero storage es prerrequisito aquí: adelantar `cap-storage` | upload + list + version; test de MIME + magic. |
| 2.5 | cap-doc-intel | Pipeline upload → scan → text-extract para text/plain + PDF/DOCX vía background job (introducir cola mínima `jobs` table + cron). | 2.4 | doc indexado con texto extraído. |
| 2.6 | cap-deadlines | Tabla `deadlines` + reglas por jurisdicción + notificaciones básicas. | cap-tasks | deadline dispara notificación. |
| 2.7 | cap-audit-log | Tabla `audit_logs` + writer; invocar en mutaciones de leads/matters/docs/payments/auth. | cap-tenant | evento registrado por acción; test. |
| 2.8 | cap-notifications | Canal in-app + email (Resend wired) para deadlines y approval requests. | 2.6 | notificación llega; test. |

**Salida Phase 2:** un abogado crea cliente + matter + sube docs + gestiona deadlines y audit, dentro de una sola firma.

---

## Phase 3 — AI Foundation (visión §89)

Construir la capa agéntica mínima y reusable sobre la que todo Legal Intelligence descansará.

| # | cap | Acción | Dep | Criterio de cierre |
|---|---|---|---|---|
| 3.1 | cap-kb | Reemplazar knowledge store in-memory por Postgres (`knowledge_bases`/`knowledge_items`) + `firm_id` RLS. Mantener `queryWithContext`. | cap-tenant | docs persisten y aíslan por tenant. |
| 3.2 | cap-rag | pgvector; chunking + embeddings versionados; hybrid search (keyword+vector+metadata) + reranking; **permission filter** antes de recuperar (visión §26). | 3.1 | respuesta con fuentes filtradas por tenant+perm. |
| 3.3 | cap-citations | Citation checker: cada claim debe mapear a fuente/doco/página; `NOT FOUND IN SOURCES` cuando no haya (visión §55–§56). | 3.2 | tasa de citas verificable. |
| 3.4 | cap-ai-llm / cap-model-router | Model Router: clasificación → barato; razonamiento → reasoning; context largo → long-context; embeddings; OCR; speech. | — | routing por tipo de tarea. |
| 3.5 | cap-tool-registry | Registry con `input_schema/output_schema/permissions/risk_level/allowed_agents/requires_confirmation`. | 2.1 | tool listada con metadata. |
| 3.6 | cap-agents | Orchestrator + Research + Document + Review (los 4 primeros del visión §28); cumple Agent Contract (visión §29). | 3.4, 3.5, cap-kb | run de agent+tool registrado en audit. |
| 3.7 | cap-ai-audit | Persistir `ai_usage`/`agent_runs`: prompt/context/sources/agent/tools/model/version/output/validation/reviewer/approval (visión §54). | cap-audit-log | reconstrucción de una respuesta. |
| 3.8 | cap-ai-cost | Contabilizar input/output tokens + cost por agent/workflow/matter. | 3.7 | reporte cost por matter. |
| 3.9 | cap-ai-assistant | Migrar el chatbot actual a consumir orchestrator + RAG + citations; mantener modo public/internal. | 3.6, 3.2, 3.3 | respuesta con citations; test de prompt-injection básico. |

**Salida Phase 3:** AI Foundationusable por las capabilities de Legal Intelligence.

---

## Phase 4 — Legal Intelligence (visión §90)

| # | cap | Acción | Dep | Criterio de cierre |
|---|---|---|---|---|
| 4.1 | cap-research | Legal Research Engine: sources jurisdicción-mapeadas (visión §15–§16); results con source/jurisdiction/date/authority/url/citation. | 3.2, 3.3 | research con citations verificables. |
| 4.2 | cap-doc-intel (full) | OCR de imágenes/audio/transcripciones; entity extraction; legal classification (visión §17). | 2.5 | dataset documental procesado. |
| 4.3 | cap-contract-review | Contract Intelligence: review (riesgos/cláusulasfaltantes) + comparison (added/removed/modified/risk) + redlining + issue list (visión §20–§21). | 3.6, 4.1 | issue list generado con citations. |
| 4.4 | cap-doc-gen | Document Generator con templates + firm precedent + matter context + jurisdiction + approved clauses (visión §22–§24). | cap-kb, template-engine | doc generado con variables + cláusulas aprobadas. |
| 4.5 | cap-template-engine / clause-library | Template + clauses con version/jurisdiction/risk/approved_by. | 2.1 | biblioteca consultable y versionada. |
| 4.6 | cap-review-table | Review Tables: extract/classify/compare/score/flag masivo (visión §19). | 4.3 | tabla generada por dataset. |
| 4.7 | cap-evidence + cap-timeline | Evidence management + chronology auditable. | 2.2, 2.4 | timeline regenerable. |
| 4.8 | cap-strategy | Case Strategy Engine: facts+law+evidence+opposition+risks → strengths/weaknesses/next actions (como recomendación). | 4.1, 4.7 | estrategia con `Requires Review`. |
| 4.9 | cap-ai-eval | Golden dataset `tests/ai/golden/` + métricas (citation accuracy, hallucination rate, latency, cost, acceptance) (visión §57–§58). | 3.6 | benchmark corre en CI; thresholds definidos. |

**Salida Phase 4:** capacidades legales inteligentes funcionamiento encima de la AI Foundation.

---

## Phase 5 — Workflow Automation (visión §91)

| # | cap | Acción | Dep | Criterio de cierre |
|---|---|---|---|---|
| 5.1 | cap-wf-engine | Workflow Engine con triggers/conditions/agent calls/outputs; persistencia `workflow_runs`. | 3.6 | workflow ejecuta end-to-end. |
| 5.2 | cap-wf-builder | Workflow Builder visual (low-code) con nodos. | 5.1 | workflow guardado y ejecutado desde UI. |
| 5.3 | cap-wf-approval | Human Approval nodes: AI → REQUIRES_APPROVAL → lawyer approve/reject/edit → continue (visión §32). | 5.1 | nodo detiene y reanuda con test. |
| 5.4 | cap-playbooks | Playbooks por práctica (Notify, Employment, etc.). | 5.1, cap-kb | playbook importable en un matter. |
| 5.5 | scheduled/triggers | Workflows schedulados + triggers por eventos (`document.uploaded`, `deadline.approaching`, `lead.created`). | cap-notifications | trigger dispara workflow. |
| 5.6 | agent perm model | Permisos por agent (READ/WRITE/CANNOT) y acciones high-risk requieren approval (visión §99–§100). | 3.5, 5.3 | test de agente Deny en acción high-risk. |

**Salida Phase 5:** automatización nativa con HITL.

---

## Phase 6 — CRM + Acquisition (visión §92)

| # | cap | Acción | Dep | Criterio de cierre |
|---|---|---|---|---|
| 6.1 | cap-crm-leads | Pipeline visual + estados visión §8; lead sources/campaign tracking. | cap-tenant | funnel visible. |
| 6.2 | cap-lead-intel | IA resume lead (urgencia/valor/riesgo/preguntas faltantes/next action) (visión §9). | 3.6 | resumen generado por lead. |
| 6.3 | cap-intake | Intake jurídico dinámico multi-step (visión §10). | 6.1 | form dinámico por área. |
| 6.4 | cap-conflict-check | Conflict Check: entities→conflict DB→existing clients→opposing→CLR/POTENTIAL/CONFLICT/REQUIRES_HUMAN_REVIEW (visión §11). | 2.2, 6.1 | decisión de conflicto trazable. |
| 6.5 | cap-whatsapp | WhatsApp intake/recordatorios/seguimiento vía adapter (no acoplar dominio). | cap-mcp | lead desde WhatsApp. |
| 6.6 | cap-email-auto | Email automation sobre Resend; secuencias nurture/follow-up; detección de leads sin seguimiento. | 6.1 | secuencia dispara. |
| 6.7 | cap-seo | Programmatic SEO `practice+jurisdiction+problem+location` con contenido real y diferenciado (visión §59–§60). | cap-website | páginas con contenido único y metadatos. |
| 6.8 | cap-sem | Campaign/keyword/ad/landing tracking y métricas CPC/CPL/CPQL/CAC/ROAS (visión §62). | 6.1 | atribución lead→revenue. |
| 6.9 | cap-lead-scoring | Lead scoring con AI + reglas heurísticas (visión §9); `lead.score` real. | 6.2 | score recalculado por evento. |

**Salida Phase 6:** pipeline acquisition→qualify→conflict→intake→matter funciona.

---

## Phase 7 — Client Portal (visión §93)

| # | cap | Acción | Dep | Criterio de cierre |
|---|---|---|---|---|
| 7.1 | cap-portal | Segmento `app/[locale]/portal/*` con rol `client`; dashboard (cases/docs/tasks/messages/appointments/invoices/payments/requests). | 2.2, 2.7 | client ve sus datos aislados. |
| 7.2 | cap-portal-invoices | Customer Portal de pagos (cancel/upgrade/invoices) sobre MP/Takenos. | cap-subscriptions | cliente gestiona suscripción. |
| 7.3 | cap-portal-sign | E-signature integrada (adapter). | 7.1 | doc firmado con audit. |
| 7.4 | cap-client-comm-agent | Agente de comunicación **administrativa**; consejo jurídico siempre requiere revisión humana (visión §41). | 3.6, 7.1 | respuesta admin vs legal separadas. |

**Salida Phase 7:** cliente consume el portal autoatendido.

---

## Phase 8 — Financial Intelligence (visión §94)

| # | cap | Acción | Dep | Criterio de cierre |
|---|---|---|---|---|
| 8.1 | cap-billing-api | `time_entries`/`invoices` API + generation; estados draft/sent/paid/overdue/void. | 2.2 | invoice generada por matter. |
| 8.2 | cap-time-tracking | Captura de tiempo (manual + automática desde workflow/agents). | 8.1 | time entry ligado a matter+user. |
| 8.3 | cap-profitability | Profitability Engine: revenue−lawyer cost−AI cost−infra−other = matter profit; KPIs (realization, collection, margin). | 8.1, 3.8 | reporte profit por matter. |
| 8.4 | cap-ai-cost | Dashboard de cost AI por modelo/agente/workflow/matter (visión §47). ID canónico usado en `docs/CAPABILITY_MATRIX.md §G` (alias histórico `cap-ai-cost-mgmt` eliminado). | 3.8 | alerta de cost over budget. |
| 8.5 | cap-payments-extra | Payment Adapter: opción Stripe como ruta alternativa (visión §48–§49). | cap-subscriptions | checkout via adapter seleccionable. |

**Salida Phase 8:** rentabilidad y costes accionables.

---

## Phase 9 — Enterprise (visión §95)

| # | cap | Acción | Dep | Criterio de cierre |
|---|---|---|---|---|
| 9.1 | cap-mfa-sso | MFA + SSO (SAML/OIDC). | cap-rbac | login con IdP enterprise. |
| 9.2 | scim | Provisioning SCIM. | 9.1 | usuario creado por IdP. |
| 9.3 | data-residency / retention | Residency selection + data lifecycle (created/active/archived/retention/deleted/purged) + jobs. | S-13 | job de retención corre. |
| 9.4 | advanced-rbac | IP allow-list, audit avanzado, governance de knowledge (visión §72, §51). | 2.1 | IP allow-list enforced. |
| 9.5 | cap-mcp / integrations | Adapters Google Workspace, MS365, Calendar, Drive, DMS (no acoplar dominio). | cap-tool-registry | evento calendar sincronizado. |
| 9.6 | API pública v1 | `POST/GET /api/v1/*` con contract tests, rate limits, API keys gestionadas. | 2.7 | cliente API con throttling. |
| 9.7 | compliance evidence | DPIA/RoPA completos; TIA/SCC con Gemini documentados; SOC2/ISO evidences recopiladas. | S-13 | evidencias auditables. |

**Salida Phase 9:** listo para firmas grandes.

---

## Phase 10 — Mobile (visión §96)

| # | cap | Acción | Dep | Criterio de cierre |
|---|---|---|---|---|
| 10.1 | cap-mobile (iOS/Android) | React Native/Expo;Assistant, Matters, Documents, Notifications, Approvals. | Phase 4, 5, 7 | flujo core en móvil. |
| 10.2 | voice/camera | Dictado, subir documentos por cámara, transcripción en el pipeline doc-intel. | 4.2 | nota de voz → matter. |
| 10.3 | offline | Cache offline para matters/docs críticos. | 10.1 | lectura offline. |

**Salida Phase 10:** ciclo completo de visión §125 (lawyer crea cliente → … → cierra matter) sin abandonar la plataforma, incluido en móvil.

---

## Reglas transversales a cada capability

1. **Issue + acceptance criteria** antes de tocar código (visión §124).
2. **DISCOVER → VERIFY → REUSE → EXTEND → TEST → VALIDATE**; nunca `ASSUME → REWRITE` (visión §85).
3. **Permissions + security gate** en cada PR; nada de acciones high-risk sin approval humano (visión §100).
4. **Observability** mínimo desde P1: evento + log estructurado por capability.
5. **Docs**: actualizar `FEATURE_MATRIX.md`, `docs/CAPABILITY_MATRIX.md` y ADR cuando una capability cambia de estado.
6. **Sin secretos**; placeholder env en CI (ya vigente); `.env.local` jamás commitado.
7. **Tabla `firm_id`** (y `matter_id`/`client_id` cuando aplique) en toda nueva tabla; RLS fail-closed.
8. **AI outputs** con risk layer: Draft/Suggested/Requires Review/Reviewed/Approved/Sent/Filed (visión §2.1).

## Métricas de avance (north star, visión §115)

- **Completed Legal Workflows** (no sólo queries).
- Human-approved AI work · Time saved · Client conversion · Matter profitability.
- Cada phase entrega里程碑s en `docs/adr` con resultado medible.