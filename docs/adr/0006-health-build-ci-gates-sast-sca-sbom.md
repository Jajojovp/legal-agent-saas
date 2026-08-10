# ADR-0006: Health, build y CI gates (SAST/SCA/SBOM + gates arquitectónicos)

- **Estado:** Propuesto
- **Fecha:** 2026-08-05
- **Contexto:** No existe `.github/workflows/` ni inventario de tests (intake ID-GAP-002, RISK-003). No hay `npm audit` ni SAST en pipeline. `next build` no incluye `output: 'standalone'` (plan A8). No `/health/*`. F13: `SECURITY-AUDIT.md` miente controles inexistentes. security.spec R6/R7/R9 y owasp.spec R7 violados.
- **Decisión:**
  1. **Health (backend.spec R8):** `/api/health/live` -> 200 si proceso responde; `/api/health/ready` -> 200 si `SELECT 1` con timeout corto, 503 si Postgres caído. Monitor usa ready.
  2. **CI workflow** `.github/workflows/ci.yml` (paralelo):
     - `tsc --noEmit` + ESLint Next core-web-vitals + rules custom.
     - `npm audit --omit=dev` — bloquea críticos/altos (ventana owasp.spec R13: CRIT 7d).
     - SAST: CodeQL o `semgrep --config p/owasp` — bloquea CRIT/HIGH.
     - SBOM CycloneDX (`npm sbom --sbom-format cyclone_DX`) — artifact por release (security.spec R7).
     - `next build` con `output: 'standalone'`.
     - **Gates arquitectónicos (auditar como código):**
       - `rg -n "rejectUnauthorized:\s*false" lib/` → 0 hits.
       - `rg -n "addSecurityHeaders|validateCSRFToken" app middleware.ts next.config.js` → uso real (no definición muerta) o ausencia.
       - `rg -n "(body|searchParams)\.firmId|req\.body\.firmId" app/api/` → 0 hits salvo tests intencionales.
       - e2e header `Content-Security-Policy` presente.
       - Tests IDOR (ADR-0002) en verde.
  3. **Marcado de `SECURITY-AUDIT.md`:** añadir cabecera `SUPERSEDED by docs/seguridad/2026-08-05-...md` (no eliminar, mantener histórico). Implementación: en P1, no P0.
- **Alternativas consideradas:**
  - *Gates manuales en PR review.* Contras: falible, no reproduce.
  - *Sólo `npm audit` sin SAST.* Contras: deja injection/no-hardcode fuera.
  - *Build sin standalone.* Contras: Docker roto (A8); imagen enorme.
- **Consecuencias:**
  - Positivas: calidad trazable; ADRs se convierten en código ejecutable; previene regresiones 结构urales (rls, headers, IDOR).
  - Negativas: tiempo de pipeline aumenta ~3-5 min; algún falso positivo en SAST.
  - Neutralizadas: tune de reglas; cache de dependencias.
- **Módulos afectados:** `.github/workflows/ci.yml` (nuevo), `next.config.js` (standalone), `app/api/health/*/route.ts` (nuevo), `package.json` (test scripts), `SECURITY-AUDIT.md` (cabecera SUPERSEDED).
- **Riesgos:** SAST false positives bloquean PR → mitigación: baseline + allowlist comentado. Pipeline lento → mitigación: paralelizar jobs + cache. Gates custom frágiles →mitigación: tests idempotentes, scripts versionados.
- **Reversión:** Eliminar workflow y `/health/*`. Coste: bajo. Riesgo de reversión ALTO (revive RISK-003 y pierde enforcement).
- **Ruptura de contrato:** Ninguna externa. `/health/live` y `/health/ready` son aditivos.
- **Specs:** backend.spec R7/R8, security.spec R6/R7/R9, owasp.spec R6/R7/R9/R13, architecture.spec R7.
