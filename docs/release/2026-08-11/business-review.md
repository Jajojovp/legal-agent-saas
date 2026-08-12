# Business Review Checklist — Phase 0 (audit documental)

- **Versión de revisión:** 2026-08-11
- **Espec vinculante:** `specs/14-review/business-review.spec.md` R1–R12.
- **Puerta maestra:** `specs/14-review/final-review.spec.md` (R7 exige esta revisión firmada).
- **Documento maestro:** `docs/release/2026-08-11-phase0-final-review.md` (sección 7).
- **Reviewer autoidentificado:** `Executive Orchestrator — Phase 0 audit coordinator` (rol técnico, no aprobación humana).
- **Alcance:** Phase 0 = **auditoría estática documental del checkout**. No es release a clientes; no hay comunicación/email/notas de release; sin stakeholders en Phase 0; sin recolección de KPIs. Sólo se valida coherencia con requisitos/visión y posición competitiva documental.
- **Cambios en Phase 0:** exclusivamente Markdown.
- **Estado global:** `CONDITIONAL` — la mayoría de reglas R5/R8/R9/R10/R12 son `N/A` por falta de release. La spec exige firma humana externa del `product-manager` + `business-analyst` + Quality Reviewer → `EXTERNAL_SIGN-OFF_REQUIRED`.

---

## 1. Reglas aplicables y no aplicables en este Phase 0

| R | Regla (spec) | Aplica | Justificación |
|---|---|---|---|
| R1 | Correspondencia 1:1 lógica/requisito; 0 derivas | ✅ Aplica (lectura) | `README`/`ROADMAP` afirman features inexistentes (TD-12, CL-2). |
| R2 | KPIs/regresión esperada pre/post-release | ❌ No aplica en Phase 0 | No hay release ni medición post-release. |
| R3 | `docs/risks.md` actualizado | ✅ Aplica | No existe archivo formal; riesgos viven en `TECH_DEBT.md` + `SECURITY-AUDIT.md §5`. |
| R4 | Posición competitiva actualizada | ◐ Aplica parcial | `MARKET-RESEARCH.md` existe; no actualizado en Phase 0. |
| R5 | Validación con stakeholders | ❌ No aplica en Phase 0 | Sin stakeholders en Phase 0. |
| R6 | Coherencia propuestas contratos / tarifario | ❓ Aplica (lectura) | Tarifario implied por `app/[locale]/pricing`; no verificado contratos. |
| R7 | Cumplimiento regulatorio sectorial | ✅ Aplica (lectura) | GDPR/LGPD/CCPA sin DPIA/RoPA (S-13). |
| R8 | Comunicación a clientes | ❌ No aplica en Phase 0 | No hay release público. |
| R9 | Plazos de reversión / rollback de negocio | ❌ No aplica en Phase 0 | No es release. |
| R10 | “Go/no-go” post-release (KPI objetivo + ventana) | ❌ No aplica en Phase 0 | No hay release. |
| R11 | Coste unitario / margen verificado | ✅ Aplica (lectura) | Sin modelo de margen/coste; `cap-profitability` y `cap-ai-cost` NEW. |
| R12 | Lecciones aprendidas en `docs/retros/<release>.md` | ❌ No aplica | No hay 2 semanas de operación en producción. |

---

## 2. Evidencia por regla

