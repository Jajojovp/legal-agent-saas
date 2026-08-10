# Auditoría de Seguridad - legal-agent-saas (Solo Lectura)

- **Fecha:** 2026-08-05
- **Scope:** Aplicación Next.js 14 (App Router) + Drizzle + Supabase/Postgres + NextAuth + MercadoPago
- **Modo:** Solo lectura. No se leyeron valores de `.env.local`. No se ejecutaron ataques activos.
- **Criterios:** OWASP Top 10 (Web/ API), OWASP ASVS L2, ISO 27001 Anexo A, spec `seguridad-domain`, playbook `security-audit`.
- **Hallazgos:** 5 Críticos, 4 Altos, 6 Medios, 4 Bajos/Info.
- **Sintesis ejecutiva:** El `SECURITY-AUDIT.md` existente (fecha 2024-04-22) declara "Production Ready 92/100" con CSRF 100%, Headers 100%, File Upload 100% y Auth 0%. La verificación con evidencia contradice varias afirmaciones: las funciones `addSecurityHeaders` y `validateCSRFToken` existen pero **no se invocan en ninguna ruta** (código muerto). `next.config.js` sólo establece 4 cabeceras (sin CSP, HSTS ni Permissions-Policy). Existen **3 rutas de API sin autenticación** que filtran/modifican datos legales cruzando inquilinos (IDOR cross-tenant), incluyendo subida anónima de documentos legales.

---

## DFD de alto nivel (Trust Boundaries)

- **TB1 Browser** -> CDN/Edge Vercel (TLS) -> Next.js runtime (server)
- **TB2 Server** -> Postgres (Supabase) sobre `ssl: { rejectUnauthorized: false }` *(ver F6)*
- **TB3 Server** -> MercadoPago API (Bearer `MP_ACCESS_TOKEN`)
- **TB4 Cliente anónimo** -> `/api/chatbot/message`, `/api/ai/*` *(sin auth => trust level ANÓNIMO ejecuta lógica del tenant)*
- **TB5 Usuario autenticado (attorney/owner)** -> rutas con `requireAuth()` *(sin propagación de firmId/role)*

Datos legales sensibles en reposo: `leads.caseDescription`, `cases.description`, `documents.fileUrl`, `chatConversations.messages`, `invoices`. Nivel de confianza esperado: tenant-isolated, RBAC. Nivel real: **no aislado por tenant en la mayoría de endpoints**.

---

## CRÍTICOS

### F1 — IDOR no autenticado en `/api/chatbot/message` (GET) + cross-tenant (POST)
- **Archivo/línea:** `app/api/chatbot/message/route.ts:105-132` (GET), `:33, :65, :82-83` (POST)
- **OWASP:** A01 Broken Access Control / API1 BOLA
- **ISO 27001:** A.5.15 Acceso a redes y servicios, A.8.3 Prevención de información faltante/slipping
- **Impacto:** Filtración de conversaciones privadas de leads legales (PII + descripciones de caso) sin sesión. En POST, `firmId` se toma del cuerpo del request (`body.firmId`) y se inyecta en `queryWithContext(message, firmId || 1, ...)`. Un atacante anónimo puede enumerar `firmId` y leer/poisonear la knowledge base de cualquier firma.
- **Reproducción segura (sin ataque activo):** Lectura de código confirma que `GET` no llama `requireAuth()` ni filtra por `firmId`; la única condición es `sessionId` (campo libre cliente). `POST` no exige auth y usa `firmId` del body. Equivale funcionalmente a `GET /api/chatbot/message?sessionId=<cualquiera>` retornando `messages` sin comprobación de titularidad.
- **Corrección:**
  1. Llamar `requireAuth()` en `GET` y `POST`.
  2. Derivar `firmId` de `session.user.firmId` (callback JWT que lo propague, ver F7), **nunca** del cuerpo ni query.
  3. Filtrar `where(and(eq(sessionId, x), eq(firmId, userFirmId)))`.
  4. Hash/sign `sessionId` (HMAC server-side) para evitar enumeración.
  5. Rate-limit por `userId + firmId`, no solo IP.

