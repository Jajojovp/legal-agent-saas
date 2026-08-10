# P0-001..P0-005 — Auth context, auth gate y autorización tenant/ownership

**Fecha:** 2026-08-05
**Alcance:** piezas críticas de autenticación y autorización multi-tenant —
no se tocó pagos, migraciones, Docker ni frontend no relacionado.

---

## Resumen de hallazgos previos

- `requireAuth()` solo devolvía `userId`; el contexto de tenant (`firmId`,
  `role`, `isActive`) no existía — todos los endpoints asumían el tenant
  implícito y aceptaban `firmId` desde el body / query.
- El middleware solo hacía i18n; `/dashboard` era accesible sin sesión.
- `GET /api/chatbot/message`, `/api/ai/knowledge` (GET/POST) y
  `/api/ai/analyze-document` (POST) eran totalmente públicos.
- `PATCH /api/leads` y `POST /api/leads/qualify` no filtraban por tenant ni por
  ownership: cualquier usuario autenticado podía escribir sobre el lead `id`
  que quisiera.
- El chatbot admitía `context.mode === 'internal'` desde el body sin
  validar sesión ni coincidencia de firma.

---

## Cambios por ítem P0

### P0-001 — Auth context con `firmId` / `role` / `isActive`

**Archivos:**
- `lib/auth/context.ts` (nuevo) — helpers puramente funcionales
  (`enrichJwtToken`, `buildSessionUser`, `parseAuthContext`) y el tipo
  `AuthContext`. Todo es input → output, sin dependencias de red o base de
  datos → testeable en aislamiento.
- `lib/auth/session.ts` — `requireAuth()` ahora devuelve `AuthContext`
  (`userId`, `firmId`, `role`, `isActive`). Mantiene la contractura
  `const { userId } = await requireAuth()` para que los handlers existentes no
  rompan.
- `app/api/auth/[...nextauth]/auth-options.ts`
  - `authorize()` rechaza usuarios inactivos (`isActive === false`) y emite
    `firmId`, `role`, `isActive` además de `id`.
  - callback `jwt` → `enrichJwtToken(token, user)` (en el primer sign-in).
  - callback `session` → `buildSessionUser(session, token)`.

**Reglas codificadas:**
- `isActive` ausente / null se coerce a `false`.
- Sesión sin `sub`, con `id` no numérico, sin `firmId` (numérico), sin `role`,
  o con `isActive !== true` → `parseAuthContext` devuelve `null` → 401.
- Los usuarios OAuth (Google) que no completen perfil nunca obtendrán un
  `AuthContext` válido → por diseño no entran al dashboard API hasta que
  completen su firma y rol. (Documentado, no es un bug.)

### P0-002 — Auth gate para /dashboard

**Archivos:**
- `lib/auth/dashboard-gate.ts` (nuevo) — helpers puros
  `isProtectedDashboardPath(pathname)`, `shouldRedirectToLogin(pathname,
  sessionToken)`.
- `middleware.ts` — envuelve `next-intl` con el gate; si el path está
  protegido y no hay cookie `next-auth.session-token` (o
  `__Secure-next-auth.session-token`) → redirect 302 a `/login`. La
  validación completa del JWT sigue ocurriendo en `requireAuth`.

**Reglas codificadas:**
- Rutas protegidas: `/dashboard`, `/dashboard/*`, `/en/dashboard`,
  `/es/dashboard/*` (maneja el prefijo de locale i18n).
- No se protegen: `/pricing`, `/login`, `/register`, `/blog`, `/api/*`,
  rutas que solo comparten prefijo (`/dashboard-clone`).
- Smoke check de cookie en el edge — íntegramente authz ocurre en `requireAuth`.

### P0-003 — Proteger GET chatbot, `/api/ai/knowledge`, `/api/ai/analyze-document`; `firmId` siempre del contexto

