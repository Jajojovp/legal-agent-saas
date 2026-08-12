# TECH_DEBT — Deuda técnica y calidad

- **Auditoría:** 2026-08-11
- **Convención:** severidad `CRÍTICA`/`ALTA`/`MEDIA`/`BAJA`/`INFO`. Cada item incluye **Evidencia**, **Impacto**, **Remediación sugerida** y **Criterio de cierre**.
- **No se implementa solución aquí** — solo se documenta.

---

## CRÍTICAS

### TD-1 — `SECURITY-AUDIT.md` raíz con claims obsoletas (riesgo de confianza falsa)
- **Evidencia histórica:** el archivo `SECURITY-AUDIT.md` v3.0 con fecha **2024-04-22** afirmaba “Production Ready 92/100”, “Auth 0/100”, “CSRF 100%”, “File Upload 100%”. Las referencias a líneas concretas (`:14,360,632,670,895`) son **históricas/superseded**: ese archivo fue reemplazado en el trabajo del 2026-08-11 por el nuevo `SECURITY-AUDIT.md` (131 líneas) — las líneas antiguas ya no existen en el checkout actual; el histórico v3.0 está referenciado y reconciliado en `SECURITY-AUDIT.md` §6.1 con marca **SUPERSEDED**.
- **Estado:** **Cerrado como doc** (el archivo v3.0 fue reescrito). Reabriría si reaparece contenido v3.0 sin la marca SUPERSEDED.
- **Tarea de cleanup pendiente:** mover la copia íntegra de v3.0 a `docs/audit/SECURITY-AUDIT-v3.0-archived.md` con cabecera SUPERSEDED (acción de housekeeping listada en `IMPLEMENTATION_PLAN.md` Phase 1.10). Hoy sólo la reconciliación §6.1 vive en el archivo nuevo — el contenido íntegro del v3.0 no está archivado.
- **Impacto (si se ignora):** decision-makers confían en controles inexistentes; bloquea priorización real de S-1/S-3/S-5.
- **Criterio de cierre:** el `SECURITY-AUDIT.md` raíz actual (este checkout) ya no contiene claims v3.0 no respaldados; el archivo v3.0 archivado con cabecera SUPERSEDED; el claim “ya hecho” se respalda con grep de “92/100” → 0 hits en el `SECURITY-AUDIT.md` raíz actual.

### TD-2 — Controles de seguridad declarados pero no cableados
- **Evidencia:** `validateCSRFToken` (`lib/security/middleware.ts:61`), `addSecurityHeaders` (`:161`), `logSecurityEvent` (`:293`), `validateFileUpload` (`:240`) — 0 callers fuera de su propio archivo (grep).
- **Impacto:** defensa ilusoria; el lector del código cree que hay CSRF/audit/upload protection cuando no los hay.
- **Remediación sugerida:** cablear o eliminar con documentación explícita del control efectivo (headers ya en next.config; CSRF vía SameSite+API JSON; audit vía tabla nueva).
- **Criterio de cierre:** cada stub tiene tests o un comentario `// Not wired: handled by X` con referencia; o se elimina.

## ALTAS

### TD-3 — Audit log inexistente / `logSecurityEvent` solo console.log
- **Evidencia:** `lib/security/middleware.ts:293-298`; `schema.ts` sin `audit_logs`.
- **Impacto:** sin trazabilidad who/what/when/where/why/result (visión §53/§54). Imposible cumplir compliance y forense.
- **Remediación sugerida:** añadir tabla `audit_logs` + `ai_usage`/`agent_runs` (visión §79); writer persistente invocado desde rutas mutativas y runs de IA.
- **Criterio de cierre:** eventos de seguridad y AI persisted en DB; test de que un evento queda registrado.

### TD-4 — Knowledge base en memoria
- **Evidencia:** `lib/ai/knowledge-base.ts:14` `const knowledgeStore: Map<string, KnowledgeDoc[]>`.
- **Impacto:** se pierde al reiniciar; no escala; aislamiento por tenant solo por `firmId` key (no RLS); arruina la base de RAG.
- **Remediación sugerida:** trasladar a Postgres (`knowledge_bases`/`knowledge_items`) + pgvector cuando se construya RAG (capability `cap-rag`/`cap-kb`).
- **Criterio de cierre:** el `Map` se elimina; `queryWithContext` lee de DB con `firm_id` scope.

