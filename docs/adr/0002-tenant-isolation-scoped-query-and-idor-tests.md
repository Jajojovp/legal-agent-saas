# ADR-0002: Tenant Isolation por defecto con scopedQuery + tests IDOR en CI

- **Estado:** Propuesto
- **Fecha:** 2026-08-05
- **Contexto:** Hallazgos F1, F3, F4, C5: handlers CRM/AI toman `firmId` del body/query (`app/api/chatbot/message/route.ts:33`, `app/api/ai/knowledge/route.ts`, `app/api/leads/route.ts:77-81`). Sin filtro `firmId` en PATCH. Riesgo de fuga y modificación cross-tenant de PII legal. Confirma RISK-001/002 del intake. ADR-0001 aporta `AuthContext.firmId` prerequisito.
- **Decisión:** Definir helper `scopedQuery(ctx, table)` que envuelve Drizzle forzando `and(eq(table.firmId, ctx.firmId), ...)` en SELECT/UPDATE/DELETE de tablas con `firmId` (leads, cases, tasks, documents, chatConversations, kpiMetrics, subscriptions, paymentHistory). Ningún handler puede aceptar `firmId` del request. Tests `tests/security/idor/*` fallan en CI si se cruza. Capa DB RLS se añade como defense-in-depth en P1 tardía (no reemplaza esta). Almacenamiento de archivos prefix por `firmId`.
- **Alternativas consideradas:**
  - *Sólo RLS Postgres.* Contras: retrasa remediación crítica; la app seguiría pasada de firma en sesión; el RLS no protege rutas que bypassan DB (chat/knowledge base). Insuficiente solo.
  - *Row filters en cada handler manual.* Contras: propenso a omisiones (F4 demuestra que ya ocurrió). Sin red de tests.
  - *Multi-DB por tenant.* Contras: coste operacional alto para un SaaS con pocos inquilinos; anti-economic a este escala.
- **Consecuencias:**
  - Positivas: garantía de aislamiento aplicada sinmagia; tests automáticos; zero confiar en la diligencia del desarrollador.
  - Negativas: ligero overhead por envoltorio reutilizable; necesidad de revisar queries que legítimamente cruzan firm (admin/super-admin) → marco `requireRole('admin')` con bypass explícito.
  - Neutralizadas: handler admin se añade como excepción tipada auditada.
- **Módulos afectados:** `app/api/leads/*`, `app/api/cases/*`, `app/api/tasks/*`, `app/api/chatbot/message/route.ts`, `app/api/ai/knowledge/route.ts`, `app/api/ai/analyze-document/route.ts`, `lib/domain/tenant/tenantScope.ts` (nuevo), tests.
- **Riesgos:** Queries cross-firm legítimos (soporte interno) →mitigación: rol `admin` con bypass explícito y `auditLogs`. Olvido de uso → mitigación: lint rule custom + test IDOR en CI.
- **Reversión:** Reponer `firmId` del body en handlers. Coste: bajo. Riesgo de reversión CRÍTICO (revive IDOR).alternativa: dejar `scopedQuery` opcional, pero no se recomienda.
- **Ruptura de contrato:** `POST /api/chatbot/message` ya no acepta `firmId` libre del body; se ata a `firmSlug` público configurado por servidor (coexistencia documentada para landing anónima).
- **Specs:** architecture.spec R3/R8, backend.spec R1/R4, database.spec R12, owasp.spec R2, security.spec R3.