**Archivos:**
- `app/api/chatbot/message/route.ts`
  - `GET` ahora exige `requireAuth()` y filtra por
    `eq(SESSION, sessionId)` AND `eq(firmId, authCtx.firmId)`.
- `app/api/ai/knowledge/route.ts`
  - `GET` y `POST` exigen `requireAuth()`. `firmId` se deriva SIEMPRE
    desde `resolveFirmId(authCtx, ...)`; cualquier `?firmId=` o
    `data.firmId` en el body es **ignorado** (no solo rechazado).
  - `addDocument` recibe un spread `{ ...doc, firmId }` para sobreescribir
    cualquier `firmId` que el cliente pueda enviar.
- `app/api/ai/analyze-document/route.ts`
  - `POST` exige `requireAuth()`.

### P0-004 — PATCH leads y qualify con filtro tenant + ownership

**Archivos:**
- `lib/auth/authorization.ts` (nuevo) — `canModifyLead(ctx, lead)`,
  `assertFirmScope(ctx, requestedFirmId)`, `resolveFirmId(ctx, requestedFirmId)`.
- `app/api/leads/route.ts`
  - `GET` ahora filtra por `firmId = authCtx.firmId` AND
    `assignedTo = authCtx.userId` (envuelto con `and()`).
  - `POST` asigna `firmId = authCtx.firmId` y `assignedTo = authCtx.userId`
    desde el contexto (ya no se toman del body).
  - `PATCH`:
    1. fetch existing lead por `id`.
    2. si no existe → 404.
    3. `canModifyLead(authCtx, existing)` → 403 si la denegación (mismo
       firm pero assignedTo distinto y sin rol elevado).
    4. el `UPDATE` corre con `WHERE eq(id) AND eq(firmId)` como belt-and-
       suspenders (tenancy defendida también a nivel de SQL).
- `app/api/leads/qualify/route.ts`
  - mismo fetch → `canModifyLead` → 403 si procede → UPDATE con
    `and(eq(id), eq(firmId))`.

**Reglas codificadas:**
- `canModifyLead` permite al caller modificar un lead si y solo si:
  - el tenant coincide (`lead.firmId === ctx.firmId`), Y
  - el caller es `owner` o `admin` del firm, O `lead.assignedTo === ctx.userId`.
- Usuario inactivo nunca puede modificar.

### P0-005 — Restringir modo `internal` del chatbot

**Archivos:**
- `lib/auth/authorization.ts` — `isInternalModeAllowed(ctx, mode, requestedFirmId)`.
- `app/api/chatbot/message/route.ts`
  - Intenta best-effort `requireAuth()`. En el modo `public` permanece anónimo
    (el widget público del landing sigue funcionando).
  - Si `context.mode === 'internal'`:
    - sin auth → 401.
    - con `firmId` en el body que no coincida con `authCtx.firmId` → 401
      (reject cross-tenant knowledge-base access).
    - con `firmId` no provisto o coincidente → OK y se usa
      `resolveFirmId(authCtx, requestedFirmId)` == `authCtx.firmId`.
  - Para el modo público, `effectiveFirmId = 1` (default public-knowledge
    firm) — la LLM y knowledge base pública del landing no filtrada por
    tenant.

---

## Tests — TDD estricto

El proyecto no tenía framework de tests. Se añadió **Vitest 1.6.1** como
dependencia dev con config mínima (`vitest.config.ts`).

Disciplina seguida:
1. RED: tests escritos primero, ejecutados, vistos fallar
   (`ERR_MODULE_NOT_FOUND` para los 3 módulos nuevos).
2. GREEN: implementación mínima — los 47 tests pasaron.
3. REFACTOR: extracción de helpers puros; tests siguen verdes.

### Cobertura

