# Phase 0 Final Review — Repository Capability Audit

- **Versión de revisión:** 2026-08-11 (corrección documental final; sin cambios de código/tests/config).
- **Espec maestra:** `specs/14-review/final-review.spec.md` (R1–R16). Sin esta puerta maestra, no existe aprobación de release.
- **Reviewer:** quality-reviewer (rol). **Autor del cierre (técnico, no aprobación humana):** `Executive Orchestrator — Phase 0 audit coordinator` (rol técnico coordinando la auditoría de Phase 0). La spec R14/R15 exige firma humana externa del rol `quality-reviewer` para cualquier `PASS`; está marcada `EXTERNAL_SIGN-OFF_REQUIRED` al final.
- **Alcance:** Phase 0 = **auditoría de capacidades de repositorio**. **No es un release de producto.** No se aprueba producción, no se aprueba deploy. Es una puerta de cierre de la fase de *Análisis* (`specs/00-core/workflow.spec.md` R4) que habilita Phase 1 *Stabilization*.
- **Estado:** **CONDITIONAL_APPROVAL** (NO `APPROVED`, NO `PASS`) — existen blockers de release (no de auditoría) documentados en §10 y §11.
- **Checklists vinculados (R2/R3/R5/R6/R7):**
  - Arquitectura: `docs/release/2026-08-11/architecture-review.md` (R2)
  - Código: `docs/release/2026-08-11/code-review.md` (R3)
  - Seguridad: `docs/release/2026-08-11/security-review.md` (R5)
  - UI/UX: `docs/release/2026-08-11/ui-review.md` (R6)
  - Negocio: `docs/release/2026-08-11/business-review.md` (R7)
- **Manifest de entregables:** `docs/release/2026-08-11/artifact-manifest.md` (lista completa, estados tracked/untracked/modificado).
- **Artefactos base:** `CURRENT_STATE.md`, `ARCHITECTURE.md`, `FEATURE_MATRIX.md`, `SECURITY-AUDIT.md`, `TECH_DEBT.md`, `docs/CAPABILITY_MATRIX.md`, `analysis-intake.md`, `docs/adr/0001..0008`, `docs/audit/P0-AUTH-FIXES.md`, `docs/audit/findings-tracker.csv`.

> **Advertencia vinculante (visión §56/§120 + `final-review.spec.md` R14/R15):** esta revisión es **conditional** (no approved). **No habilita production deploy.** El resultado `CONDITIONAL_APPROVAL` significa: el cierre documental de Phase 0 se acepta como entrada a Phase 1 con la condición de resolver la lista de blockers de release aquí enumerados. Cualquier referencia futura que cite “Phase 0 aprobado” debe añadir “conditional approval, not production release”.

> **Nota sobre el árbol de trabajo:** los cambios de Phase 0 están **exclusivamente en Markdown** y **no se commitearon** en esta sesión. La sesión **no recibió autorización explícita del usuario para `git commit`/`git push`**; por política de permisos, los cambios quedan en el árbol de trabajo listos para review. **Esto no es un fallo de código** ni invalida la auditoría. `git diff --check` ⇒ limpio al cierre (sin whitespace errors). Ver `docs/release/2026-08-11/artifact-manifest.md §2`.

---

## 1. Alcance (Phase 0)

| Ítem | Descripción |
|---|---|
| Tipo de trabajo | Repository Capability Audit (`analysis-intake.md`). Auditoría estática de solo lectura. |
| Repositorio | `legal-agent-saas` @ commit `11bc4ca feat: Legal Agent SaaS Platform v2.0.0`, rama `main`. |
| Fuente de verdad | Código del checkout local (no README/ROADMAP). |
| Especificación principal | `specs/02-analysis/repository-analysis.spec.md`; `specs/14-review/*`. |
| Actividades | Lectura de código, ejecución de `npm test/lint/typecheck/build`, inventario capability, reconciliación con ADRs y audits previos. |
| NO incluye | Pentest dinámico, DAST/SAST ejecutado, SBOM, accessibility audit, performance/load test, análisis de aplicación desplegada (`02-analysis/application-analysis.spec.md` condicional, no solicitado). |
| Cambios en Phase 0 | Exclusivamente documentación. Sin modificar código de aplicación, tests ni configuración. |

## 2. Artefactos revisados

