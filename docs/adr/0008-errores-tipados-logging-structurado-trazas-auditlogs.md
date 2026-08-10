# ADR-0008: Error handling tipado + logging estructurado + trazas

- **Estado:** Propuesto
- **Fecha:** 2026-08-05
- **Contexto:** Handlers usan `catch (error: any) { console.error(...) }` con strings; bodies devuelven `{ error: 'string' }`. backend.spec R4/R5/R6 violados. F14: `logSecurityEvent` (`lib/security/middleware.ts:293-299`) sólo `console.log` (no persist). F18: stacks con PII/tokens en logs. Sin `trace_id` propagado. Sin `auditLogs` persistidos (mencionados como TODO).
- **Decisión:**
  1. **Errores tipados**: clases `AppError`, `AuthError`, `TenantError`, `ValidationError`, `IntegrationError`, `IdempotencyConflictError` con `{ code, message, statusCode, cause, attrs }`. Prohibido lanzar strings.
  2. **Handler wrapper `withErrorHandler(handler)`**: mapea tipos a HTTP status; error inesperado → 500 con `trace_id` (sin stack al cliente).
  3. **Logger JSON estructurado** (backend.spec R5): campos `timestamp, level, service, trace_id, span_id, message, attrs`. `trace_id` generado en middleware (ADR-0003), propagado a salientes por `X-Trace-Id`.
  4. **Sanitización de logs**: redactar `Authorization`, `password`, `hashedPassword`, `file` payload, `rawPayload` de pagos > agregado. Lint: `no-console` en `app/api/**` (warn -> error P2).
  5. **Persistir `auditLogs`**: tabla nueva (id, ts, userId, firmId, action, ip, attrs, prevHash, hash) con cadena hash simple para integridad. Sustituye `console.log` de eventos de seguridad (F14). Sink externo (Logflare/Datadog/Sentry) en P2.
  6. **Coexistencia**: el body de error expone `{ error: { code, message, traceId } }` Y un campo `error: string` legacy por un release (ruptura mitigada).
- **Alternativas consideradas:**
  - *Mantener strings en error body.* Contras: no respeta backend.spec R4; inconsistente; clients no programables.
  - *Sentry como sink único ahora.* Contras: añade dependencia/credencial en P1; `auditLogs` debe existir en DB antes por RCA local.
  - *Trazas vía OpenTelemetry SDK ahora.* Contras: P2; un `trace_id` propagado por header basta para correlación P1.
- **Consecuencias:**
  - Positivas: RCA reproducible; observabilidad mínima; clientes pueden programar contra códigos.
  - Negativas: cambio de shape del body es breaking para front existente.
  - Neutralizadas: campo `error: string` legacy coexistente un release.
- **Módulos afectados:** todos los handlers `app/api/**`, `lib/errors/*` (nuevo), `lib/logger/*` o integración winston/pino, `middleware.ts` (trace_id), `lib/db/schema.ts` (`auditLogs`), tests de error mapping.
- **Riesgos:** Logs de pago legítimos pero sensibles → mitigación: reglas de redacción documentadas + sampleo. Hash chain roto por concurrencia → mitigación: RA separado por firma o lock row. Coste de migración de 30+ handlers → mitigación: rollout por dominio (CRM primero).
- **Reversión:** Reponer `console.log` + bodies string. Coste: bajo. Riesgo de reversión MEDIO (revive F14/F18 y pierde observabilidad).
- **Ruptura de contrato:** Body de error de `{error:string}` a `{error:{code,message,traceId}, error:string}` un release. Documentada en changelog. Coexistencia garantizada por campo legacy.
- **Specs:** backend.spec R4/R5/R6, security.spec R9, owasp.spec R9/R10, architecture.spec R8.