| R | Estado | Evidencia |
|---|---|---|
| R1 | ❌ | `README.md` (líneas históricas no re-verificadas en Phase 0, TD-12), `ROADMAP.md`, `STRIPE-SETUP.md` afirman Stripe, Clio, Calendly, HIPAA-ready, RBAC granular, audit logs como presentes cuando no lo están (`docs/CAPABILITY_MATRIX.md §G cap-payments-extra = NEW`; `§A cap-rbac = EXTEND`; `§A cap-audit-log = REFACTOR`). Cleanup pendiente: `IMPLEMENTATION_PLAN Phase 1.10` (CL-2). |
| R2 | ❌ | No hay KPIs medidos ni regresión pre/post-release. `IMPLEMENTATION_PLAN` define north-star métricas (visión §115) pero no se miden todavía. |
| R3 | ❌ | No existe `docs/risks.md` formal. Riesgos viven dispersos: `TECH_DEBT.md` (20 items con owner=UNASSIGNED_PENDING_OWNER), `SECURITY-AUDIT.md §5` (S-1..S-14). La spec R3 exige un archivo `docs/risks.md` con `probabilidad/impacto/mitigación/owner`. |
| R4 | ◐ | `MARKET-RESEARCH.md` enumera competidores y posicionamiento; no actualizado en Phase 0; sin datos comparativos cuantitativos post-2024. |
| R6 | ❓ | `app/[locale]/pricing` existe; tarifario no comparado con contratos reales (no solicitado en Phase 0). |
| R7 | ❌ | GDPR/CCPA/LGPD: sin DPIA/RoPA/consent/ARCO-PM/TIA (`SECURITY-AUDIT.md S-13`). Identificado; no implementado. Phase 1.9 planificado. |
| R11 | ❌ | Sin modelo de coste unitario de operación ni margen. `cap-ai-cost` (`docs/CAPABILITY_MATRIX.md §G`) y `cap-profitability` (`§G`) son `NO EXISTE / NEW`; planificados en Phase 3.8/8.3/8.4. |

---

## 3. Criterios de aceptación de la spec

| Criterio | Estado | Notas |
|---|---|---|
| Documento de revisión de negocio firmado por PM y QR | `CONDITIONAL` / `EXTERNAL_SIGN-OFF_REQUIRED` | Firma técnica abajo. Firma humana externa pendente. |
| KPIs/regresiones esperadas definidos y medidos | ❌ | No hay release. |
| Registro de riesgos actualizado | ❌ | Falta `docs/risks.md` formal. |

---

## 4. Riesgos abiertos (blockers para cualquier release futuro)

| Riesgo | spec ref | Severidad | Owner rol | Criterio de cierre |
|---|---|---|---|---|
| README/ROADMAP afirman features inexistentes (Stripe/Clio/HIPAA-ready/RBAC granular/audit) | R1, TD-12, CL-2 | P2 doc | product-manager + full-stack-engineer | Marcar “Planned/not implemented”; mover `STRIPE-SETUP.md` a `docs/archive/`; reconciliar README línea-a-línea. Phase 1.10. |
| Sin `docs/risks.md` formal con owner | R3 | P2 | product-manager | Crear archivo con probabilidad/impacto/mitigación/owner por riesgo. Phase 1.9. |
| Sin KPIs medidos | R2 | P3 | product-manager | Definir KPIs north-star (visión §115) + ventana de observación. Phase 2. |
| Sin cumple regulatorio (DPIA/RoPA/consent/ARCO-PM/TIA) | R7, S-13 | P2 | privacy-officer + product-manager | RoPA + DPIA + captura consent; TIA con Gemini documentado. Phase 1.9/9.7. |
| Sin modelo de margen/coste unitario | R11 | P3 | product-manager | `cap-ai-cost` + `cap-profitability` implementados; reporte por matter. Phase 3.8/8.3/8.4. |

**Criterio de cierre del checklist:** `docs/risks.md` creado y actualizado con owner; README/ROADMAP reconciliados; KPIs definidos y medidos pre/post-release; cumplimiento regulatorio firmado por Legal; modelo de margen implementado; firma humana externa del `product-manager` + `business-analyst` + Quality Reviewer registrada.

---

## 5. Firma

- **Reviewer:** `Executive Orchestrator — Phase 0 audit coordinator`
- **Resultado:** `CONDITIONAL`
- **Declaración:** Esta firma **no** constituye aprobación de producción. Es evidencia documental de revisión de lógica de negocio en Phase 0. Las reglas de release/comunicación/retro (R2/R5/R8/R9/R10/R12) son `N/A` porque no existe release a clientes en Phase 0. La spec exige firma humana externa de PM + business-analyst + Quality Reviewer → `EXTERNAL_SIGN-OFF_REQUIRED`.
- **Externos pendentes:** `product-manager` (firma humana externa), `business-analyst` (firma humana externa), `quality-reviewer` (firma humana externa).
- **Fecha:** 2026-08-11