| Artefacto | Estado | Evidencia |
|---|---|---|
| `CURRENT_STATE.md` | revisado y actualizado | secciones 2, 3.10 ajustadas a corrida fresca; control regimes declarado/cableado/verificado. |
| `ARCHITECTURE.md` | revisado | state map + ADR summaries + target map; limitaciones estructurales §1.4 vigentes. |
| `FEATURE_MATRIX.md` | revisado y actualizado | **vista 1:1** con `docs/CAPABILITY_MATRIX.md` (77 capabilities cap-*, secciones A–J, mismo orden, 0 alias ambiguos, 0 filas divergentes); recuento exacto (17 ✓ / 13 ◐ / 47 ✗); cross-check al final del archivo. |
| `docs/CAPABILITY_MATRIX.md` | revisado y actualizado (canónica) | **matriz única**: 77 filas cap-* en secciones A–J; `audit-log` alineado a ◐/REFACTOR; `website` alineado a ✓/KEEP; `cap-rbac-admin` fila propia; `cap-register` unificado (sin alias `register`); `cap-ai-cost` único en §G (sin alias `ai-cost-mgmt`); `cap-kb` único en §D (sin duplicado en §I); § Plants/Templates añadidos. |
| `SECURITY-AUDIT.md` | re-escrito (se reemplaza al v3.0) | hallazgos S-1..S-14; §1.1 resueltos; controles §2 (cableados+proven); §3 declarados no cableados; §6 histórico reconciliado SUPERSEDED. |
| `TECH_DEBT.md` | revisado y actualizado | TD-1 (líneas v3.0 históricas marcadas), TD-12 (líneas README no re-verificadas en Phase 0), TD-15 (corrida fresca 22.91 s / auth-options 5.78 s). |
| `analysis-intake.md` | vigente | intake aprobado para planificación; GAPs ID-GAP-010..ID-GAP-018 con specs. |
| ADRs `docs/adr/0001..0008` | vigentes | `ARCHITECTURE.md` §1.2 resume estado actual de cada uno; algunos marcan “parcial/no cableado”. |

## 3. Revisión de arquitectura (`architecture-review.spec.md` R1–R14)

> Checklist dedicado (firma `Executive Orchestrator — Phase 0 audit coordinator`, estado `CONDITIONAL`, `EXTERNAL_SIGN-OFF_REQUIRED`): `docs/release/2026-08-11/architecture-review.md`.

| R | Requisito | Estado | Notas |
|---|---|---|---|
| R1 | Toda decisión mayor cuenta con ADR vigente | ✅ parcial | 8 ADRs (`0001..0008`). ADR-0003 y 0006/0007/0008 marcan “parcial/no cableado” — abiertos en Phase 1. |
| R2 | Trade-off explícito | ✅ | ADRs documentan alternativas; `ARCHITECTURE.md` §2.2 reglas de evolución. |
| R3 | Límites por bounded context | ✅ | `ARCHITECTURE.md` §1.3 reconoce 8 contexts con madurez Alta/Media/Baja/Stub. |
| R4 | SPOFs mitigados | ⚠ | Mono-tenant `law_firms` sin `organizations` arriba; single DB; single arq serverless — sin Redis, sin queue. Documentado en `ARCHITECTURE.md` §1.4/§2.5. |
| R5 | Dependencias externas con timeout/retry/CB | ❌ | Gemini sin timeout/CB explícitos; MP webhook tiene firma+idempotencia pero sin CB para checkout. Open en S-* implícitos. |
| R6 | Plan de escalabilidad x10/x100 | ◐ | `ARCHITECTURE.md` §2 describe migración incremental; sin escalar formal x10/x100 ni coste. |
| R7 | Deuda técnica registrada | ✅ | `TECH_DEBT.md` 20 items con evidencia/impacto/remediación/cierre. |
| R8 | Modelo de datos coherente + migraciones reversibles | ✅ | `schema.ts` **17 tablas** (recount fresco; cifra previa 14 corregida por `TECH_DEBT.md` TD-15d) + up/down en `migrations/`; ADR-0005 reversibilidad. |
| R9 | Backwards compat | ✅ | Plan incremental “no rewrite”; nueva capa de capabilities preserva interfaces. |
| R10 | Cumplimiento legal (GDPR/CCPA/HIPAA) | ❌ | Sin DPIA/RoPA/consent (S-13); solo se identificó. |
| R11 | Costeo por transacción/usuario | ❌ | Sin modelo de coste en `ARCHITECTURE.md`. Será parte de `cap-ai-cost` Phase 3.8. |
| R12 | Observability: métricas/logs/traces | ❌ | Solo `console.*`. TD-8. |
| R13 | Threat model + STRIDE | ◐ | Hallazgos `SECURITY-AUDIT.md` OWASP A01..A10 pero sin threat model formal STRIDE actualizado. |
| R14 | WCAG 2.1 AA | ❌ | Sin a11y audit ejecutada. |

