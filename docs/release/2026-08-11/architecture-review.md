# Architecture Review Checklist — Phase 0 (audit documental)

- **Versión de revisión:** 2026-08-11
- **Espec vinculante:** `specs/14-review/architecture-review.spec.md` R1–R14.
- **Puerta maestra:** `specs/14-review/final-review.spec.md` (R2 exige esta revisión firmada).
- **Documento maestro:** `docs/release/2026-08-11-phase0-final-review.md` (sección 3).
- **Reviewer autoidentificado:** `Executive Orchestrator — Phase 0 audit coordinator` (rol técnico, no aprobación humana).
- **Alcance:** Phase 0 = **auditoría estática documental de capacidades del repositorio**. Sin acceso a la aplicación desplegada, sin staging, sin infra viva. Sólo lectura del checkout local + ejecución fresca de `npm test/lint/typecheck/build`.
- **Cambios en Phase 0:** exclusivamente Markdown. No se modificó código, tests ni configuración.
- **Estado global:** `CONDITIONAL` — ⚠ No es aprobación de producción. Si la spec exige firmas humanas externas (arquitecto + Quality Reviewer), marca `EXTERNAL_SIGN-OFF_REQUIRED` al final.

---

## 1. Reglas aplicables y no aplicables en este Phase 0

| R | Regla (spec) | Aplica | Justificación |
|---|---|---|---|
| R1 | Toda decisión mayor con ADR vigente; sin ADR, no aprueba | ✅ Aplica (auditable por lectura) | 8 ADRs en `docs/adr/0001..0008`. |
| R2 | Trade-off explícito (alternativas + razón) | ✅ Aplica | Leíble en ADRs y `ARCHITECTURE.md §2.2`. |
| R3 | Límites por bounded context + owner | ✅ Aplica | `ARCHITECTURE.md §1.3` reconoce 8 contexts. |
| R4 | SPOF identificado + mitigación (redundancia/fallback/CB) | ✅ Aplica | Lectura de `ARCHITECTURE.md §1.4/§2.5`. |
| R5 | Dependencia externa con timeout/retry/CB | ✅ Aplica | Gemini + MP cables auditables. |
| R6 | Plan escalabilidad x10/x100 | ✅ Aplica parcial (documental) | `ARCHITECTURE.md §2`. |
| R7 | Deuda técnica registrada | ✅ Aplica | `TECH_DEBT.md` 20 items. |
| R8 | Modelo de datos coherente + migraciones reversibles | ✅ Aplica | `schema.ts` + `migrations/`. |
| R9 | Backwards compatibility / plan migración | ✅ Aplica | `IMPLEMENTATION_PLAN.md` “no rewrite”. |
| R10 | Cumplimiento GDPR/CCPA/HIPAA por jurisdicción | ✅ Aplica (lectura) | Sin DPIA/RoPA en repo. |
| R11 | Costeo por transacción / usuario | ✅ Aplica (lectura) | No hay modelo de coste. |
| R12 | Observability: métricas/logs/traces cada servicio | ✅ Aplica (lectura) | Sólo `console.*`. |
| R13 | Threat model + STRIDE | ⚠ Aplica con sustento débil | `SECURITY-AUDIT.md` mapea OWASP A01..A10; sin STRIDE formal. |
| R14 | WCAG 2.1 AA | ❌ No aplica a auditoría de repo | No se renderizó UI; ver `ui-review.md`. |

> Reglas `N/A`: ninguna en este checklist (criterios de aceptación ×2 sobre SPOF y deuda se tratan abajo).

---

## 2. Evidencia por regla