### TD-5 — Document parsing solo text/plain
- **Evidencia:** `lib/ai/document-service.ts:79-84` `extractTextFromFile` solo soporta `text/plain` (dos ramas idénticas).
- **Impacto:** el “Document Analysis” del README no funciona con PDF/DOCX reales; `validateFileUpload` documentado como 100% (TD-1) pero no hay storage.
- **Remediación sugerida:** introducir object storage + OCR via background job (capabilities `cap-storage`, `cap-doc-intel`).
- **Criterio de cierre:** soporta PDF/DOCX vía pipeline upload→scan→OCR→index; tests de los formatos.

### TD-6 — Registro frágil (auto-elevación + sin rate-limit + sin verificación)
- **Evidencia:** `app/api/auth/register/route.ts:38-46` crea `role='owner'`; sin `rateLimit`; sin email verification; `registerSchema` presente pero sin password policy enforced visible en ruta.
- **Impacto:** abuso de creación de firms, cuentas sin verificar, escalada implícita.
- **Remediación sugerida:** rate-limit por IP, email verification con token, separar creación de usuario de la asignación de `owner`, no crear firma sin confirmación.
- **Criterio de cierre:** test de enumeración de email, test de rate-limit, test de que sin verificar no se obtiene `AuthContext` válido.

### TD-7 — Rate limiting in-memory no distribuido
- **Evidencia:** `lib/security/middleware.ts:4`, `app/api/chatbot/message/route.ts:22-39`, dos `Map` por endpoint.
- **Impacto:** en serverless multi-instancia el límite pierde efectividad; memoria no persistida entre cold starts.
- **Remediación sugerida:** backend distribuido (Redis/Upstash) en P1; mantener in-memory sólo para dev local.
- **Criterio de cierre:** rate limit compartido entre instancias (test de dos “instancias” compartiendo contador).

### TD-8 — Sin observabilidad estructurada
- **Evidencia:** ~33 warnings `no-console` en `app/api/**`, `lib/ai/**`, `lib/db/**`, `lib/email/**`, `lib/security/middleware.ts:295`.
- **Impacto:** no hay métricas RED/USE, traces ni alertas accionables; diagnosis en producción anecdótica.
- **Remediación sugerida:** introducir logger estructurado (pino/结构性), Sentry, métricas básicas; reducir `console.*`.
- **Criterio de cierre:** 0 `console.*` en production runtime; alerta por error rate > SLO.

## MEDIAS

### TD-15b — Cases/Tasks API sólo GET (no escritura)
- **Evidencia:** `app/api/cases/route.ts` y `app/api/tasks/route.ts` exportan **solo** `export async function GET()` (línea 7 en ambos, 26 líneas cada uno). No hay POST/PATCH/PUT/DELETE ni rutas de detalle (`/api/cases/:id`, `/api/cases/:id/tasks`, etc.). Verificado por `grep 'export async function (GET|POST|PATCH|PUT|DELETE)' app/api/**` (16 matches: 0 POST/PATCH en cases, 0 POST/PATCH en tasks). La versión previa de `CURRENT_STATE.md` y `FEATURE_MATRIX.md` afirmaba "Cases API GET/POST" — **falso**; reconciliado en esta corrida.
- **Impacto:** dashboard cases/tasks no pueden crear/editar vía API; casos/tareas sólo listables; requisitos de "Matters CRUD" incompletos.
- **Remediación sugerida:** implementar POST (create matter/task con `firmId` del contexto), PATCH (update con ownership check estilo `canModifyLead`), y rutas de detalle (`/api/cases/:id`). Añadir tests de integración.
- **Criterio de cierre:** casos se crean/editan vía API con tenant scoping; tests de integration cubren el flujo.

### TD-15c — `lib/db/migrate.ts` es un stub (sin migraciones reales aplicadas por código)
- **Evidencia:** `lib/db/migrate.ts` son **16 líneas** que sólo hacen `console.log('Running migrations...')` y `console.log('Migration complete')`. Las migraciones reales viven en `lib/db/migrations/*.sql` y se aplican vía `drizzle-kit migrate` (script npm). El comentario in-code reconoce: "In production, use drizzle-kit migrate instead of push".
- **Impacto:** doc/README pueden inducir a creer que `migrate.ts` aplica el schema; en realidad es no-op.
- **Remediación sugerida:** o bien implementar `migrate()` que aplique `lib/db/migrations/*.sql` vía `sql.raw()`, o eliminar el archivo y documentar que el flujo real es `npm run db:migrate`.
- **Criterio de cierre:** el flujo de migración documentado coincide con el código operativo.