### F2 — Subida y análisis de documentos legales sin autenticación
- **Archivo/línea:** `app/api/ai/analyze-document/route.ts:4-28`
- **OWASP:** A01, A04 Diseño no seguro (subida anónima de PII legal), A09 Fallos de logging
- **ISO 27001:** A.5.12 Clasificación de información, A.5.34 Privacidad y protección de PII, A.8.10 Gestión de información en apps
- **Impacto:** Cualquiera puede enviar archivos (`file`) o texto a un modelo de IA que procesa contenido legal de clientes. No hay auth, no hay rate-limit, no hay trazabilidad, no hay límite de tenant, no hay registro de auditoría. Riesgo de fuga de secretos del cliente, consumo de cuota de IA por un atacante, y potencial exfiltración vía prompt-injection a herramientas conectadas.
- **Reproducción segura:** El handler no invoca `requireAuth()` ni `rateLimit`, recibe `formData.get('file')` y lo pasa a `extractTextFromFile`. Comparar con `app/api/cases/route.ts:9` que sí exige auth.
- **Corrección:**
  1. `requireAuth()` + verificar `firmId` y plan activo.
  2. Reusar `validateFileUpload()` (con magic-bytes, ver F13) y máximo estricto.
  3. Persistir `documents` row con `uploadedBy`, `caseId`, `firmId` validados.
  4. Registrar `logSecurityEvent({action:'document.analyze', userId, ip})` persistente (no console).
  5. Rate-limit por usuario (p.ej. 5/min) y por firma.

### F3 — `/api/ai/knowledge` sin auth: polución + fuga cross-tenant
- **Archivo/línea:** `app/api/ai/knowledge/route.ts:4-36`
- **OWASP:** A01 BOLA, A08 Integridad (modificación no autorizada del knowledge base)
- **ISO 27001:** A.5.14 Redundancia, A.8.31 Separación de entornos, A.5.3 Control de acceso
- **Impacto:** `add` permite inyectar documentos en el knowledge base de cualquier `firmId` (campo del body). `search`/`query`/`GET` exponen documentos de cualquier firma pasando `firmId`. Pb de "data poisoning" deliberado y exfiltración competitiva.
- **Reproducción segura:** Lectura de `switch(action)`: ninguna rama valida sesión; `data.firmId`/`searchParams.get('firmId')` son controlados por cliente.
- **Corrección:** exigir auth, propagar `firmId` desde sesión, never trust body `firmId`; hacerlo `notNull` en schema y forzar `eq(firmId, userFirmId)` en todas las operaciones.

### F4 — IDOR cross-tenant en modificación de leads
- **Archivo/línea:** `app/api/leads/route.ts:77-81` (PATCH), `app/api/leads/qualify/route.ts:20-32`
- **OWASP:** A01 BOLA
- **ISO 27001:** A.5.15, A.8.3
- **Impacto:** `PATCH` actualiza cualquier lead por `eq(leads.id, id)` sin verificar `firmId` ni `assignedTo`. Cualquier usuario autenticado de la firma A puede alterar status/score/practiceArea de leads de la firma B (incluido "marcar como perdido" o secuestrar `metadata.aiQualification`). `qualify` hereda el mismo defecto.
- **Reproducción segura:** Comparar con `GET` (línea 15) que sí filtra `assignedTo = userId`; el `PATCH` (líneas 77-81) omite ese filtro porque no se implementa ownership-check.
- **Corrección:**
  ```ts
  .where(and(eq(leads.id, id), eq(leads.firmId, userFirmId), eq(leads.assignedTo, userId)))
  ```
  Añadir rol-owner check si el usuario debe modificar leads ajenos dentro de su firma.

