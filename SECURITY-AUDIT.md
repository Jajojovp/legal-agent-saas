# SECURITY-AUDIT — Auditoría de seguridad (Phase 0 Repository Capability Audit)

- **Fecha de auditoría:** 2026-08-11
- **Alcance:** repositorio local `legal-agent-saas` commit `11bc4ca`. Auditoría estática de solo lectura sobre código + configuración + tests. **Sin** pentest dinámico, sin DAST/SAST ejecutado, sin acceso a la app desplegada, sin lectura de `.env.local`.
- **Clasificación:** CONFIDENTIAL
- **Verificación de calidad fresca (2026-08-11, dos corridas en el mismo checkout):**
  - **Corrida A (orquestador):** `npm test` → **12 suites / 70 tests pasan**; Vitest reporta **3 unhandled errors** por timeout `fetch ["/@vite/env","ssr"]`; **salida global no limpia**. `npm run lint` → exit 0 / ~33 warnings `no-console`. `npm run build` → **compila** (route table generado) pero **no se observó exit 0**: excedió 300000 ms antes del cierre; registra `DATABASE_URL not configured`, `Dynamic server usage`, `Get cases error`, `Get tasks error`, `Dashboard KPI error`.
  - **Corrida B (cierre Phase 0):** `npm test -- --reporter=dot --testTimeout=30000` → **15 suites / 113 tests pasan**, 0 fallos, 0 unhandled errors, duración *esta máquina* **42.84 s** (job `auth-options.test.ts` ~7.89 s). Lint/typecheck idénticos. Build no se re-ejecutó.
  - **La divergencia es el hallazgo:** la suite es flaky. **No se afirma "tests estables" ni "build limpio"**. La cifra 113 sólo se cita porque se ejecutó y confirmó; la cifra 70 también se observó.
  - Detalle en `CURRENT_STATE.md` §2, `TECH_DEBT.md` TD-15/TD-19 y `docs/release/2026-08-11-phase0-final-review.md` §8.
- **Control regimes:** cada control citado seclasifica en la §2/§3 como *Declarado*, *Cableado*, *Proven* (con test) / *No Proven*. La §3 lista explícitamente los declarados no cableados. **No se declara production-ready**.
- **Este documento reemplaza** la auditoría previa `SECURITY-AUDIT.md` v3.0 (fecha 2024-04-22) porque contenía **claims obsoletos** (ver §6 Histórico y `docs/audit/findings-tracker.csv` para la reconciliación). El histórico se conserva y referencia en §6; no se borra información sin justificar — cada claim antiguo se marca como SUPERSEDED con casos de evidencia.

> **Advertencia de honestidad (énfasis visión §56/§120):** la auditoría distingue entre *control declarado*, *control cableado* y *control probado*. No se aceptan afirmaciones por puntuación. Aquí no hay “score 92/100”; hay hallazgos con evidencia y gap con tests pendientes.

---

## 1. Hallazgos confirmados

Se numeran con `S-` para diferenciar de los `F-` del tracker previo. Donde un `F-` se reconcilia, se referencia.