## 4. Revisión de código (`code-review.spec.md` R1–R13)

> Checklist dedicado (firma `Executive Orchestrator — Phase 0 audit coordinator`, estado `CONDITIONAL`, `EXTERNAL_SIGN-OFF_REQUIRED`): `docs/release/2026-08-11/code-review.md`.

Esta revisión es **evidencia únicamente** (no cambios de código en Phase 0). Aplica a la lectura del checkout.

| R | Requisito | Estado | Notas |
|---|---|---|---|
| R1 funcionalidad/pruebas/estilo/seguridad/perf/legibilidad/errores | ◐ | Se revisó por lectura; tests 113/113 pasan; warnings `no-console` (TD-8); errores `console.log` en rutas de pago (S-9). |
| R5 | Toda nueva funcionalidad arrive con test | N/A | No se añade funcionalidad en Phase 0. |
| R6 | Errores explícitos | ◐ | `console.error` sin sanitizar (S-9); sin tipos de error (ADR-0008 no implementado). |
| R7 | Sin secretos en código | ✅ | `.env.local` ignorado; placeholders en CI. |
| R8 | Linter 0 warnings | ❌ | 33 warnings `no-console` (no bloquean pero TD-8). |
| R10/R12 | Approval → Block / PR ≥1 approval / PR crítico ≥2 | N/A | No se crean PRs de código en Phase 0 (cambios sólo docs). |

> No se emite `Approve/Request Changes/Block` sobre código: no se generan PRs de código aquí. Cualquier cambio futuro a código dependerá de PRs de Phase 1 con revisiones firmadas.

## 5. Revisión de seguridad (`security-review.spec.md` R1–R12)

> Checklist dedicado (firma `Executive Orchestrator — Phase 0 audit coordinator`, estado `CONDITIONAL`, `EXTERNAL_SIGN-OFF_REQUIRED`): `docs/release/2026-08-11/security-review.md`.

| R | Requisito | Estado | Notas |
|---|---|---|---|
| R1 | SAST ≥Medium resuelto | ❌ | No se ejecutó SAST. Open en Phase 1.5 (`cap-build-ci` SBOM/SAST gate). |
| R2 | DAST OWASP ZAP en staging ≥Med resueltos | ❌ | No se ejecutó DAST (sin staging URL). |
| R3 | Secret scanning 0 secretos sin rotation | ◐ | No se ejecutó gitleaks/trufflehog. `.gitignore` correcto para `.env.local`; `.env.local` presente en workspace pero no en repo (TD-20). |
| R4 | IAM least privilege | ◐ | `firmId` del contexto (no body) ✓; sin tabla `permissions`. RLS por `firm_id` ✓. |
| R5 | TLS 1.2+ tránsito/reposo | ◐ | TLS Postgres configurable (S-7); at-rest depende de Supabase no verificado. |
| R6 | OWASP Top 10 2021 con evidencia | ✅ parcial | `SECURITY-AUDIT.md` §1 mapea A01..A09; A03 Injection sin fuzzing. |
| R7 | Threat model STRIDE actualizado | ❌ | Sin STRIDE formal. |
| R8 | Headers de seguridad | ✅ | `next.config.js:22-55` cablea CSP/HSTS/X-Frame/nosniff/Referrer/Permissions/COOP; no test de cabeceras. |
| R9 | Password + MFA NIST 800-63B | ❌ | Sin MFA (S-5); password policy no enforced en API. |
| R10 | Pentest anual | ❌ | No existe (no es Phase 0). |
| R11 | Logs sin PII/secretos | ❌ | `console.error` con stacks (S-9). |
| R12 | Cumplimiento GDPR/PCI/CCPA | ❌ | Privacy matrix Open (S-13). |

