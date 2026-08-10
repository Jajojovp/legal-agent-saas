# ADR-0001: Auth Context completo (firmId/role) propagado en sesión

- **Estado:** Propuesto
- **Fecha:** 2026-08-05
- **Contexto:** `app/api/auth/[...nextauth]/auth-options.ts:56-69` sólo inyecta `id` (token.sub) en `session.user`; `lib/auth/session.ts:8-19` devuelve `{userId}`. El schema `users` define `firmId`, `role`, `isActive` (lib/db/schema.ts:46-62) pero no se propagan. Auditoría F5: ningún handler puede hacer cumplir aislamiento aunque quiera. Hallazgos dependientes: F1, F3, F4 (IDOR).
- **Decisión:** Propagar `firmId`, `role`, `isActive` en callbacks `jwt`/`session`. `requireAuth()` devuelve `AuthContext = { userId, firmId, role, isActive, session }` y rechaza `isActive=false`. Añadir `requireRole(...roles)` para RBAC (owner/admin). El `role` por defecto en registro pasa de `'owner'` a `'attorney'` (least privilege, F15); el ascenso a owner se hace con un flow `claim-ownership` (P1).
- **Alternativas consideradas:**
  - *Lookup por userId en cada handler.* Contras: N+1 queries,梱 inconsistencias de caching, no respeta backend.spec R1 (stateless por sesión). Mejor enriquecer el JWT en emisión.
  - *Cookie separada de contexto.* Contra: mayor superficie XSS/CSRF; duplicación de verdad de sesión.
  - *Middleware enriqueciendo request.headers.* Contra: restringe a rutas que pasan por middleware; Auth gestionado propiamente por NextAuth.
- **Consecuencias:**
  - Positivas: una sola fuente de verdad (JWT); cualquier handler obtiene `firmId`/`role` sin lookup; permite RBAC.
  - Negativas: JWT crece ~30 bytes; hay que compactar claims (`fid`,`rl`) si cookie-size excede límite.
  - Neutralizadas: rotación de secreto invalida sesiones (ventana de riesgo controlada).
- **Módulos afectados:** `app/api/auth/[...nextauth]/auth-options.ts`, `lib/auth/session.ts`, todos los handlers `app/api/**`, `middleware.ts` (gate), tests.
- **Riesgos:** JWT supera cookie-size → mitigación compact claims + DB lookup fallback. El cambio de rol por defecto puede romper seed/demo → mitigación: seed fija rol explícito; nuevo flow claim-ownership en P1.
- **Reversión:** Reponer callbacks a sólo `id` y `requireAuth` a `{userId}`. Coste: bajo (<1h), pero deja reabiertas F1/F3/F4/F5. Ruta: `git revert` de los dos archivos + `session.ts`. Riesgo de reversión ALTO (revive IDOR).
- **Ruptura de contrato:** Interna (firma de `requireAuth`). Sin impacto HTTP externo. Los handlers que consumían `userId` siguen compilando si desestructuran (`{userId}`); estricto TS los empuja a migrar a `{firmId, ...}`.
- **Specs:** architecture.spec R3/R5/R8, backend.spec R1, owasp.spec R2/R8, security.spec R3.
