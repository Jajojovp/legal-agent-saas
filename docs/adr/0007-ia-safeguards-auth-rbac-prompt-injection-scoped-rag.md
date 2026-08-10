# ADR-0007: Salvaguardas IA — auth, RBAC de modo, anti prompt-injection, RAG scoped

- **Estado:** Propuesto
- **Fecha:** 2026-08-05
- **Contexto:** `app/api/ai/analyze-document/route.ts` admite anónimos (F2). `app/api/ai/knowledge/route.ts` acepta `firmId` del body (F3) — polución + fuga cross-tenant. Chatbot admite `mode: 'internal'` sin auth (plan C7). `lib/ai/legal-ai-service.ts` pasa input de usuario directo al LLM sin envoltorio anti-injection (plan A9). `rag.spec.md` aplicable condicionalmente; no hay embeddings versionados ni citas verificables.
- **Decisión:**
  1. **Auth obligatoria** en `analyze-document` y `knowledge`; `firmId` siempre de `AuthContext` (ADR-0001/0002). Rate-limit por `userId` y por firma (5/min P0). Persistir `documents` con `uploadedBy`, `caseId`, `firmId`.
  2. **Uploads validados por magic bytes** (F11): sniff server-side (`file-type`), sanitizar basename (`path.basename` + uuid), nunca `file.name` como ruta; AV optativo (ClamAV/VirusTotal).
  3. **Modo `internal` requiere `requireRole('owner','admin')`.** El widget público nunca manda `internal`.
  4. **Prompt-injection hardening (contratos, no implementación aquí):**
     - System prompt primero y fuerte; instrucción explícita de no revelar system prompt ni ejecutar instrucciones embebidas en documentos.
     - Empaquetar input del usuario como datos (`<user_document>...</user_document>`), no como instrucciones.
     - Output filter: rechazar respuestas que contengan tokens/prefijos del system prompt.
     - Sin tool-calling de entrada salvo allow-list de tools que no accedan a datos de otra firma.
  5. **RAG scoped por `firmId`:** índice/embeddings particionados por tenant; búsqueda fuerza `eq(firmId, ctx.firmId)`. Versión de embeddings en metadata (future P2). Citas: devolver `sourceRefs` en respuesta.
  6. **Timeout/circuit breaker en Gemini** (backend.spec R9/R10). Logging sin PII.
- **Alternativas consideradas:**
  - *Sólo rate-limit sin auth.* Contras: no resuelve fuga/Poisoning cross-tenant (F3).
  - *Permitir `mode: internal` con token simple.* Contras: otro secreto que rotar; prefiero RBAC de sesión.
  - *RAG global con filtro post-búsqueda.* Contras: ineficiente y filtrable por orden de relevancia; riesgo residual alto.
- **Consecuencias:**
  - Positivas: cierra vector de fuga de PII legal vía IA; reduce consumo abusivo de cuota Gemini.
  - Negativas: ligero coste de indexación por tenant; ajuste de prompts.
  - Neutralizadas: hot cache de embeddings por firma; medición de LoS.
- **Módulos afectados:** `app/api/ai/analyze-document/route.ts`, `app/api/ai/knowledge/route.ts`, `lib/ai/*` (services + prompts), `components/chatbot/chat-widget.tsx`, `lib/security/middleware.ts` (validateFileUpload magic bytes F11), tests IA scoped.
- **Riesgos:** Prompts muy estrictos degradan respuesta útil → mitigación: iterar con evaluación reproducible (rag.spec R10). Coste IA por tenant aislado → mitigación: medir y ajustarB. Vector de bypass por tool-calling → mitigación: allow-list estricta.
- **Reversión:** Reabrir endpoints anónimos. Coste: bajo. Riesgo de reversión CRÍTICO (revive F2/F3 + A9).
- **Ruptura de contrato:** `analyze-document`, `knowledge` (GET/POST) ahora requieren auth → breaking (es la remediación). `mode: 'internal'` deja de ser accesible anónimo.
- **Specs:** architecture.spec R8, backend.spec R9/R10, integrations.spec R6, owasp.spec R2/R4, security.spec R3, rag.spec R1/R5/R12, prompt-engineering.spec.