### TD-15d — Cifras anteriormente reportadas como "14 tablas" no coinciden con el schema
- **Evidencia:** versiones previas de `CURRENT_STATE.md` afirmaban "schema.ts (345 líneas, **14 tablas**)". Recount verificado: **17 tablas** (4 auth: users, accounts, sessions, verificationTokens + 13 negocio: lawFirms, subscriptions, subscriptionCheckoutAttempts, paymentEvents, leads, cases, tasks, documents, timeEntries, invoices, chatConversations, kpiMetrics, emailCampaigns). Reconciliado en §3.3.
- **Impacto:** menor; induce expectativa errada del modelo de datos.
- **Remediación sugerida:** mantener la cifra 17 en docs; revisar ADR-0005 si menciona 14.
- **Criterio de cierre:** todas las docs citan 17 tablas.

### TD-9 — JWT 30d sin refresh/revocación
- **Evidencia:** `auth-options.ts:99-102` `maxAge: 30 * 24 * 60 * 60`. Callbacks jwt/session no re-validan `isActive`.
- **Impacto:** revocación en caliente imposible; cuenta deshabilitada sigue activa hasta expirar JWT.
- **Remediación sugerida:** short-lived access + refresh; re-fetch periódico del usuario en `jwt`.
- **Criterio de cierre:** test que un usuario `isActive=false` pierde acceso < 5 min tras el cambio.

### TD-10 — RBAC de string, sin permisos granulares
- **Evidencia:** `lib/auth/authorization.ts:13` `ELEVATED_ROLES = owner|admin`; `users.role text`; sin tabla `permissions`.
- **Impacto:** no soporta `matter.read`, `document.share`, `ai.execute` (visión §52); no escala a enterprise.
- **Remediación sugerida:** introducir tablas `permissions`/`role_permissions` y checks centralizados.
- **Criterio de cierre:** un test lista todos los checks de permiso por endpoint.

### TD-11 — Facturación: schema sin API
- **Evidencia:** `schema.ts:265-294` `time_entries`/`invoices` sin routes correspondientes.
- **Impacto:** el dashboard de billing no puede operar; el README promete facturación.
- **Remediación sugerida:** crear `app/api/billing/*` (time entries CRUD, invoice generate/list).
- **Criterio de cierre:** rutas cubiertas por tests de integración.

### TD-12 — Claims de productos no presentes en docs
- **Evidencia:** `README.md:307-336` (Stripe, Clio, Calendly, HIPAA-ready, RBAC, audit logs); `ROADMAP.md`; `STRIPE-SETUP.md`. Las referencias `README.md:307-336` son ** históricas y no verificadas en esta corrida** (no se hizo grep línea-a-línea en el cierre Phase 0); la afirmación cualitativa “el README afirma Stripe/Clio/HIPAA-ready/RBAC/audit logs” sí se mantiene — ver `CURRENT_STATE.md` §4 línea "obsoleto/contradictorio" y `docs/audit/findings-tracker.csv`.
- **Impacto:** especificación divergente del producto real; comerciales afirman integraciones inexistentes.
- **Remediación sugerida:** marcar como “Planned/not implemented” en README/ROADMAP; mover `STRIPE-SETUP.md` a `docs/archive/`; reconciliar línea-a-línea los claims del README.
- **Criterio de cierre:** ninguna doc afirma implementar lo que no está en `FEATURE_MATRIX.md` como EXISTE/FUNCIONAL; en esta Phase 0 la reconciliación se hace por capability (matrices), no por línea del README — cleanup de README queda pendiente en `IMPLEMENTATION_PLAN.md` Phase 1.10.

### TD-13 — `@next/swc-win32-x64-msvc` como dependencia directa
- **Evidencia:** `package.json:24`.
- **Impacto:** binario específico de plataforma en `dependencies`; puede romper installs en Linux/Mac y CI.
- **Remediación sugerida:** mover a `optionalDependencies` o eliminar (Next lo maneja solo).
- **Criterio de cierre:** `npm ci` en Linux sin error por este paquete.

### TD-14 — Tests solo unitarios de helpers
- **Evidencia:** 15 archivos/tests son 113 tests de helpers puros (`tests/auth/*`, `tests/db/*`, `tests/payments/*` de contracts/service, `tests/leads/dashboard`). Sin integration/E2E de route handlers.
- **Impacto:** cableado (auth → tenant → route) no provado; regresiones silenciosas.
- **Remediación sugerida:** integration con fake/real PG (supabase local) + E2E Playwright.
- **Criterio de cierre:** pipeline corre integration+E2E; coverage reported.