| ID | Severidad | Categoría OWASP | Hallazgo | Evidencia (path:line) | Estado vs tracker previo |
|---|---|---|---|---|---|
| S-1 | P0 | A01 Broken Access Control | **CSRF declarado 100% pero `validateCSRFToken` no se invoca en ninguna ruta.** | `lib/security/middleware.ts:61-68` definición; grep `app/**` sin hits. | Confirma **F9** (Open). |
| S-2 | P0 | A05 Security Misconfiguration | `addSecurityHeaders` definido en `lib/security/middleware.ts:161` **nunca llamado**; los headers reales viven en `next.config.js:22-55` (parcialmente correctos). Código muerto que induce confianza falsa. | `lib/security/middleware.ts:161-198` (sin callers) vs `next.config.js:22-55`. | Confirma **F7** parcial (realidad: headers sí aplicados por next.config; el problema es la duplicación muerta). |
| S-3 | P1 | A09 Logging Failures | `logSecurityEvent` solo `console.log` y **no persistente**; no existe tabla `audit_logs` en `schema.ts`. | `lib/security/middleware.ts:293-298`; `lib/db/schema.ts` (sin audit_logs). | Confirma **F14** (Open). |
| S-4 | P1 | A01 Broken Access Control | `validateFileUpload` confía en `file.type` (client-controlled); sin magic-byte check ni virus scan; y **no se invoca** desde `analyze-document` (que opera sobre `documentText`). | `lib/security/middleware.ts:240-279`; `app/api/ai/analyze-document/route.ts`. | Confirma **F11** (Open). |
| S-5 | P1 | A07 Auth Failures | Registro **auto-eleva** `role='owner'` sin verificación de email, sin rate-limit, sin password policy enforced explícitamente en la ruta. | `app/api/auth/register/route.ts:38-46` (`role: 'owner'`); sin rate-limit ni verify. | Confirma **F10/F15** (Open). |
| S-6 | P1 | A07 Auth Failures | JWT `maxAge: 30d` sin refresh ni revocación; `isActive` solo se valida en sign-in, no en cada petición. | `auth-options.ts:99-119`; nota follow-up `P0-AUTH-FIXES.md:226-228`. | Confirma **F16** (Open). |
| S-7 | P2 | A02 Crypto Failures | TLS de Postgres se puede deshabilitar en no-prod (`DB_SSL_REJECT_UNAUTHORIZED=false`). Aceptable para dev; riesgo si la bandera se filtra a prod. | `lib/db/index.ts:6-18`. | Confirma **F6** (Open). |
| S-8 | P2 | A05 / A07 | Rate limiting **in-memory** no distribuido: se rompe con multi-instancia serverless (Vercel). | `lib/security/middleware.ts:4`, `app/api/chatbot/message/route.ts:22-39`. | Confirma **F12** (Open). |
| S-9 | P2 | A09 Logging Failures | `console.error`/`console.log` en rutas puede loguear stacks con PII o secretos; sin sanitización. | `app/api/auth/register/route.ts:56`, `app/api/payments/mp/webhook/route.ts:28`, `app/api/chatbot/message/route.ts`, `lib/ai/legal-ai-service.ts:115/119/125`. | Confirma **F18** (Open). |
| S-10 | P3 | A07 Secret Mgmt | `validateAPIKey` solo valida prefijo+longitud; sin persistencia/rotación. | `lib/security/middleware.ts:203-208`. | Confirma **F19** (Open). |
| S-11 | P3 | A06 Supply Chain | Dependencias con rango `^` suelto, sin SBOM, sin `npm audit` como **gate** (CI usa `continue-on-error`). | `package.json:21-45`, `.github/workflows/ci.yml:80-88`. | Confirma **F22** (Open). |
| S-12 | P3 | A08 Integrity | Knowledge base **en memoria** no persistida y substitute de RAG; el aislamiento por tenant actual es por firma de interfaz, no por RLS sobre knowledge. | `lib/ai/knowledge-base.ts:14` (`Map`); sin tabla `knowledge_*` ni RLS. | Refuerza **F3**: el GET/POST KB está auth-gated, pero el almacén respalda nada. |
| S-13 | P3 | Privacy | Sin DPIA pese a procesar datos jurídicos sensibles (PII en leads, chat, documents) vía IA en EEUU (Google Gemini). Sin RoPA, sin consent capture, sin retención, sin endpoints ARCO-PM, sin TIA/SCC. | `docs/audit/findings-tracker.csv` matriz privacidad; `lib/email`/`leads`/`chat` almacenan PII. | Confirma matriz privacidad (Open). |

### 1.1 Hallazgos RESUELTOS confirmados contra código (no reclamar como nuevos)

| Ítem P0 | Confirmado resuelto | Evidencia |
|---|---|---|
| Auth context + `requireAuth` (`F5`) | **Sí** | `lib/auth/context.ts`, `lib/auth/session.ts:20`, `auth-options.ts:108-119`; tests `tests/auth/{context,flow,authorization,chatbot-scope}.test.ts` (113 tests pasan). |
| Dashboard gate (`F8 parcial`) | **Sí** (gate de cookie) | `middleware.ts:19-34`, `lib/auth/dashboard-gate.ts`, `tests/auth/dashboard-gate.test.ts` (12 tests). |
| KB / analyze-document auth + firmId from context (`F3`/`F2 parcial`) | **Sí (auth)** — storage/parseo siguen siendo stubs | `app/api/ai/knowledge/route.ts:4,19,25,33,58`, `app/api/ai/analyze-document/route.ts:8`. |
| PATCH leads / qualify tenant + ownership (`F4`) | **Sí** | `app/api/leads/route.ts:79-134`, `app/api/leads/qualify/route.ts`; `canModifyLead` + `WHERE eq(id),eq(firmId)`. |
| Webhook MP firma + idempotencia + state (`F17`) | **Sí (sustancial)** — reconcilia reclamo “sin idempotencia” | `app/api/payments/mp/webhook/route.ts:13-22` (`verifyMPWebhook`), `lib/payments/webhook-service.ts`, `lib/payments/repository.ts:17-43` (`claimPaymentEvent` with `onConflictDoNothing` + reclaim failed), `applySubscriptionState`. |
| Chatbot internal mode gated + IDOR firma (`F1`) | **Sí** | `app/api/chatbot/message/route.ts:78-118` (`isInternalModeAllowed`, `resolveChatFirmId`, `canPersistConversation`, lookup `and(eq(sessionId),eq(firmId))`). |

