# Security Review Checklist — Phase 0 (audit documental)

- **Versión de revisión:** 2026-08-11
- **Espec vinculante:** `specs/14-review/security-review.spec.md` R1–R12.
- **Puerta maestra:** `specs/14-review/final-review.spec.md` (R5 exige esta revisión firmada).
- **Documento maestro:** `docs/release/2026-08-11-phase0-final-review.md` (sección 5).
- **Reviewer autoidentificado:** `Executive Orchestrator — Phase 0 audit coordinator` (rol técnico, no aprobación humana).
- **Alcance:** Phase 0 = **auditoría estática documental del checkout local**. No se ejecutaron herramientas dinámicas (SAST, DAST, pentest) — la spec las exige (R1, R2, R10), pero el alcance Phase 0 las deja abiertas para Phase 1/1.5.
- **Cambios en Phase 0:** exclusivamente Markdown (`SECURITY-AUDIT.md` re-escrito; sin cambios en código/config).
- **Estado global:** `CONDITIONAL` — ⚠ No es aprobación de producción. La spec exige firma humana externa del `security-engineer` + Quality Reviewer → `EXTERNAL_SIGN-OFF_REQUIRED`.

---

## 1. Reglas aplicables y no aplicables en este Phase 0

| R | Regla (spec) | Aplica | Justificación |
|---|---|---|---|
| R1 | SAST ≥Medium resuelto | ✅ Aplica | No se ejecutó; open en Phase 1.5. |
| R2 | DAST OWASP ZAP staging ≥Medium | ❌ No aplica en Phase 0 | Sin staging URL. |
| R3 | Secret scanning 0 secretos sin rotation | ✅ Aplica (lectura) | `.gitignore` correcto; gitleaks/trufflehog pendiente (TD-20). |
| R4 | IAM least privilege | ✅ Aplica (lectura) | `firmId` del contexto; RLS por `firm_id`; sin `permissions` table. |
| R5 | TLS 1.2+ tránsito/reposo | ✅ Aplica (lectura) | TLS Postgres configurable; at-rest depende de Supabase. |
| R6 | OWASP Top 10 2021 con evidencia | ✅ Aplica | `SECURITY-AUDIT.md §1` mapea A01..A09. |
| R7 | Threat model STRIDE actualizado | ✅ Aplica (lectura) | Sin STRIDE formal. |
| R8 | Headers de seguridad | ✅ Aplica | `next.config.js:22-55`. |
| R9 | Password + MFA NIST 800-63B | ✅ Aplica (lectura) | Sin MFA; password policy no enforced en API. |
| R10 | Pentest anual | ❌ No aplica a auditoría de repo | No existe pentest. |
| R11 | Logs sin PII/secretos | ✅ Aplica (lectura) | `console.error` con stacks (S-9). |
| R12 | Cumplimiento GDPR/PCI/CCPA | ✅ Aplica (lectura) | Privacy matrix Open (S-13). |

---

## 2. Evidencia por regla

| R | Estado | Evidencia |
|---|---|---|
| R1 | ❌ | No se ejecutó Semgrep/CodeQL. Open en Phase 1.5 (`cap-build-ci` SAST/SBOM gate). `IMPLEMENTATION_PLAN item 1.5`. |
| R2 | ❌ | Sin staging URL. |
| R3 | ◐ | `.gitignore` ignora `.env.local` correctamente; `.env.local` no en repo (`git status` no lo lista como untracked relevant). Sin gitleaks/trufflehog ejecutado. TD-20. |
| R4 | ◐ | `firmId` del JWT (no body) — `resolveFirmId` ignora body (`lib/auth/authorization.ts:51`, testeado). RLS fail-closed por `firm_id`. Sin tabla `permissions` ni checks `matter.read` etc. (TD-10). |
| R5 | ◐ | TLS Postgres configurable (S-7); at-rest depende de Supabase (no verificado). TLS aplicativo vía hosting (Vercel) presumido pero no auditado. |
| R6 | ✅ parcial | `SECURITY-AUDIT.md §1` mapea OWASP A01..A09 con evidencia por hallazgo; A03 Injection sin fuzzing; A05 CSRF declarado no cableado (S-1); A07 audit log stub (S-3); A09 logs con PII (S-9). |
| R7 | ❌ | Sin STRIDE formal; mapeo OWASP Top 10 aproxima pero no sustituye. |
| R8 | ✅ | `next.config.js:22-55` cablea CSP/HSTS/X-Frame-Options/X-Content-Type-Options/Referrer-Policy/Permissions-Policy/COOP. Sin test de cabeceras. |
| R9 | ❌ | Sin MFA (S-5, `cap-mfa-sso` NEW). Password policy: `registerSchema` existe pero la ruta no aplica password strength enforced ni rate-limit ni email verification (TD-6). |
| R10 | ❌ | No existe pentest. No es Phase 0; open permanente. |
| R11 | ❌ | `console.error` con stacks/PII en `lib/security/middleware.ts:293-298` y handlers de pago (`SECURITY-AUDIT.md §1 S-9`, TD-8). |
| R12 | ❌ | Sin DPIA/RoPA/consent/ARCO-PM/TIA (S-13). PCI: no procesa tarjetas (sólo MP/Takenos). GDPR/CCPA: identificado, no implementado. |

