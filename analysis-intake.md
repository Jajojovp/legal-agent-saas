---
document: analysis-intake
version: 1.0
project: legal-agent-saas
created: 2026-08-05
workflow_phase: análisis
status: aprobado-para-planificación
---

# Analysis Intake — Legal Agent SaaS

## Resumen

Se inicia el Spec Framework para el proyecto local `C:\Users\jairo\Documents\aplicacion abogados\legal-agent-saas`.

- **Tipo de trabajo:** analizar existente; auditoría técnica inicial y gap analysis preparatorio.
- **Objetivo analizado:** repositorio local de un SaaS web de gestión para despachos jurídicos con CRM, casos, chatbot/IA, herramientas legales, pagos y analítica.
- **Estado del intake:** aprobado para pasar a planificación del análisis. La aprobación no equivale a aprobación de producción ni a validación de los claims de seguridad del proyecto.
- **Alcance de este documento:** captura de contexto, evidencia disponible, gaps iniciales, specs/playbooks aplicables, dependencias y riesgos. No se implementan cambios de código.

## Análisis

### 1. Objetivo, usuarios y problema

**Objetivo declarado por el proyecto:** ofrecer a despachos pequeños y medianos de Estados Unidos y Canadá una plataforma SaaS con captación y cualificación de leads mediante IA, CRM/casos, facturación, análisis documental y métricas operativas. La documentación declara una visión de producto “production-ready”, pero esa afirmación queda pendiente de verificación independiente.

**Usuarios y stakeholders identificados:**

| Grupo | Necesidad/contexto | Evidencia |
|---|---|---|
| Abogados y administradores de despachos | Gestionar leads, casos, tareas, facturación y KPIs | `README.md:7-17`, `README.md:247-257` |
| Visitantes/prospectos | Interactuar con chatbot y solicitar una consulta | `README.md:10-14`, `README.md:187-207` |
| Equipo operador/desarrollo | Configurar IA, base de datos, pagos, email y despliegues | `README.md:102-183`, `DEPLOYMENT.md:29-84` |
| Stakeholders de cumplimiento | Proteger datos personales, información legal y posibles datos sensibles | `README.md:307-323`, `SECURITY-AUDIT.md:778-817` |

**Problema declarado/inferido:** los despachos necesitan centralizar captación, seguimiento de asuntos y operaciones administrativas; actualmente el proyecto presenta documentación extensa y funcionalidad aparente, pero faltan evidencias verificables de madurez operativa, cobertura de pruebas, controles de seguridad y trazabilidad de arquitectura.

### 2. Estado actual observado

- **Stack:** Next.js 14.1.4, React 18, TypeScript, Tailwind CSS, Next API Routes/App Router, PostgreSQL, Drizzle ORM, Supabase SSR/client, NextAuth, Google Generative AI, Resend y proveedores de pago (`package.json`, `README.md:31-39`).
- **Frontend/rutas:** páginas localizadas bajo `app/[locale]`, landing, login/register, dashboard, leads, cases, tasks, billing, analytics, blog y herramientas.
- **Backend/API:** rutas para auth, chatbot, leads, casos, tareas, dashboard KPI, análisis documental, knowledge y pagos Mercado Pago/Takenos.
- **Persistencia/IA:** `lib/db/schema.ts`, cliente/migración/seed, servicios de IA y knowledge base; la configuración de Drizzle usa `DATABASE_URL` o `POSTGRES_URL` (`drizzle.config.ts:5-11`).
- **Seguridad declarada:** existe `middleware.ts`, `lib/security/middleware.ts` y `SECURITY-AUDIT.md`; el documento de seguridad contiene contradicciones temporales y varios controles marcados como TODO.
- **Despliegue:** Vercel recomendado, Docker y self-hosted documentados; `vercel.json`, `Dockerfile` y scripts de base de datos presentes.
- **Documentación existente:** README, quickstart, deployment, setup de Supabase/Vercel, Stripe, Gemini, CRM, landing, email y roadmap.
- **Control de versiones:** no se detectó un repositorio Git en la ruta inspeccionada (`git rev-parse` falló); no hay historial local verificable.
- **Pruebas/CI:** no se localizaron archivos de tests del proyecto ni `.github` en el inventario consultado. Debe confirmarse con una revisión exhaustiva posterior excluyendo `node_modules`.
- **ADRs:** no se localizó `docs/adr/`; la arquitectura no tiene decisiones versionadas identificables.
- **Configuración sensible:** existe `.env.local`; su contenido no fue leído ni persistido en el intake.

### 3. Alcance para la fase de análisis

**Incluido:** arquitectura y estructura del repositorio, patrones y calidad, dependencias, APIs e integraciones, persistencia/migraciones, autenticación/autorización, superficie OWASP, privacidad, IA/knowledge base, frontend/i18n/accesibilidad, rendimiento, CI/CD, despliegue, observabilidad, documentación, escalabilidad y gaps trazables a evidencia.