> **S-14:** reclamar `F1` como *blocker* en `findings-tracker.csv:62` está obsoleto; el POST chatbot hoy scopea lectura/update por `sessionId AND firmId` (`route.ts:101-118`). Se recomienda mover F1 a *Confirmed Fixed* en el tracker.

---

## 2. Controles existentes (cableados y provados)

| Control | Cableado | Proado | Evidencia |
|---|---|---|---|
| Authentication (Credentials + bcrypt 12 + JWT) | ✅ | ✅ unit | `auth-options.ts:41-102`, `tests/auth/{auth-options,flow}.test.ts` |
| Auth context firmId/role/isActive | ✅ | ✅ unit | `lib/auth/context.ts`, `tests/auth/context.test.ts` (13) |
| Tenant RLS por transacción (fail-closed) | ✅ | ✅ unit (helper) | `lib/db/tenant-context.ts:20-26`, `tests/db/{tenant-context,rls-migration,tenant-route-contract}.test.ts` |
| `firmId` siempre del contexto (no body) | ✅ | ✅ unit | `lib/auth/authorization.ts:51,118`, `tests/auth/authorization.test.ts` |
| Ownership + tenant en PATCH leads | ✅ | ✅ unit | `app/api/leads/route.ts:79-134`, `tests/auth/authorization.test.ts:22` |
| Dashboard cookie gate (edge) | ✅ | ✅ unit | `middleware.ts`, `tests/auth/dashboard-gate.test.ts` (12) |
| Security headers (CSP/HSTS/X-Frame/nosniff/Referrer/Permissions/COOP) | ✅ (next.config) | ❌ no header test | `next.config.js:22-55` |
| MP webhook HMAC-SHA256 + constant-time compare | ✅ | ✅ unit (contracts) | `lib/payments/mercadopago.ts:122-151`, `tests/payments/{contracts,webhook-service,subscription-state}.test.ts` |
| Payment idempotency + state reconciliation | ✅ | ✅ unit (service) | `lib/payments/{webhook-service,repository,subscription-state}.test.ts` (12) |
| Chatbot internal-mode + public anonymous firm 1 | ✅ | ✅ unit | `tests/auth/chatbot-scope.test.ts` (14), `tests/chatbot/public-session.test.ts` (8) |
| Zod validation en rutas críticas | ✅ | parcial | `lib/validations.ts`, `app/api/leads/route.ts:42`, `app/api/auth/register/route.ts:10` |

## 3. Controles declarados pero NO cableados (deuda)

| Control | Definido en | Cableado | Acción |
|---|---|---|---|
| `validateCSRFToken` | `lib/security/middleware.ts:61` | ❌ nunca llamado | Cablear en rutas mutativas **o** documentar que la API JSON SameSite no requiere doble-submit y eliminar el stub. |
| `addSecurityHeaders` | `lib/security/middleware.ts:161` | ❌ nunca llamado | Eliminar (duplica next.config). |
| `logSecurityEvent` / `audit_logs` | `lib/security/middleware.ts:293` | ❌ console.log only | Introducir tabla `audit_logs` + writer persistente (P1). |
| `validateFileUpload` | `lib/security/middleware.ts:240` | ❌ no usado en analyze-document | Cablear cuando se introduzca storage real. |
| `sanitizeInput`/`sanitizeHTML` | `lib/security/middleware.ts:73/91` | uso parcial no verificado | Validar uso en rutas; Drizzle cubre SQLi via prepared statements. |
| `validateAPIKey` | `lib/security/middleware.ts:203` | ❌ sin API pública todavía | Revisar cuando se introduzca `/api/v1`. |

## 4. Tests pendientes (no provados en esta auditoría)

- **Integration tests** de route handlers con fake DB (solo helpers puros hoy).
- **RLS negative tests en staging**: `supabase-init.sql:6` referencia `tests/db/rls-negative.sql` que **no existe** en el repo (solo `rls-migration.test.ts`).
- **E2E** de flujos críticos (register → login → create lead → qualify → payment).
- **Concurrency test** del path `claimPaymentEvent` (reclaim de `failed`) — `repository.ts:27-35`.
- **Header/CSP test** automatizado.
- **Fuzzing / DAST** de endpoints (A03 injection sin probar activamente — Drizzle prepared statements son mitigación, no prueba).
- **SSRF review** de llamadas salientes con input usuario (A10: `mercadopago.ts` usa IDs controlados; Gemini usa prompts con texto de usuario → revisar prompt-injection).
- **AI red-team**: prompt-injection sobre chatbot y `analyzeDocument` (texto del usuario entra directo al prompt).
- **Secrets scan** del git history (no se ejecutó; `.env.local` presente en workspace pero `.gitignore` correcto).