---

## 3. Criterios de aceptación de la spec

| Criterio | Estado | Notas |
|---|---|---|
| SAST/DAST sin hallazgos ≥Medium | ❌ | No ejecutados. |
| Threat model actualizado y revisado | ❌ | Sin STRIDE formal. |
| Pentest anual con remediación cerrada | ❌ | No existe. |

---

## 4. Riesgos abiertos (blockers para cualquier release futuro)

Se alinean con `SECURITY-AUDIT.md §1` (hallazgos S-1..S-14) y `TECH_DEBT.md`. Detalle completo en `docs/release/2026-08-11-phase0-final-review.md §11`.

| Riesgo | spec ref | Severidad | Owner rol | Criterio de cierre |
|---|---|---|---|---|
| CSRF declarado no cableado | S-1, R6/R8, TD-2 | P0 | security-engineer + full-stack-engineer | Decisión ADR-0003 (cablear tests o documentar SameSite+JSON suficiente). Phase 1.1/1.2. |
| `addSecurityHeaders` muerto duplica `next.config` | S-2, TD-2 | P0 | full-stack-engineer | Eliminar o cablear; grep sin callers huérfanos. Phase 1.1. |
| Audit log solo `console.log`, sin `audit_logs` | S-3, TD-3 | P0/P1 | full-stack-engineer | Tabla `audit_logs` + writer persistente + test. Phase 2.7. |
| Registro frágil (auto-eleva `owner`) | S-5, TD-6 | P1 | full-stack-engineer | Rate-limit por IP, email verification, separar creación de owner. Phase 1.x. |
| `validateFileUpload` no cableado + parsing solo text/plain | S-4, TD-5 | P1 | full-stack-engineer | Cablear + storage + MIME/magic-byte. Phase 2.4/2.5. |
| JWT 30d sin refresh/revocación | S-6, TD-9 | P1 | full-stack-engineer | Short-lived access + refresh; re-check `isActive`. Phase 1.x. |
| Rate-limit in-memory no distribuido | S-8, TD-7 | P2 | platform-engineer | Redis/Upstash; test multi-instancia. Phase 1.7. |
| `console.*` con stacks/PII sin sanitizar | S-9, TD-8 | P2 | full-stack-engineer | Logger estructurado + sanitización + Sentry. Phase 1.8. |
| Sin SAST/SBOM gate | S-11, TD-18, R1 | P3 | devops-engineer | Semgrep/CodeQL + npm audit high/critical gate + SBOM. Phase 1.5. |
| Sin DPIA/RoPA/consent/ARCO-PM/TIA | S-13, R12 | P2 | privacy-officer | RoPA draft + DPIA checklist + consent capture. Phase 1.9. |
| Sin STRIDE formal | R7 | P2 | security-engineer | Threat model STRIDE actualizado en `docs/seguridad/`. |
| Sin secret scanning gate | R3, TD-20 | P2 | security-engineer | gitleaks/trufflehog en CI; 0 secretos sin rotation. |

**Criterio de cierre del checklist:** SAST/DAST ejecutados sin hallazgos ≥Medium; STRIDE actualizado; pentest anual con remediación cerrada; todos los S-* P0/P1 resueltos con tests; firma humana externa del `security-engineer` + Quality Reviewer registrada.

---

## 5. Firma

- **Reviewer:** `Executive Orchestrator — Phase 0 audit coordinator`
- **Resultado:** `CONDITIONAL`
- **Declaración:** Esta firma **no** constituye aprobación de producción. Es evidencia documental de revisión de seguridad estática del checkout. La spec exige ejecución de SAST/DAST/pentest y firma humana externa del rol `security-engineer` + Quality Reviewer → `EXTERNAL_SIGN-OFF_REQUIRED`.
- **Externos pendentes:** `security-engineer` (firma humana externa), `quality-reviewer` (firma humana externa).
- **Fecha:** 2026-08-11