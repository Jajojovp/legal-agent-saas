# Code Review Checklist — Phase 0 (audit documental)

- **Versión de revisión:** 2026-08-11
- **Espec vinculante:** `specs/14-review/code-review.spec.md` R1–R13.
- **Puerta maestra:** `specs/14-review/final-review.spec.md` (R3 exige esta revisión completa).
- **Documento maestro:** `docs/release/2026-08-11-phase0-final-review.md` (sección 4).
- **Reviewer autoidentificado:** `Executive Orchestrator — Phase 0 audit coordinator` (rol técnico, no aprobación humana).
- **Alcance:** Phase 0 = **auditoría estática documental del checkout local**. Sin acceso a GitHub remoto (sin PRs, sin approvals, sin diff de integración). Corrida fresca de `npm test/lint/typecheck/build`.
- **Cambios en Phase 0:** exclusivamente Markdown. No se modificó código, tests ni configuración; por tanto **no se generan PRs de código** que requieran revisiones formales.
- **Estado global:** `CONDITIONAL` — ⚠ No es aprobación de producción. Si la spec exige firmas humanas externas (Quality Reviewer + ≥1 approval de PR), marca `EXTERNAL_SIGN-OFF_REQUIRED` al final.

---

## 1. Reglas aplicables y no aplicables en este Phase 0

| R | Regla (spec) | Aplica | Justificación |
|---|---|---|---|
| R1 | Cada PR revisa: funcionalidad, pruebas, estilo, seguridad, perf, legibilidad, manejo de errores | ✅ Aplica (evidencia por lectura) | No hay PRs; se revisa el checkout completo por lectura como evidencia. |
| R2 | Toda PR trae descripción, contexto, screenshots, test notes | ❌ No aplica | No se generan PRs. |
| R3 | Sin magic numbers ni constantes sin nombre | ✅ Aplica (lectura) | Hallazgos en `TECH_DEBT.md`. |
| R4 | PR ≤ 400 líneas diff | ❌ No aplica | No se generan PRs. |
| R5 | Toda nueva funcionalidad llega con test; no PR con cobertura inferior a base | ❌ No aplica | No se añade funcionalidad en Phase 0. Tests 113/113 en base. |
| R6 | Errores explícitos; no `catch (Exception) {}` | ✅ Aplica (lectura) | Audit en `SECURITY-AUDIT.md S-9`, `TECH_DEBT.md TD-8`. |
| R7 | Sin secretos en código; gestor de secrets | ✅ Aplica (lectura) | `.env.local` ignorado; placeholders en CI. |
| R8 | Linter 0 warnings | ✅ Aplica | Corrida fresca: `~33 warnings` `no-console` (TD-8). |
| R9 | Convenciones naming/patrones consistentes | ✅ Aplica (lectura) | Coherente salvo warnings `no-console`. |
| R10 | Resultados: Approve / Request Changes / Block | N/A en Phase 0 | No se emiten sobre código: no se generan PRs. Sólo evidencia. |
| R11 | Observaciones en GitHub diff con código concreto | ❌ No aplica | Sin acceso a remoto GitHub. |
| R12 | Toda PR ≥1 approval; críticos ≥2 | ❌ No aplica | No se generan PRs. |
| R13 | Toda conversación de review resuelta antes del merge | ❌ No aplica | No se generan PRs. |

---

## 2. Evidencia por regla aplicable

| R | Estado | Evidencia |
|---|---|---|
| R1 | ◐ | Lectura del checkout: tests 113/113 pasan (`CURRENT_STATE §2`); warnings `no-console` (TD-8); `console.error` con stacks/PII en rutas de pago y middleware (S-9). Patrones de naming consistentes; lógica tenant-scoped (`withTenantContext`) coherente. |
| R3 | ◐ | Algunos intervalos/umbrales hardcodeados (rate-limit bucket size, JWT `maxAge: 30d` literal en `auth-options.ts:99-102`); sin extracción a constantes. Cleanup en Phase 1. |
| R6 | ❌ | `console.error` con stacks/PII sin sanitizar (`lib/security/middleware.ts:293-298`, rutas de pago). Sin tipos de error (ADR-0008 no implementado). `catch (error)` no tipado en varios handlers. |
| R7 | ✅ | `.gitignore` ignora `.env.local`; `.env.local` presente en workspace pero no en repo (`git status` no lo lista). CI usa placeholders (`ci.yml`). Sin grep de tokens en código. TD-20: revisión pendiente con gitleaks/trufflehog. |
| R8 | ❌ | `npm run lint` exit 0 con **~33 warnings** `no-console` en `app/api/**`, `lib/ai/**`, `lib/db/**`, `lib/email/**`, `lib/security/middleware.ts:295` (TD-8). No bloquean merge actual pero no cumplen “0 warnings”. |
| R9 | ◐ | Estructura `app/api/*` + `lib/*` coherente; helpers puros en `lib/auth/*`/`lib/db/*`/`lib/payments/*`; `tests/*` espejan `lib/*`. Deuda: `lib/security/middleware.ts` mezcla helpers vivos y muertos (TD-2). |

---

## 3. Criterios de aceptación de la spec

| Criterio | Estado | Notas |
|---|---|---|
| 100% de PRs cumplen el checklist | `N/A` | No se generan PRs en Phase 0. |
| PRs críticos con ≥2 approvals | `N/A` | No se generan PRs. |
| 0 bloqueos por linter o secretos | ❌ | Linter: ~33 warnings (exit 0, no bloquean pero incumplen R8). Secretos: no detectados en código; revisión con gitleaks/trufflehog pendiente (TD-20). |

---

## 4. Riesgos abiertos (blockers para cualquier release futuro)

| Riesgo | Spec ref | Severidad | Owner rol | Criterio de cierre |
|---|---|---|---|---|
| Linter 0 warnings | R8, TD-8 | P2 | full-stack-engineer | `npm run lint` exit 0 con 0 warnings; logger estructurado reemplaza `console.*`. |
| Errores no tipados / `console.error` con PII | R6, S-9 | P1 | full-stack-engineer | Tipos de error (ADR-0008); logger sanitiza PII/stacks en prod. |
| Sin secret scanning automatizado | R7, TD-20 | P2 | security-engineer | gitleaks/trufflehog en CI; 0 secretos sin rotation. |

**Criterio de cierre del checklist:** 0 warnings de linter; errores tipados y sanitizados; secret scanning gate activo; firma humana externa del `quality-reviewer` registrada para cada PR futuro.

---

## 5. Firma

- **Reviewer:** `Executive Orchestrator — Phase 0 audit coordinator`
- **Resultado:** `CONDITIONAL`
- **Declaración:** Esta firma **no** es aprobación de producción. Constituye evidencia documental de revisión de código del checkout. No se emiten `Approve/Request Changes/Block` sobre PRs porque no se generan PRs en Phase 0. Cualquier cambio futuro a código dependerá de PRs de Phase 1 con revisiones firmadas. La spec exige aprobación humana externa → `EXTERNAL_SIGN-OFF_REQUIRED`.
- **Externos pendentes:** `quality-reviewer` (firma humana externa), `full-stack-engineer` (autor del PR futuro).
- **Fecha:** 2026-08-11