| R | Estado | Evidencia |
|---|---|---|
| R1 | ✅ parcial | `docs/adr/0001..0008`. ADR-0003/0006/0007/0008 marcan “parcial/no cableado” → abierto en Phase 1. |
| R2 | ✅ | ADRs documentan alternativas; `ARCHITECTURE.md §2.2` enumera 8 reglas de evolución (no rewrite, una capability por PR, interfaces estables, etc.). |
| R3 | ✅ | `ARCHITECTURE.md §1.3`: 8 bounded contexts (IAM, CRM, Matters, Documents, AI Assistant, Billing, Marketing, Platform) con madurez Alta/Media/Baja/Stub. |
| R4 | ⚠ | SPOFs documentados en `ARCHITECTURE.md §1.4/§2.5`: mono-tenant `law_firms` (sin `organizations`), single DB, serverless single-instance sin Redis/queue. Mitigación: documentada (Phase 1 introduce Redis, Phase 9 multi-org). No mitigación vigente aún. |
| R5 | ❌ | Gemini (`lib/ai/legal-ai-service.ts:36-127`) sin timeout/CB explícitos. MP webhook tiene firma+idempotencia (verificado) pero checkout sin CB. |
| R6 | ◐ | `ARCHITECTURE.md §2` describe migración incremental por capability; sin escalar formal x10/x100 ni coste cuantificado. |
| R7 | ✅ | `TECH_DEBT.md` 20 items con evidencia/impacto/remediación/cierre. |
| R8 | ✅ | `lib/db/schema.ts` **17 tablas** (4 auth + 13 negocio); migraciones up/down (`lib/db/migrations/rls_multitenant_{up,down}.sql`, `payments_*`); ADR-0005 reversibilidad. La cifra previa "14 tablas" fue corregida por recount fresco (ver `TECH_DEBT.md` TD-15d). |
| R9 | ✅ | `IMPLEMENTATION_PLAN.md §0`: “No se reescribe código funcional”; reglas de evolución `ARCHITECTURE.md §2.2`. Nuevas capabilities preservan interfaces (`queryWithContext`, `analyzeDocument(text)`). |
| R10 | ❌ | Sin DPIA/RoPA consent/ARCO-PM/TIA (`CURRENT_STATE §3.10`, `SECURITY-AUDIT.md S-13`). Identificado; no implementado. |
| R11 | ❌ | Sin modelo de coste por transacción/usuario. `cap-ai-cost` (capability `cap-ai-cost` en `docs/CAPABILITY_MATRIX.md §G`) es `NO EXISTE / NEW`, planificado en `IMPLEMENTATION_PLAN Phase 3.8/8.4`. |
| R12 | ❌ | Sólo `console.*` en `app/api/**`, `lib/**` (TD-8); sin métricas/traces/alertas accionables. |
| R13 | ◐ | `SECURITY-AUDIT.md §1` mapea OWASP A01..A09 con evidencia; sin STRIDE formal actualizado. |
| R14 | N/A | Auditoría de repositorio, sin UI en staging. Ver `docs/release/2026-08-11/ui-review.md`. |

---

## 3. Criterios de aceptación de la spec

| Criterio | Estado | Notas |
|---|---|---|
| Checklist completo firmado por arquitecto y Quality Reviewer | `CONDITIONAL` / `EXTERNAL_SIGN-OFF_REQUIRED` | Firma técnica (Executive Orchestrator — Phase 0 audit coordinator) abaixo. No aprueba producción. Firma humana externa del arquitecto pendente. |
| 0 SPOFs sin mitigación documentada | ❌ | SPOFs identificados en `ARCHITECTURE.md §1.4/§2.5` con *documentación* de mitigación futura, pero no mitigados hoy (single DB, sin Redis, sin queue, sin `organizations`). Estado: `OPEN` —Phase 1 introduce Redis (item 1.7), Phase 9 multi-org (item 9.x). |
| Debt technical con eyección planificada | ✅ | `TECH_DEBT.md` 20 items con remediación/criterio de cierre; `IMPLEMENTATION_PLAN Phase 1` eyección P0/P1. |

---

## 4. Riesgos abiertos (blockers de release futuro)

| Riesgo | Spec ref | Severidad | Owner rol | Criterio de cierre |
|---|---|---|---|---|
| Sin Redis/queue → rate-limit in-memory no distribuido | R4/R5, TD-7 | P2 | platform-engineer | Phase 1.7 introduce Redis/Upstash; test de dos instancias. |
| Sin CB/timeout para Gemini | R5 | P1 | platform-engineer | Adapter con timeout + retry + CB; test de fallback. |
| Sin observability estructurada | R12, TD-8 | P1 | platform-engineer | Logger estructurado + Sentry + métricas; 0 `console.*` en prod. |
| Sin threat model STRIDE formal | R13 | P2 | security-engineer | STRIDE actualizado en `docs/seguridad/`. |
| Sin modelo de coste | R11 | P3 | product-engineer | `cap-ai-cost` implementado en Phase 3.8/8.4; reporte cost por matter. |

**Criterio de cierre del checklist:** todos los riesgos resueltos o reasignados con resultado medible en `docs/adr/`; SPOFs mitigados en código (no solo documentados); firma humana externa del arquitecto registrada.

---

## 5. Firma

- **Reviewer:** `Executive Orchestrator — Phase 0 audit coordinator`
- **Resultado:** `CONDITIONAL`
- **Declaración:** Esta firma **no** es aprobación de producción. Constituye evidencia documental de revisión arquitectónica de Phase 0. La spec exige firma humana externa del rol `software-architect` + Quality Reviewer → está marcada `EXTERNAL_SIGN-OFF_REQUIRED` para cualquier release a producción.
- **Externos pendentes:** `software-architect` (firma humana externa), `quality-reviewer` (firma humana externa).
- **Fecha:** 2026-08-11