## 6. Revisión de UI/UX (`ui-review.spec.md` R1–R12)

> Checklist dedicado (firma `Executive Orchestrator — Phase 0 audit coordinator`, estado `CONDITIONAL`, mayoría de reglas `N/A`/`❓` por falta de render, `EXTERNAL_SIGN-OFF_REQUIRED`): `docs/release/2026-08-11/ui-review.md`.

Esta Phase 0 **no incluye** revisión de UI en staging. Como sido auditoría de repositorio, se documenta lo inferible por lectura.

| R | Requisito | Estado | Notas |
|---|---|---|---|
| R1/R2 | Fidelidad visual / responsividad | N/A | Sin Figma entregado; `app/[locale]` no fue renderizado. |
| R4 | WCAG 2.1 AA | ❌ | Sin a11y audit ejecutado (CURRENT_STATE §3.5 “NO VERIFICADO”). |
| R5 | Copy sin placeholders | ❓ | No se ejecutó verificación. |
| R7/R8 | Estados de carga / error accionable | ❓ | No renderizado. |

## 7. Revisión de negocio/producto (`business-review.spec.md` R1–R12)

> Checklist dedicado (firma `Executive Orchestrator — Phase 0 audit coordinator`, estado `CONDITIONAL`, reglas R5/R8/R9/R10/R12 `N/A` por falta de release, `EXTERNAL_SIGN-OFF_REQUIRED`): `docs/release/2026-08-11/business-review.md`.

| R | Requisito | Estado | Notas |
|---|---|---|---|
| R1 | Correspondencia 1:1 lógica/requisito | ❌ | `README.md`/`ROADMAP.md` afirman features (Stripe, RBAC granular, audit) inexistentes (TD-12, CL-2). |
| R2 | KPIs/regresión esperada | ❌ | No hay KPIs medidos. |
| R3 | `docs/risks.md` actualizado | ❌ | No existe archivo `docs/risks.md` formal; riesgos viven en `TECH_DEBT.md` y `SECURITY-AUDIT.md` §5. |
| R4 | Posición competitiva | ◐ | `MARKET-RESEARCH.md` existe; no actualizado en Phase 0. |
| R5 | Validación con stakeholders | N/A | No solicitado en Phase 0. |
| R6 | Coherencia contractual/tarifario | ❓ | No verificado. |
| R7 | Cumplimiento regulatorio sectorial | ❌ | GDPR/LGPD/CCPA sin DPIA/RoPA (S-13). |
| R11 | Coste unitario/margen | ❌ | Sin modelo de margen (vinculado a `cap-profitability` Phase 8). |

## 8. QA (`testing.spec.md` y `audit.spec.md`)

### 8.1 Verificación fresca ejecutada 2026-08-11 (dos corridas en el mismo checkout)

> **Aclaración post-reconciliación:** se observaron **dos corridas divergentes** en el mismo checkout — prueba empírica de que la suite es **flaky**. No se elige un solo número. Detalle en `CURRENT_STATE.md §2` y `TECH_DEBT.md` TD-15.

| Comando | Resultado real (corrida A: orquestador) | Resultado real (corrida B: cierre Phase 0) |
|---|---|---|
| `npm test` (`vitest run`) | **12 suites / 70 tests pasan**; **3 unhandled errors** por timeout `fetch ["/@vite/env","ssr"]`; salida global **no limpia**. | **15 suites / 113 tests pasan**, 0 fallos, 0 unhandled errors, duración *esta máquina* **42.84 s**; `auth-options.test.ts` ~7.89 s (7889 ms); ruido stderr Vite CJS (no es fallo). |
| `npm run lint` | Exit 0; 0 errores; **~33 warnings** `no-console` (TD-8). | Idéntico. |
| `npm run typecheck` | OK, sin output. | Idéntico. |
| `npm run build` | **Compila** (route table generado) pero **no se observó exit 0**: excedió 300000 ms antes del cierre; registra `DATABASE_URL not configured`, `Dynamic server usage`, `Get cases error`, `Get tasks error`, `Dashboard KPI error`. | No se re-ejecutó (build >300s no reproducible; evidencia de corrida A prevalece). |