**No incluido en este intake:** implementación o refactor de código, pruebas activas de penetración, acceso a producción, análisis de una URL pública, uso de credenciales, sincronización Notion/Supabase, ni decisión de prioridades de producto.

### 4. Gaps iniciales

Estos son gaps de intake, no un informe final. Se validarán durante el análisis y se marcarán como evidencia o supuesto conforme a `gap-analysis.spec.md`.

| ID | Categoría | Descripción y evidencia | Severidad | Acción para la fase siguiente | Esfuerzo | Spec |
|---|---|---|---|---|---|---|
| ID-GAP-001 | Falta | Falta control de versiones local verificable; `git rev-parse` no detectó `.git`. | CRÍTICO | Registrar/recuperar el origen Git antes de evaluar historial, issues, releases y trazabilidad. | Bajo | `repository-analysis.spec.md` R1/R6; `agent-governance.spec.md` R8 |
| ID-GAP-002 | Falta | No se localizaron tests del proyecto ni pipeline `.github`; la cobertura y gates no están demostrados. | CRÍTICO | Inventariar tests, ejecutar validaciones autorizadas y documentar la ausencia de CI como hallazgo. | Medio | `testing.spec.md` R1-R12; `repository-analysis.spec.md` R3/R5 |
| ID-GAP-003 | Falta | No se localizó `docs/adr/`, aunque el stack, pagos, base de datos y despliegue son decisiones materiales. | MENOR | Crear durante una fase posterior el inventario de decisiones y ADRs faltantes; no implementarlo ahora. | Medio | `architecture.spec.md` R1-R2; `architecture-review.spec.md` R1-R2 |
| ID-GAP-004 | Falta | Migraciones operativas expuestas como `drizzle-kit push`/`db:push`; reversibilidad, backup, RTO y RPO no están demostrados. | CRÍTICO | Revisar historial/esquema/migraciones y documentar estrategia reversible y de backup. | Medio | `database.spec.md` R1-R6; `deployment.spec.md` R5 |
| ID-GAP-005 | Falta | Auth existe en rutas/dependencias, pero `SECURITY-AUDIT.md` la marca como “NOT YET IMPLEMENTED”; estado real no reconciliado. | CRÍTICO | Comparar rutas, sesión, middleware, roles y pruebas con las afirmaciones de documentación. | Medio | `owasp.spec.md` R2/R8; `security.spec.md` R2-R6 |
| ID-GAP-006 | Falta | Integraciones de pagos, IA, email y webhooks requieren verificar firma, idempotencia, timeout, retry y circuit breaker. | CRÍTICO | Auditar cada endpoint y contrato sin invocar proveedores ni usar secretos. | Alto | `integrations.spec.md` R3-R10; `backend.spec.md` R3/R9-R10 |
| ID-GAP-007 | Falta | Para knowledge/RAG no hay evidencia de chunking, embeddings versionados, recuperación híbrida, evaluación reproducible ni citas. | MENOR | Determinar si la funcionalidad actual es RAG; si aplica, inventariar pipeline y artefactos de evaluación. | Medio | `rag.spec.md` R1-R12 |
| ID-GAP-008 | Falta | No se observan SLOs, métricas RED, trazas, dashboards, alertas con runbooks ni evidencia de backups probados. | MENOR | Auditar observabilidad, operación y recuperación antes de cualquier valoración de producción. | Medio | `monitoring.spec.md` R1-R12; `database.spec.md` R5/R11 |
| ID-GAP-009 | Automatizar | Validación de build, lint, SCA/SAST, SBOM y checks de API aparecen descritos manualmente o no evidenciados. | OPORTUNIDAD | Proponer gates automatizados en el plan, sin implementarlos en esta fase. | Medio | `security.spec.md` R6-R7; `owasp.spec.md` R6/R8 |

## Hallazgos

### Hallazgos iniciales de riesgo