| Archivo de tests                         | Tests | Cubre |
|------------------------------------------|-------|-------|
| `tests/auth/context.test.ts`             | 13    | `enrichJwtToken`, `buildSessionUser`, `parseAuthContext` |
| `tests/auth/authorization.test.ts`       | 22    | `canModifyLead`, `assertFirmScope`, `resolveFirmId`, `isInternalModeAllowed` |
| `tests/auth/dashboard-gate.test.ts`      | 12    | Middleware gate: paths protegidos, cookies, locale variants |
| `tests/auth/flow.test.ts`                | 3     | Cadena NextAuth jwt→session→context end-to-end |
| **Total**                                | **50**| |

No se hizo integration testing de route handlers con fake DB: la lógica de
  autorización está en los helpers puramente funcionales y los handlers son
  glue que los invoca. Eso sigue el scope ("tests unitarios de autorización
  sin inventar integración externa").

---

## Comandos de verificación

```bash
npx vitest run             # 50 tests, 4 files, all green
npx tsc --noEmit           # typecheck limpio (sin output)
npx next lint              # solo warnings `no-console` preexistentes
```

### Resultados observados

- `npx vitest run`
  ```
  ✓ tests/auth/dashboard-gate.test.ts (12)
  ✓ tests/auth/context.test.ts (13)
  ✓ tests/auth/authorization.test.ts (22)
  ✓ tests/auth/flow.test.ts (3)
  Test Files  4 passed (4)
       Tests  50 passed (50)
  ```
- `npx tsc --noEmit` → **sin output** (verde).
- `npx next lint` → solo warnings `no-console` ya presentes antes de este
  cambio; **0 errores nuevos**.

> La salida de `vitest` incluye `RemoteException` en PowerShell stderr — es
> solo la advertencia de Vite sobre la CJS API en desuso, no un fallo.

---

## Archivos modificados / creados

**Nuevos:**
- `lib/auth/context.ts`
- `lib/auth/authorization.ts`
- `lib/auth/dashboard-gate.ts`
- `tests/auth/context.test.ts`
- `tests/auth/authorization.test.ts`
- `tests/auth/dashboard-gate.test.ts`
- `tests/auth/flow.test.ts`
- `vitest.config.ts`
- `docs/audit/P0-AUTH-FIXES.md` (este informe)

**Modificados:**
- `package.json` — añade `vitest` devDep, scripts `test` / `test:watch`.
- `lib/auth/session.ts` — `requireAuth` retorna `AuthContext`.
- `app/api/auth/[...nextauth]/auth-options.ts` — callbacks con helpers.
- `middleware.ts` — compose gate + `next-intl`.
- `app/api/chatbot/message/route.ts` — auth en GET + P0-005 en POST.
- `app/api/ai/knowledge/route.ts` — auth + ctx firmId.
- `app/api/ai/analyze-document/route.ts` — auth.
- `app/api/leads/route.ts` — tenant+ownership en GET/POST/PATCH.
- `app/api/leads/qualify/route.ts` — tenant+ownership en POST.

---

## Qué NO se tocó (explicit out-of-scope)

- Pagos (`app/api/payments/**`, `lib/payments/*`).
- Migraciones (`drizzle/`, `lib/db/migrate.ts`, `drizzle.config.ts`).
- Docker (`Dockerfile`, `.dockerignore`).
- Frontend de marketing / blog / pricing / dashboard pages.
- Secretos: nunca se leyeron ni se hardcodearon; todo viaja por
  `process.env` existente.

---

## Notas de follow-up (fuera de P0)

- Callbacks `jwt`/`session` no re-validan `isActive` en cada petición (solo
  en sign-in). Para revocación en caliente conviene re-fetch del usuario en
  `jwt` cada N requests — ticket separado.
- `is_active` ausente en configuración OAuth hace que esos usuarios queden
  fuera hasta completar perfil — debe existir un onboarding flow.
- El widget `ChatWidget` en `dashboard/layout.tsx` envía
  `mode="internal"` con `firmName` hardcoded — valor cosmético, no provoca
  firma; el `firmId` real lo proveerá la sesión (vía cookie).