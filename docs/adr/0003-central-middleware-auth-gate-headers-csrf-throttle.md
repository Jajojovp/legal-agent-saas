# ADR-0003: Middleware central — auth gate, headers, CSRF y throttle

- **Estado:** Propuesto
- **Fecha:** 2026-08-05
- **Contexto:** `middleware.ts:1-13` sólo corre `next-intl` y excluye `/api` del matcher. No existe gate central; omisiones de `requireAuth` (F1/F2/F3) son inevitables por diseño. `next.config.js:19-31` sólo setea 4 cabeceras (sin CSP/HSTS/Permissions-Policy). `validateCSRFToken` (lib/security/mediator.ts:61-68) nunca se invoca (F9 cabecera muerta). Hallazgos: F7, F8, F9, C6.
- **Decisión:** Convertir `middleware.ts` en puerta central combinada: (1) routing next-intl; (2) matcher que cubre `/api/(leads|cases|tasks|dashboard|ai|documents|payments)/*` salvo allowlist; (3) deny-by-default: 401 sin sesión salvo allowlist explícita — `/api/auth/*`, `/api/chatbot/message` (POST + throttle), `/api/payments/mp/webhook`, `/api/payments/*/webhook` (firma HMAC, sin sesión), `/api/health/*`; (4) cabeceras CSP estricta (sin `unsafe-eval`; `unsafe-inline` sólo si estrictamente necesario y auditado), HSTS `max-age=63072000; includeSubDomains; preload`, Permissions-Policy; (5) CSRF por `Origin`/`Sec-Fetch-Site` para mutaciones con cookie-session (ASVS 4.2); (6) throttle in-memory por IP+ruta (P0), Upstash/Redis en P1. Eliminar el código muerto `addSecurityHeaders`/`validateCSRFToken` o invocarlo desde middleware.
- **Alternativas consideradas:**
  - *Mantener `requireAuth` por handler.* Contras: demostrado falible (F2/F3 omitido). No respeta "secure by default" del spec seguridad.
  - *CSRF token sincronizado.* Contras: superficie/state extra; `Origin`/`Sec-Fetch-Site` suficiente ASVS L2; se prefiere minimizar superficie.
  - *CSP con `unsafe-inline`.* Contras: anulla anti-XSS; sólo admisible si no hay nonce. Si se requiere, pasar a nonce-hash strategy.
- **Consecuencias:**
  - Positivas: clase entera de "olvidé requireAuth" eliminada; headers verificables e2e; CSRF mitigado sin tokens.
  - Negativas: cuidado con rutas públicas legítimas (chatbot) en allowlist — negociación entre captación anónima e integridad.
  - Neutralizadas: throttle adaptativo; CSP report-only antes de enforce.
- **Módulos afectados:** `middleware.ts`, `next.config.js`, `lib/security/middleware.ts` (cablear/limpiar), tests headers e2e.
- **Riesgos:** CSP muy estricta rompe widgets/analytics → mitigación: CSP report-only en staging, ajustar allow-list frame/script antes de enforce. allowlist incompleta → mitigación: deny by default + revisión codeowner.
- **Reversión:** Volver a matcher sólo next-intl sin `/api`. Coste: bajo. Riesgo de reversión CRÍTICO (revive F8 y(surface para F1/F3/F4).
- **Ruptura de contrato:** Endpoints anónimos hoy libres (F1/F2/F3) ahora 401/403. Es la remediación. Front se adapta (no estaban documentados como públicos).
- **Specs:** architecture.spec R8, backend.spec R1/R5, owasp.spec R2/R6/R10, security.spec R1/R3.