| ID | Severidad | Riesgo inicial | Evidencia/estado |
|---|---|---|---|
| RISK-001 | ALTO | El sistema puede procesar datos personales, comunicaciones de clientes y documentos legales sin que privacidad, retención, DPIA, derechos del titular y transferencias estén demostrados. | `README.md:307-323`; `privacy.spec.md` R1-R12. Estado: no verificado. |
| RISK-002 | ALTO | La documentación de seguridad afirma preparación para producción, pero también marca autenticación, autorización/RBAC, sesión y PII como pendientes. | `SECURITY-AUDIT.md:438-440`, `778-817`, `878-895`. Requiere reconciliación con código. |
| RISK-003 | ALTO | Ausencia de Git/CI/tests/ADRs detectada en el inventario inicial reduce trazabilidad y evidencia de calidad. | Resultado de `git`; glob de `.github`, tests y `docs/adr`. |
| RISK-004 | ALTO | `db:push` en scripts de despliegue puede no satisfacer migraciones reversibles y controladas. | `package.json:11-16`; `database.spec.md` R1-R2. |
| RISK-005 | MEDIO | Rate limiting en memoria, según la propia auditoría, no es distribuido y puede fallar con múltiples instancias. | `SECURITY-AUDIT.md:247-354`. Requiere confirmación de uso en runtime. |
| RISK-006 | MEDIO | README, roadmap, deployment y security audit contienen afirmaciones o estados inconsistentes (por ejemplo, Stripe “stub” frente a integración declarada; versiones/fechas antiguas). | `README.md:370-375`; `ROADMAP.md:355-364`; `SECURITY-AUDIT.md:5-7`. |

### Límites de evidencia

- No se leyó `.env.local` ni se expusieron credenciales.
- No se accedió a una URL pública ni se ejecutaron pruebas activas contra un entorno.
- No se ejecutó `npm audit`, build, lint ni pruebas en esta fase; el intake solo registra su necesidad.
- La presencia de archivos se considera evidencia de estructura, no prueba de que el control funcione en producción.

## Recomendaciones

1. Planificar primero un análisis de repositorio local con inventario reproducible y, si existe un remoto, enlazarlo antes de evaluar historial/issues/releases.
2. Reconciliar código frente a `SECURITY-AUDIT.md`, README y ROADMAP; tratar los claims no reproducidos como no verificados.
3. Priorizar autenticación/autorización, privacidad de datos legales, pagos/webhooks e integridad de migraciones antes de cualquier claim de lanzamiento.
4. Preparar una matriz de requisitos y gaps con IDs trazables; no convertir el roadmap existente en backlog sin validación de producto.
5. Mantener la siguiente secuencia: planificación → arquitectura/ADR cuando aplique → implementación → QA → auditoría → entrega, conforme a `workflow.spec.md` R2 y R11.

## Próximos pasos

1. **Planner:** convertir este intake aprobado en un plan de análisis con tareas, dependencias, criterios de aceptación y evidencia esperada.
2. **Code/repository analyst:** producir `analysis-report.md` con las diez áreas obligatorias de `repository-analysis.spec.md` R1.
3. **Security/quality reviewers:** validar OWASP Top 10, autenticación/autorización, secretos, privacidad y claims de `SECURITY-AUDIT.md` sin pruebas activas no autorizadas.
4. **Architect:** levantar límites de componentes, dependencias externas, SPOFs, migraciones, escalabilidad y ADRs faltantes.
5. **QA/validation:** establecer inventario de tests y baseline de build/lint/SCA/SAST cuando el plan autorice su ejecución.
6. **Pendiente de confirmación del usuario:** URL pública y credenciales demo, si se desea aplicar adicionalmente `analyze-saas`; remoto GitHub, si se desea ejecutar el flujo completo de `analyze-github` con metadatos/issues.

## Specs aplicables

La selección se realizó leyendo `domain`, `applies_to` y `mandatory` del frontmatter, y cruzándolos con el alcance observado:

| Spec | Dominio | Applies_to | Motivo de aplicación |
|---|---|---|---|
| `00-core/workflow.spec.md` | 00-core | all | Workflow obligatorio y intake previo. |
| `00-core/quality-standards.spec.md` | 00-core | all | Estándares para análisis, seguridad, accesibilidad, SEO y calidad. |
| `00-core/agent-governance.spec.md` | 00-core | all | Formato, trazabilidad y análisis primero. |
| `01-project/project-definition.spec.md` | 01-project | project-manager, business-analyst, executive-orchestrator | Objetivo, usuarios, problema, alcance, tecnologías, restricciones y roadmap. |
| `01-project/requirements.spec.md` | 01-project | business-analyst, project-manager, architect, developer, quality-reviewer | Requisitos y trazabilidad posteriores. |
| `02-analysis/repository-analysis.spec.md` | 02-analysis | code-analyst, security-analyst, architect, quality-reviewer | Repositorio local de código; se adapta el playbook GitHub al clon local. |
| `02-analysis/gap-analysis.spec.md` | 02-analysis | business-analyst, architect, code-analyst, quality-reviewer, executive-orchestrator | Clasificación y trazabilidad de gaps iniciales. |
| `02-analysis/application-analysis.spec.md` | 02-analysis | code-analyst, security-analyst, architect, seo-analyst, ux-analyst | Solo si se aporta URL pública; queda condicionada. |
| `03-architecture/architecture.spec.md` | 03-architecture | software-architect, full-stack-engineer | Revisión de límites, ADRs y arquitectura modular. |
| `03-architecture/backend.spec.md` | 03-architecture | software-architect, full-stack-engineer, ai-engineer | APIs, mutaciones, idempotencia, errores, observabilidad y dependencias. |
| `03-architecture/integrations.spec.md` | 03-architecture | software-architect, integration-engineer, ai-engineer | IA, email, pagos y webhooks. |
| `03-architecture/database.spec.md` | 03-architecture | software-architect, database-administrator, data-engineer | PostgreSQL/Drizzle, migraciones, backup y crecimiento. |
| `03-architecture/frontend.spec.md` | 03-architecture | software-architect, full-stack-engineer, ux-ui-designer | App Router, i18n, UI, accesibilidad y performance. |
| `05-ai/rag.spec.md` | 05-ai | ai-engineer, data-engineer | Aplicable condicionalmente a knowledge base/RAG. |
| `05-ai/prompt-engineering.spec.md` | 05-ai | ai-engineer, all | Prompts y servicios de IA; se auditarán instrucciones y versionado. |
| `09-security/security.spec.md` | 09-security | security-engineer, all | Línea base de seguridad y secretos. |
| `09-security/privacy.spec.md` | 09-security | security-engineer, business-analyst | Datos personales, legales y posibles datos sensibles. |
| `09-security/owasp.spec.md` | 09-security | security-engineer, full-stack-engineer, qa-engineer | Superficie web/API externa. |
| `10-testing/testing.spec.md` | 10-testing | qa-engineer, full-stack-engineer | Baseline de pruebas y cobertura. |
| `10-testing/audit.spec.md` | 10-testing | validation-audit-engineer, security-engineer | Auditoría independiente posterior, no ejecutada aún. |
| `11-operations/deployment.spec.md` | 11-operations | devops-engineer | Vercel/Docker/self-hosted y rollback. |
| `11-operations/monitoring.spec.md` | 11-operations | devops-engineer, support-monitoring | SLO, RED, logs, trazas y alertas. |
| `13-documentation/technical-doc.spec.md` | 13-documentation | full-stack-engineer, software-architect | ADRs, runbooks, API/OpenAPI y diagramas. |
| `14-review/architecture-review.spec.md` | 14-review | software-architect, quality-reviewer | Revisión de arquitectura y release; no aprobación todavía. |

## Playbooks relevantes

| Playbook | Estado | Aplicación |
|---|---|---|
| `analyze-github.playbook.md` | Seleccionado, adaptado | El objetivo es un repositorio local; se ejecutarán inventario, dependencias, arquitectura, calidad, seguridad, CI/CD y documentación. Los pasos que requieren GitHub MCP/token quedan condicionados a disponer de remoto y credenciales. |
| `analyze-saas.playbook.md` | Condicional | Solo corresponde al análisis de una aplicación SaaS viva; falta URL base y credenciales demo. No se ejecuta en este intake. |
| `security-audit.playbook.md` | Derivación recomendada | Aplicar tras el análisis inicial para validar los claims de seguridad, siempre con alcance autorizado. |
| `performance-audit.playbook.md` | Derivación recomendada | Aplicar si el baseline revela problemas de Core Web Vitals, API o carga. |
| `deploy-production.playbook.md` | Fuera del alcance actual | Relevante solo al preparar un despliegue real; no se despliega ahora. |

## Dependencias y supuestos

### Dependencias

- Node.js `>=18`, npm y dependencias instaladas; versiones y scripts en `package.json`.
- PostgreSQL accesible mediante `DATABASE_URL` o `POSTGRES_URL` para validar esquema/migraciones; no se usará sin autorización y credenciales válidas.
- Proveedores externos potenciales: Google Gemini, Supabase, Resend, Mercado Pago, Takenos y Stripe.
- Para un análisis SaaS vivo: URL HTTPS, cuenta demo y MCP Playwright/skill SEO disponibles.
- Para flujo GitHub completo: remoto del repositorio, URL y `GITHUB_TOKEN` de solo lectura; no se asumen.

### Supuestos

- El directorio inspeccionado es la fuente de trabajo actual y no necesariamente el origen Git canónico.
- Las funcionalidades y controles declarados en la documentación son hipótesis hasta contrastarlos con código y ejecución.
- El producto puede procesar PII y documentos jurídicos; por prudencia se aplican security/privacy specs aunque la jurisdicción final no esté confirmada.
- El análisis posterior será pasivo y autorizado; cualquier prueba activa, acceso a producción o uso de terceros requerirá alcance explícito.

### Decisión de aprobación del intake

**Aprobado para pasar a planificación**, conforme a `specs/00-core/workflow.spec.md` R4, porque la intención, el objetivo, el estado actual, los gaps y los specs/playbooks aplicables están identificados. La planificación debe mantener como bloqueantes de análisis los riesgos `RISK-001` a `RISK-004` y no puede interpretar esta aprobación como autorización de release o de cambios de código.