> Cambio vs versión previa de §8.1: el dato "113 tests / 22.91 s / 0 unhandled" como **único** resultado estaba incompleto. La cifra 113 sólo se cita porque se ejecutó y confirmó en este checkout; la cifra 70 (con 3 unhandled por timeout `fetch ["/@vite/env","ssr"]`) **también se observó**. La salida global **no debe llamarse limpia**. El build **no se declara "exit 0 limpio"** — esa salida no se observó en corrida fresca (timeout operacional >300 s).

### 8.2 Trazabilidad de pruebas

- Categorías cubiertas por tests unitarios: auth (`tests/auth/*`, 15 archivos), pagos (`tests/payments/*`), DB/RLS (`tests/db/*`), leads/dashboard (`tests/leads/*`), chatbot (`tests/chatbot/*`).
- **No existe:** integration/E2E, performance/load, fuzzing/DAST, SAST, header/CSP test, red-team de prompt-injection.

### 8.3 Hallazgos QA

- El build emite errores esperados (sin DB en build). Marcar rutas como `export const dynamic = 'force-dynamic'` o documentar matriz de despliegue sería mitigación (TD-19 / ARCHITECTURE.md §2.5).
- `auth-options.test.ts` 5.78 s (5780 ms) en corrida fresca;.persistirá riesgo de *flaky* en CI lento (TD-15).

## 9. Limitaciones de esta revisión

1. **Auditoría estática de solo lectura.** No se ejecutó pentest, DAST, fuzzing ni red-team (no solicitado en el alcance Phase 0).
2. **Sin acceso a la aplicación viva.** No se renderizó UI ni se probó flujo end-to-end en browser. La condicional `02-analysis/application-analysis.spec.md` no aplica (no URL demo).
3. **Sin acceso al remoto GitHub.** `analysis-intake.md` declara que el remoto no se consultó con `GITHUB_TOKEN` (issues, releases, dependabot). La reconciliación del estado del código se basa en el checkout local.
4. **Línea-a-línea del README/ROADMAP.** No se hizo grep exhaustivo en el cierre Phase 0; se confía en la auditoría previa documentada en `TECH_DEBT.md` TD-12 y `CURRENT_STATE.md` §4.
5. **No se modificó código, tests ni configuración.** Los cambios están exclusivamente en documentación Markdown.
6. **La calidad de build** no se equipara a “production build limpio”: el exit 0 coexiste con errores esperados de generacion por ausencia de `DATABASE_URL`.

## 10. Reglas no aplicables en este Phase 0

| Regla (spec) | No aplica porque |
|---|---|
| `final-review.spec.md` R9 (perf/load test SLO) | No hay SLOs definidos en Phase 0; no procede validar p95. |
| `final-review.spec.md` R10 (rollback test) | No es release de producto; no existe deploy que rollbackear. |
| `final-review.spec.md` R11 (comunicación de release) | No existe release público en Phase 0. |
| `final-review.spec.md` R12 (UAT firmado) | Sin UAT; no se entrega funcionalidad nueva. |
| `final-review.spec.md` R13 (incidentes P1/P2) | Sin operación en producción que genere incidentes. |
| `code-review.spec.md` R4 (PR ≤400 líneas) | No se generan PRs de código. |
| `code-review.spec.md` R5 (cobertura no inferior a base) | No se añaden/borran tests. |
| `security-review.spec.md` R10 (pentest anual) | No aplica a auditoría de repositorio. |
| `ui-review.spec.md` R1–R12 | Sin staging ni Figma. |
| `business-review.spec.md` R5/R8/R12 | Sin stakeholders ni release a clientes. |

## 11. Riesgos abiertos (blockers de release — no de auditoría)

Se listan como **blockers** para cualquier release futuro. **No bloquean Phase 1**, pero bloquean *cualquier* paso hacia producción.