### TD-15 — Suite flaky (latencias erráticas + unhandled timeout `fetch ["/@vite/env","ssr"]`)
- **Evidencia fresca (auditoría 2026-08-11, dos corridas en el mismo checkout):**
  - **Corrida A (orquestador, fresca):** `npm test` → **12 suites / 70 tests pasan**; Vitest reporta **3 unhandled errors** por timeout `fetch ["/@vite/env","ssr"]`; **salida global no limpia**.
  - **Corrida B (cierre Phase 0, fresca):** `npm test -- --reporter=dot --testTimeout=30000` → **15 suites / 113 tests pasan**, 0 fallos, 0 unhandled errors, duración *esta máquina* **42.84 s**; `auth-options.test.ts` ~7.89 s (7889 ms); ruido stderr Vite CJS deprecation (no es fallo).
  - **La divergencia es el hallazgo:** la suite es flaky. No se afirma "estable" ni se elige un sólo número. La cifra 113 sólo se cita porque se ejecutó y confirmó en este checkout; la cifra 70 también se observó.
- **Patrón raíz hipotetizado:** cold-start del adapter NextAuth (`getAuthOptions` re-construye)、timeout de `fetch ["/@vite/env","ssr"]` por `vitest.config.ts` con `environment: 'node'` sin configurar SSR (15 líneas,sinalias de `vite/env`); en máquinas lentas o bajo carga CI el timeout cascading puede colgar suites enteras (de 15 → 12 suites).
- **Impacto:** alimenta reports de timeout/inconsistencia; hace flaky CI en máquinas lentas; **la salida global no debe llamarse limpia**.
- **Remediación sugerida:** aislar el coste de construcción del adapter (memoización ya existe en `getAuthOptions`); revisar `vitest.config.ts` para suprimir el fetch `vite/env` (alias o `server.deps.fallbackTypeModuleCjs: true`); revisar sleeps/esperas; fijar timeouts por test; suprimir el aviso CJS de Vite (ver TD-19). Añadir integration tests con fake DB para reducir dependencia de helpers puros (TD-14).
- **Criterio de cierre:** `npm test` produce **15 suites / 113 tests / 0 unhandled errors** en 5 corridas consecutivas en la misma máquina + CI; salida global sin errores stderr relevantes; no se observan ya caídas a 70 tests.

## BAJAS

### TD-16 — `sanitizeInput`/`sanitizeHTML` con uso parcial no verificado
- **Evidencia:** `lib/security/middleware.ts:73-104`.
- **Impacto:** doble capa (Drizzle ya prepara); si no se usa, es ruido.
- **Remediación sugerida:** auditar uso; documentar o eliminar.
- **Criterio de cierre:** grep muestra uso justificado o se remueve.

### TD-17 — `supabase-init.sql` placeholder
- **Evidencia:** `lib/db/supabase-init.sql` (12 líneas, sólo comentarios + `uuid-ossp`).
- **Impacto:** la RLS real depende de `migrations/rls_multitenant_up.sql` (correcto) pero el init.sql induce a pensar que falta.
- **Remediación sugerida:** aclarar que es bootstrap; referenciar explícitamente a `migrations/`.
- **Criterio de cierre:** init.sql documenta el flujo exacto sin ambigüedad.

### TD-18 — Dependencias con rangos sueltos y sin SBOM
- **Evidencia:** `package.json:21-45` (`^`); `ci.yml:80` `continue-on-error`.
- **Impacto:** deriva de versión; sin supply-chain gate.
- **Remediación sugerida:** pin o `renovate`; activar `npm audit` como gate para high/critical; SBOM.
- **Criterio de cierre:** CI bloquea merge en vulnerabilidades high/critical conocidas.

### TD-19 — Ruido stderr en PowerShell (Vite CJS deprecation)
- **Evidencia:** la salida de `vitest` imprime `RemoteException`/vivo-warnings a stderr por el aviso CJS de Vite.
- **Impacto:** se interpreta como fallo en CI; agrega riesgo de timeout.
- **Remediación sugerida:** suprimir el warning (`server.deps.fallbackTypeModuleCjs` o upgrade Vite) y/o parsear sólo stdout en CI.
- **Criterio de cierre:** CI reporta verde sin ruido de stderr.

## INFO

### TD-20 — `analysis-intake.md` modificado en worktree
- **Evidencia:** `git status` muestra `analysis-intake.md` modificado (94+/146-), no commiteado.
- **Impacto:** ninguno funcional; solo housekeeping.
- **Remediación sugerida:** commit o descartar el cambio al cerrar el intake.
- **Criterio de cierre:** árbol limpio o el cambio se revisa y se commitea.