## 5. Riesgos residuales y prioridades

1. **P0 (bloqueante pre-prod):** S-1 (CSRF), S-2 (código muerto de seguridad), S-3 (audit log), S-5 (registro frágil). Estos crean **confianza falsa** y vacío de trazabilidad.
2. **P1:** S-4 (uploads), S-6 (session life), S-8 (rate limit distribuido), S-9 (logs con PII), observability.
3. **P2:** S-7 (TLS flag), S-12 (KB/RAG isolation por RLS real), S-13 (privacy: DPIA/RoPA/consent/ARCO-PM/TIA).
4. **P3+:** S-10, S-11, integraciones enterprise.

## 6. Histórico (preservado y reconciliado)

### 6.1 `SECURITY-AUDIT.md` v3.0 — 2024-04-22 — SUPERSEDED

La auditoría raíz previa afirmaba (resumen, con reconciliación al 2026-08-11):

| Claim v3.0 (2024-04-22) | Estado real 2026-08-11 | Acción |
|---|---|---|
| “Overall 92/100, Production Ready” | **No avalado** — sin pentest ni evidencia; control de production readiness no procede de un score autoasignado. | Desestimado como claim vinculante. |
| “SQL Injection 100% (Drizzle)” | Drizzle usa prepared statements (`db.client = postgres(...)`, `drizzle`). Sin fuzzing. | Mitigación presente; **no probado**. |
| “XSS 95% (sanitizeHTML + CSP)” | `sanitizeHTML` defined; CSP en next.config aplica. React auto-escapea. `dangerouslySetInnerHTML` usage no verificado. | Parcialmente respaldado. |
| “CSRF 100% (token validation)” | **Falso hoy** — `validateCSRFToken` nunca invocado (S-1). | Marcar **SUPERSEDED**; corrige en S-1. |
| “Auth 0/100 NOT IMPLEMENTED” | **Falso hoy** — NextAuth implementado con Credentials + Google opcional + JWT context. | Marcar **SUPERSEDED**; ver §1.1. |
| “File Upload 100% implemented” | **Falso** — `validateFileUpload` no se usa; analyze-document recibe `documentText`. | Marcar **SUPERSEDED**; corrige en S-4. |
| “Security Headers 100%” | Parcialmente respaldado por `next.config.js:22-55`. | Mantener; eliminar duplicado muerto (S-2). |
| “Data Encryption 98%, DB encryption at rest” | TLS configurable; at-rest depende de Supabase (no verificado aquí). | No avalado; requerir evidencia del proveedor. |
| “GDPR/CCPA compliant” | **No verificado** — ver S-13 (privacy matrix). | Marcar **SUPERSEDED**. |
| “SOC 2 in progress / HIPAA ready” | **No verificado**. | Desestimar hasta evidencia formal. |

> El histórico v3.0 íntegro no se reescribe aquí; queda referenciado en git history. Esta sección reemplaza sus afirmaciones vinculantes conforme al principio de no borrar sin justificar (cada item tiene caso de evidencia y acción).

### 6.2 `docs/audit/findings-tracker.csv` — 2026-08-05 — vigente (referenciado)

Auditoría estática previa con `F1..F22`, matriz OWASP y matriz privacidad. Se conserva como anexo histórico de seguridad. Reconciliación con esta auditoría:
- **Confirmados Fixed (reconciliados a código):** F3, F4, F5, F1 (POST chatbot), F17 (webhook idempotencia).
- **Open sostenidos:** F6, F7, F8, F9, F10, F11, F12, F14, F15, F16, F18, F19, F20, F21, F22.
- **Re marker de los claims de `SECURITY-AUDIT.md` v3.0:** F13 (mantener).

### 6.3 `docs/audit/P0-AUTH-FIXES.md` — 2026-08-05 — vigente

Resumen de hardening P0-001..P0-005. Sigue siendo la fuente primaria de *qué se hizo* en auth. Esta auditoría lo reconfirma y amplía con el estado de pagos (F17).

---

## 7. Owner / seguimiento

- Tracker vivo: `docs/audit/findings-tracker.csv` (mantener IDs F-*; no duplicar).
- Esta auditoría introduce `S-*` para hallazgos post-2026-08-11 que no existen en el tracker; al crear tickets, mapear cada `S-*` a un item del tracker.
- Responsable: TBD (asignar en Phase 1 Stabilization).