| Riesgo | Ref | Severidad | Owner (rol responsable) |
|---|---|---|---|
| CSRF declarado no cableado | S-1, TD-2 | P0 | security-engineer + full-stack-engineer |
| `addSecurityHeaders` muerto duplica `next.config` (confianza falsa) | S-2, TD-2 | P0 | full-stack-engineer |
| `logSecurityEvent` solo console.log, sin `audit_logs` | S-3, TD-3 | P0/P1 | full-stack-engineer |
| Registro frágil (auto-eleva `owner`, sin rate-limit/email-verify) | S-5, TD-6 | P1 | full-stack-engineer |
| `validateFileUpload` no cableado + solo `text/plain` parsing | S-4, TD-5 | P1 | full-stack-engineer |
| JWT 30d sin refresh/revocación ni re-check `isActive` | S-6, TD-9 | P1 | full-stack-engineer |
| Rate limit in-memory no distribuido (serverless multi-inst) | S-8, TD-7 | P2 | platform-engineer |
| `console.error/log` con stacks/PII sin sanitizar | S-9, TD-8 | P2 | full-stack-engineer |
| Knowledge base in-memory (no RLS del store) | S-12, TD-4 | P3 | full-stack-engineer + data-engineer |
| Sin DPIA/RoPA/consent/ARCO-PM/TIA | S-13 | P2 | privacy-officer |
| Tests solo unitarios; sin integration/E2E | TD-14 | P1 | full-stack-engineer + qa-engineer |
| Sin SAST/DAST/SBOM gate | S-11, TD-18 | P3 | devops-engineer |
| Contradicciones documentales CL-1..CL-4 (`IMPLEMENTATION_PLAN.md` Phase 0) | §CL | P2 doc | full-stack-engineer + product-manager |

> Owner `UNASSIGNED_PENDING_OWNER` se elimina: cada riesgo se asigna al rol responsable. La asignación de **persona humana concreta** queda como `EXTERNAL_SIGN-OFF_REQUIRED` en cada checklist (es un paso previo a cualquier release real, no a Phase 0).

## 12. Decisión final

**Resultado:** **CONDITIONAL_APPROVAL**

**Razón:** la auditoría fase Análisis completa su *objetivo* (inventario de capabilities, reconciliación de claims, matriz única, corrida fresca de calidad) y produce evidencia trazable. Sin embargo, persisten **blockers de release** (controles declarados no cableados, ausencia de pentest/SAST/DAST/observability/privacy/audit log) que impiden cualquier aprobación `APPROVED`/`PASS` conforme a `final-review.spec.md` R14/R15. Por tanto:

- **No se emite `APPROVED` / `PASS`** — equivaldría a unlock production deploy.
- **No se emite `REJECT`** — la auditoría cumple su propio scope y sus hallazgos están documentados con evidencia.
- **Se emite `CONDITIONAL_APPROVAL`** — Phase 0 cierra documentalmente y habilita Phase 1 *Stabilization* bajo las condiciones:
  1. Resolver CL-1..CL-4 (cleanup documental) en Phase 1.10.
  2. Atender los P0/P1 de `SECURITY-AUDIT.md` §5 (S-1/S-2/S-3/S-5) en Phase 1.1/1.2/1.8/1.9 y en `IMPLEMENTATION_PLAN.md` items 1.1–1.10.
  3. Activar gates SAST/SBOM (Phase 1.5), observability estructurada (Phase 1.8) y RoPA/DPIA draft (Phase 1.9).
  4. **No declarar production-ready** hasta reabrir esta final-review con un release real y firmar PASS.

**Firma técnica (no aprobación humana):** `Executive Orchestrator — Phase 0 audit coordinator` (coordinador técnico de la auditoría documental de Phase 0). Esta firma **no es** aprobación de producción y no sustituye la firma humana externa del rol `quality-reviewer` que la spec R14/R15 exige para `PASS`. Cada checklist subordinado lleva su propia firma técnica y `EXTERNAL_SIGN-OFF_REQUIRED` cuando aplica.

> **Resultado explícito:** `CONDITIONAL_APPROVAL` — **no** `PASS`, **no** `APPROVED`, **no** `REJECT`. Phase 0 cierra documentalmente y habilita Phase 1 *Stabilization*; **no** habilita production deploy.

> `specs/14-review/final-review.spec.md` R16 exige `docs/release/<version>-final-review.md`. Este archivo cumple R16. **No satisface R15 (`PASS`) — se documenta `CONDITIONAL_APPROVAL` explícito.** No es una aprobación de producción.

> **Estado del árbol git:** los cambios de Phase 0 están exclusivamente en Markdown y **no se commitearon** en esta sesión. La sesión **no recibió autorización explícita del usuario para `git commit`/`git push`**; por política de permisos los cambios quedan en el árbol de trabajo listos para review. **Esto no es un fallo de código** ni invalida la auditoría. `git diff --check` ⇒ limpio. Inventario completo en `docs/release/2026-08-11/artifact-manifest.md`.