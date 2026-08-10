# ADR-0004: Integridad e idempotencia de webhooks de pago

- **Estado:** Propuesto
- **Fecha:** 2026-08-05
- **Contexto:** `app/api/payments/mp/webhook/route.ts:19-21` recibe, verifica firma y sólo `console.log`; no actualiza estado, no idempotencia, no persiste `X-Request-Id` (F17). `console.log` de payloads puede loguear PII (F18). NaNs en parseo documentados en plan (A3). El schema `lib/db/schema.ts:120-124` no contiene tablas `subscriptions` ni `paymentHistory` (vacío). Proveedores activos en código: MercadoPago (`mp`) y Takenos — NO LemonSqueezy (divergencia con plan).
- **Decisión:**
  1. Crear tablas (migración reversible, ADR-0005): `subscriptions(id, firmId, userId, provider, providerCustomerId, plan, status, currentPeriodEnd, ...)` y `paymentHistory(id, firmId, subscriptionId, provider, providerPaymentId UNIQUE, amount, currency, status, rawPayload jsonb, idempotencyKey, createdAt)`.
  2. Flujo webhook: (a) rechazar 500 si `MP_WEBHOOK_SECRET`/equivalente falta; (b) verificar firma HMAC `x-signature`/`x-request-id`; (c) recuperar el pago vía `GET /v1/payments/:id` a MP con timeout 8s + circuit breaker; NO confiar en `body.data.transaction_amount`; (d) tx DB: `INSERT ... ON CONFLICT (provider, providerPaymentId) DO NOTHING`: si inserted → update `subscriptions.status` + disparar handled events; si conflict → responder 200 con mismo body original (idempotencia backend.spec R3/integrations.spec R10).
  3. `POST /api/payments/*/checkout` exige `Idempotency-Key` para evitar doble checkout.
  4. Logger JSON estructurado; eliminar `console.log` raw.
  5. Circuit breaker en todas las integraciones salientes (MP, Takenos, Gemini, Resend), backend.spec R9/R10.
- **Alternativas consideradas:**
  - *Persistencia en log externo sin DB.* Contras: no aporta idempotencia sino reentrancy, no cumple backend.spec R3.
  - *Sin recuperación de pago; confiar en body.* Contras: NaN/missing-field confirmado; propagación de bugs de parseo.
  - *Mensajería asíncrona (colas) ahora.* Contras: añade stack (queue) fuera de scope P0. Se planea P2: webhook -> persist raw -> worker procesa (resiliente a reintentos).
- **Consecuencias:**
  - Positivas: estado de suscripción fiable, idempotencia garantizada, billing reconstruible.
  - Negativas: dependencia de MP API en webhook (lat/SPOF) — mitigada con timeout/`cb` + persistir hecho en `paymentHistory` aunque MP esté caído.
  - Neutralizadas: si MP caído, GET pago falla y webhook responde 503 para que MP reintente; el idempotency table impide duplicado si MP reintenta tras éxito ya persistido.
- **Módulos afectados:** `app/api/payments/mp/webhook/route.ts`, `lib/payments/mercadopago.ts`, `lib/payments/takenos.ts` (análogo), `lib/db/schema.ts` (tablas nuevas), `app/api/payments/*/checkout/route.ts` (Idempotency-Key), tests webhook/idempotencia.
- **Riesgos:** MP reintenta fuera de ventana → mitigación: idempotency table RESPETE reintentos indefinidamente (clave = `providerPaymentId`). Rate limit MP side → mitigación: backoff. Datos maliciosos dirigidos al modelo (rawPayload) → mitigación: jsonb no ejecutable, log redacted.
- **Reversión:** Reponer flujo `console.log`-only y eliminar tablas (DOWN de la migración). Coste: medio. Riesgo de reversión CRÍTICO (revive F17 y facturación huérfana).
- **Ruptura de contrato:** Interna. Respuesta HTTP 200 `{received:true}` se mantiene. Añadir `payments/*/checkout` requiere `Idempotency-Key` → breaking para clientes sin header; se documenta y se añade default fallback deprecado por un release.
- **Specs:** backend.spec R3/R9/R10, integrations.spec R3/R4/R10, database.spec R1/R2, security.spec R1/R9, owasp.spec R9.