### F5 — Ausencia de control de aislamiento por role/firma en sesión
- **Archivo/línea:** `app/api/auth/[...nextauth]/auth-options.ts:56-69` (callbacks), `lib/auth/session.ts:8-19`, `lib/db/schema.ts:46-62`
- **OWASP:** A01, A07 Failures in identity y autorización
- **ISO 27001:** A.5.16 (gestión de identidad), A.5.18 (derechos de acceso)
- **Impacto:** El callback `jwt`/`session` sólo propaga `id` (`token.sub`). No inyecta `firmId` ni `role`. `requireAuth()` retorna solo `userId`. Por tanto **ninguna ruta puede hacer cumplir aislamiento de tenant** aunque quieran; el parche sugerido en F4/F1 no tiene la información necesaria.
- **Reproducción segura:** lectura de `auth-options.ts` callback `session({ session, token })`: sólo setea `(session.user).id = token.sub`. No hay `firmId`, `role`, ni `isActive` propagados.
- **Corrección:**
  ```ts
  jwt({ token, user }) {
    if (user) {
      token.sub = user.id;
      token.firmId = user.firmId;
      token.role = user.role;
      token.isActive = user.isActive;
    }
    return token;
  },
  session({ session, token }) {
    if (session.user) {
      session.user.id = token.sub;
      session.user.firmId = token.firmId;
      session.user.role = token.role;
    }
    return session;
  },
  ```
  Que `requireAuth()` devuelva `{ userId, firmId, role, session }` y rechazar `isActive=false`.

---

## ALTOS

### F6 — Verificación de certificado TLS deshabilitada para Postgres
- **Archivo/línea:** `lib/db/index.ts:13`
- **OWASP:** A02 Fallos criptográficos
- **ISO 27001:** A.8.24 Criptografía, A.8.21 Seguridad de redes
- **Impacto:** `ssl: { rejectUnauthorized: false }` permite MITM y suplantación del host Postgres. En railway/supabase esto además omite la verificación de CA y deja tráfico protegido solo contra escuchas casuales.
- **Reproducción segura:** línea literal: `postgres(connectionString, { ssl: { rejectUnauthorized: false }, max: 1, ... })`. Contrasta con la afirmación en `SECURITY-AUDIT.md:594` (`rejectUnauthorized: true`).
- **Corrección:** usar el bundle CA de Supabase o el `sslmode=require` con `rejectUnauthorized: true` + `sslrootcert`. Aceptar `DATABASE_URL` firmada por Supabase.

### F7 — `next.config.js` no aplica cabeceras críticas (CSP / HSTS / Permissions-Policy)
- **Archivo/línea:** `next.config.js:19-31`; comparar con `lib/security/middleware.ts:161-198` (definido, no invocado)
- **OWASP:** A05 Misconfiguration (cabeceras de seguridad)
- **ISO 27001:** A.8.26 (requisitos de seguridad en apps)
- **Impacto:** El reporte existente declara "Security Headers 100% (CSP aplicado)". En realidad `next.config.js` sólo setea `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `X-XSS-Protection`. **No hay CSP, HSTS, ni Permissions-Policy** en runtime. `addSecurityHeaders()` nunca se invoca en middleware.
- **Reproducción segura:** grep `addSecurityHeaders` -> matches sólo en `lib/security/middleware.ts` (definición) y `SECURITY-AUDIT.md` (doc). Cero llamadas en `app/**`, `middleware.ts`, `next.config.js`.
- **Corrección:** Añadir en `next.config.js` la política CSP (sin `'unsafe-eval'`, ver F13-CSP加固), `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, y `Permissions-Policy`. O mover a `middleware.ts` combo auth+headers.

### F8 — `middleware.ts` no implementa puerta de autenticación ni ningún control global
- **Archivo/línea:** `middleware.ts:1-13`
- **OWASP:** A01, A05
- **ISO 27001:** A.8.20 Seguridad de redes (segmentación app), A.5.15
- **Impacto:** El middleware se limita a `next-intl` routing. Excluir `/api` del matcher significa que **no existe gate central de auth/rate-limit/headers**. Cada handler debe auto-llamar `requireAuth()`: omisiones (F1/F2/F3) son неизбежes por diseño. Viola "secure by default" del spec seguridad.
- **Reproducción segura:** `matcher` excluye `/api`; el cuerpo del middleware no toca ni auth ni headers.
- **Corrección:** Combinar `next-intl` con un matcher API-cubierta, invocar `getServerSession`/Supabase en middleware y responder 401 en patrones `/api/(cases|tasks|leads|dashboard|ai|payments)/*` sin sesión (allowlist público: `chatbot` con throttle, `mp/webhook`). Esto elimina la clase de error "olvidé `requireAuth`".

### F9 — CSRF declarado "100%" pero `validateCSRFToken()` nunca se invoca
- **Archivo/línea:** `lib/security/middleware.ts:61-68` (definición); grep sin usos en `app/**`
- **OWASP:** A01 CSRF (aunque NextAuth Credentials con JWT Bearer atenúa); OWASP CSRF depth
- **ISO 27001:** A.8.26
- **Impacto:** Las POST/ PATCH que mutan estado dependen de cookies de sesión NextAuth. Sin token CSRF ni verificación `Origin`/`Sec-Fetch-Site`, un site malicioso puede inducir mutaciones en rutas con cookies. Misleading doc: crédito por control no implementado.
- **Reproducción segura:** `Select-String -Pattern validateCSRFToken app/ -r` cero hits.
- **Corrección:** Para endpoints con cookie-session, validar `Origin`/`Sec-Fetch-Site` en `requireAuth()` o middleware (suficiente para ASVS 4.2). Alternativa: pasar a flow Authorization Bearer header sin cookies y eliminar la superficie CSRF. Migrar report a realidad: CSRF 0% hasta remediar.

---

## MEDIOS

### F10 — Registro enumera emails + sin rate-limit + sin verificación de email
- **Archivo/línea:** `app/api/auth/register/route.ts:8-13, 29-36, 53`
- **OWASP:** A07 Identification & Auth Failures; A04 Insecure Design
- **ISO 27001:** A.5.16, A.5.17 (autenticación), A.8.2 (privilegios)
- **Impacto:** Devuelve `"Email already in use"` (409) -> enumeración de cuentas. Sin CAPTCHA ni rate-limit -> credential stuffing + registro masivo. `role: 'owner'` fijo sin política -> auto-elevación. Sin `emailVerified` -> nuevas cuentas tomadas como activas inmediatamente.
- **Corrección:** Mensaje genérico `"Check your inbox to complete registration"`, no revelar conflicto; activar `emailVerified` y exigir token; rate-limit `/auth/register` y `/auth/callback/credentials`; exigir `isStrongPassword()` (ya existe en `lib/security/middleware.ts:126` pero no se llama aquí); rol por defecto `attorney`, ascenso admin mediante flujo firm owner.

### F11 — `validateFileUpload` confía en `file.type` (controlado por cliente) y extensión; sin magic bytes
- **Archivo/línea:** `lib/security/middleware.ts:240-279`
- **OWASP:** A04 Insecure Design (upload), A03 Injectable vía path traversal/contenido
- **ISO 27001:** A.8.31, A.8.10
- **Impacto:** `file.type` viene del header multipart del cliente; trivial spoof. No se inspeccionan magic bytes ni extensiones verdaderas, ni se neutraliza `file.name` (potencial path-traversal al persistir). No se llama en `analyze-document` (que admite PDF/JPEG/PNG por `accept` implícito). README doc admite "TODO ClamAV".
- **Corrección:** sniff magic bytes (`file-type` npm) server-side; sanitizar basename (path.basename + uuid); nunca usar `file.name` como ruta de persistencia; escanear AV (ClamAV/ VirusTotal API opcional).

### F12 — Rate limiter in-memory; sin persistencia distribuida
- **Archivo/línea:** `lib/security/middleware.ts:3-38`, `app/api/chatbot/message/route.ts:8-23`
- **OWASP:** A07 (abuse); CWE-770
- **ISO 27001:** A.8.6 (gestión de vulnerabilidades técnicas), A.8.20
- **Impacto:** Map local se pierde en restarts, no comparte entre instancias serverless (Vercel), permite bypass por cold starts y ворac consensus. `rateLimitMap` crece sin bound observado (`record.delete` solo si expired y accedido) -> memory leak lento.
- **Corrección:** Redis/Upstash para ventanas deslizantes; para `chatbot` anónimo combinar con cost throttling (challenge/CAPTCHA tras 5/min).

### F13 — Cabeceras/ejemplos del `SECURITY-AUDIT.md` contradicen el código (riesgo de compliance/engagement)
- **Archivo/línea:** `SECURITY-AUDIT.md:14, 360, 670-704` vs evidencia arriba
- spec seguridad-domain: "No asumas; pide evidencia. Documenta control > opinión."
- **Impacto:** Documento firmado como auditoría previa afirma controles inexistentes (CSRF/Headers/File Upload "100%"). Equipo podría descansar en ello. ISO 27001 A.5.23 (seguridad de la Información en cloud) / A.5.24 gestión de incidentes.
- **Corrección:** Reemplazar `SECURITY-AUDIT.md` por este informe (o marcarlo SUPERSEDED) y mantener trazabilidad control->evidencia->test en CI.

### F14 — Auditoría de seguridad no persistente (sólo `console.log`)
- **Archivo/línea:** `lib/security/middleware.ts:293-299`
- **ISO 27001:** A.8.15 (logging), A.8.16 (monitoring)
- **Impacto:** `logSecurityEvent()` sólo imprime; en Vercel los logs rotan/deglose. Sin persistir -> imposibilidad de RCA y breach forensics.
- **Corrección:** Persistir en tabla `auditLogs` (esquema ya referenciado en TODO) o sink externo (Logflare/Datadog/Sentry) con integridad (hash chain).

---

## BAJOS / INFO

- **F15 [BAJO]** `app/api/auth/register/route.ts:53` fija `role='owner'`. Permitir auto-elevación va contra least privilege (spec seguridad). Cambiar a rol mínimo y prever un flujo "claim ownership of firm".
- **F16 [BAJO]** JWT `maxAge: 30 * 24 * 3600` (auth-options:50) sin refresh/rotación ni revocación. Reduce ventana en caso de robo (ASVS 3.4.1: ≤24h en access). Implementar refresh-httpOnly separado y tabla `sessions` con revocación.
- **F17 [BAJO]** Webhook MP (`app/api/payments/mp/webhook/route.ts:19`) sólo `console.log` el evento y **no actualiza estado de suscripción** ni en DB. No idempotencia, no `X-Request-Id` almacenado, no verificación IP remitente. Riesgo de replay y descuido de facturación (A09 logging / A04 insecure design financial).
- **F18 [BAJO]** `console.error('Registration error:', error)` y `'MP checkout error:'`/`'Chatbot error:'` pueden loguear stacks con PII o tokens circunstanciales. Sanitizar antes de log (ASVS 7.1.4).
- **F19 [BAJO]** `validateAPIKey()` (`lib/security/middleware.ts:203-208`) sólo valida prefijo+longitud. No se persiste ni se compara. Eliminar o implementar contra store hashed (SHA-256) con rotation.
- **F20 [INFO]** `.gitignore` correctamente excluye `.env*` y `.env.local`; `.env.example` sin secretos reales confirmado. `.env.local` presente (no leído por indicación). Sin `.git` en el workspace (no repo git), por lo que no se verifican commits históricos; al inicializar git, añadir `gitleaks`/`ggshield` y asegurarse de no staged `.env.local`.
- **F21 [INFO]** `lib/db/supabase-init.sql` está vacío: no hay políticas RLS en DB. Cualquier fuga en capa app expone todos los tenants. Recomendado: habilitar RLS + policies por `firmId` zabrado de defense-in-depth (spec: least privilege).
- **F22 [INFO]** Dependencias sueltas (`^`): `next-auth ^4.24.7`, `next ^14.1.4`, `drizzle-orm ^0.30.4`, `postgres ^3.4.9`, `bcryptjs ^2.4.3`. Sin lock-pin por hash ni SBOM. Recomendado: `npm audit --omit=dev`, Dependabot/CodeQL, renovate, y migrar `bcryptjs` (JS puro) a `argon2id` (ASVS 2.4.1).

---

## Matriz de mapeo de controles (resumen)

| Control spec / ISO       | Estado real | Evidencia clave |
|--------------------------|-------------|-----------------|
| Auth por sesión (A.5.17) | Parcial     | `requireAuth()` sólo userId; sin firmId/role |
| RBAC (A.5.18)            | Inexistente | `role` definido en schema pero no aplicado |
| Tenant isolation (A.8.31)| Roto        | F1/F3/F4 usan `firmId` del cliente |
| CSRF (A.8.26)            | No real     | `validateCSRFToken` muere |
| Headers (A.8.26)         | Parcial 4/8 | `next.config.js:19-31` |
| TLS DB (A.8.24)          | Débil       | `index.ts:13 rejectUnauthorized:false` |
| Uploads (A.8.10)         | Inseguro    | `analyze-document` sin auth ni magic-bytes |
| Logging (A.8.15)         | Inexistente | `logSecurityEvent` -> console.log |
| Secrets git (A.5.3)      | OK .gitignore | `.env.local` no leído |
| RBAC en API SENSIBLE     | Falta       | `middleware.ts` sin auth gate |

---

## Remediación priorizada (roadmap)

**Sprint 0 (Bloqueante para producción):**
1. F5: propagar `firmId`/`role` en callbacks JWT/session; enriquecer `requireAuth`.
2. F1/F4/F3: forzar `firmId` desde sesión en `chatbot/message`, `leads` (PATCH, qualify) y `ai/knowledge`. Auth en ambas.
3. F2: auth + rate-limit + persist `documents` en `analyze-document`.
4. F6: `rejectUnauthorized: true` + CA bundle.
5. F8: middleware con auth gate + headers + rate-limit global (matcher incluyendo `/api` salvo allowlist).

**Sprint 1 (Alto):**
6. F7/F9: CSP estricta (sin `'unsafe-eval'`), HSTS, Permissions-Policy vía `next.config.js`; eliminar código muerto o activarlo.
7. F10: rango de registro genérico, CAPTCHA, `emailVerified` obligatorio, `isStrongPassword`.
8. F11: validación magic-byte en uploads; UUIDs como nombres de fichero.
9. F14: persistir `auditLogs`.
10. F17: procesar webhook MP (upsert subscription, idempotencia por `X-Request-Id`).

**Sprint 2 (Hardening):**
11. F12: Redis/Upstash para rate limit distribuido.
12. F16: refresh tokens + tabla `sessions` revocable.
13. F15/F18/F19: rol mínimo, sanitización de logs, eliminar/reescribir `validateAPIKey`.
14. F13: marcar `SECURITY-AUDIT.md` como SUPERSEDED y reemplazar por informe verificado.
15. F21: RLS Postgres como defense-in-depth.
16. F22: SBOM (`npm sbom --sbom-format cycloneDX`) + Dependabot/CodeQL; `npm audit` en CI.

---

## Verificación post-remediación (gentile evidence gates)

- Test automático `tests/security/auth.smoke` que `GET /api/leads` sin sesión -> 401.
- Test `tests/security/idor` cross-firm: dos usuarios de firmas distintas no pueden PATCH lead ajeno.
- CI assertion: `grep -r "rejectUnauthorized: false" lib/` -> 0 hits.
- CI assertion: existencia de `Content-Security-Policy` header e2e.
- CI assertion: `validateCSRFToken/addSecurityHeaders` deben ser referenciados en `middleware.ts`/`next.config.js` o ser eliminados.
- `npm audit --omit=dev` sin highs en pipeline principal.

---

**Clasificación:** CONFIDENCIAL — Internal use only.
**Document Version:** 1.0 (reemplaza `SECURITY-AUDIT.md` v1.0).