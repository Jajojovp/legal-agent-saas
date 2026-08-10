# Plan Integral de Auditoría y Remediación — Legal Agent SaaS

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auditar, corregir errores críticos de seguridad, estabilizar la plataforma y alinear el código con la documentación.

**Architecture:** El proyecto es un SaaS Next.js 14 App Router con i18n (en/es), pagos multi-proveedor (MercadoPago + LemonSqueezy), IA (Google Gemini) y base de datos PostgreSQL vía Drizzle ORM. Actualmente el frontend opera con datos mock, la autenticación no existe, los webhooks de pago tienen bypass de firma, y hay código muerto + rutas duplicadas.

**Tech Stack:** Next.js 14.1, TypeScript 5, Tailwind CSS, Drizzle ORM 0.30, PostgreSQL (postgres.js), Google Gemini AI, MercadoPago + LemonSqueezy, next-intl, Radix UI/shadcn.

---

## Hallazgos Resumidos (de la auditoría)

### CRÍTICOS (Fase 1 - Día 1)
| ID | Problema | Archivos |
|---|---|---|
| C1 | **Autenticación inexistente** — login/register son redirects sin crear sesión; next-auth instalado pero sin implementar | `app/[locale]/login/page.tsx`, `app/[locale]/register/page.tsx`, `middleware.ts` |
| C2 | **API routes sin protección** — GET /api/leads expone PII de cualquier firma; PATCH permite mass-assignment | `app/api/leads/route.ts`, `app/api/leads/qualify/route.ts`, `app/api/chatbot/message/route.ts` |
| C3 | **Webhook MP: verificación de firma OPCIONAL** — si falta `MP_WEBHOOK_SECRET`, cualquiera crea suscripciones falsas | `app/api/payments/mercadopago/webhook/route.ts` |
| C4 | **Webhook LS: secret por defecto `''`** — HMAC con clave vacía computable | `lib/payments/lemonsqueezy.ts:134` |
| C5 | **Multi-tenancy roto** — `firmId` viene del cliente, no de la sesión; no hay verificación de pertenencia | `app/api/leads/route.ts`, `app/api/chatbot/message/route.ts` |
| C6 | **Dashboard público** — cualquier anónimo accede a `/dashboard` o `/es/dashboard` | `middleware.ts` (no protege rutas) |
| C7 | **Modo "internal" del copiloto accesible sin auth** | `app/api/chatbot/message/route.ts` |

### ALTOS (Fase 2)
| ID | Problema | Archivos |
|---|---|---|
| A1 | **`lib/security/middleware.ts` código muerto** — 0 imports en toda la app; SECURITY-AUDIT.md miente | Todo `lib/security/`, `middleware.ts`, `next.config.js` |
| A2 | **`lib/email/automation.ts` código muerto** — 5 plantillas completas nunca importadas ni disparadas | `lib/email/automation.ts` |
| A3 | **NaN en webhooks** — `parseInt('anonymous') = NaN`, `amount` desde campo incorrecto | `app/api/payments/mercadopago/webhook/route.ts`, `app/api/payments/lemonsqueezy/webhook/route.ts` |
| A4 | **Árbol duplicado** — `app/(dashboard)/` + `app/sales/` vs `app/[locale]/(dashboard)/` + `app/[locale]/sales/`; versiones divergentes | 9 archivos duplicados |
| A5 | **Chatbot sin i18n** — widget hardcodeado en inglés, no envía locale al backend | `components/chatbot/chat-widget.tsx`, `lib/ai/legal-ai-service.ts` |
| A6 | **Chatbot no montado en landing/ventas** — el caso de uso principal (captación leads) no tiene chatbot | `app/[locale]/page.tsx`, `app/[locale]/sales/page.tsx` |
| A7 | **Dashboard 100% mock data** — ninguna página consume las APIs reales | 8 páginas del dashboard |
| A8 | **Docker build roto** — falta `output: 'standalone'` en next.config.js | `next.config.js`, `Dockerfile` |
| A9 | **Prompt injection sin mitigación** — input de usuario directo al LLM | `lib/ai/legal-ai-service.ts` |
| A10 | **Clave `auth.backToHome` inexistente** — se renderiza literal en login/register | `messages/en.json`, `messages/es.json` |

### MEDIOS (Fase 3)
| ID | Problema | Archivos |
|---|---|---|
| M1 | **Zod instalado sin uso** — 0 validaciones con zod; validación manual frágil | Todo `app/api/` |
| M2 | **12 de 16 tablas DB sin uso** — casos, tasks, documents, timeEntries, invoices, etc. son datos mock | `lib/db/schema.ts` |
| M3 | **Cero índices secundarios** en DB; `verificationTokens` sin PK | `lib/db/schema.ts` |
| M4 | **Documentación desactualizada** — README, STRIPE-SETUP, QUICKSTART, LANDING-PAGE, DEPLOYMENT, EMAIL-AUTOMATION-GUIDE, CHANGELOG-GEMINI, setup.sh | Múltiples archivos |
| M5 | **Vulnerabilidades npm** — 36 (2 low, 11 moderate, 20 high, 3 critical) | `package.json` |
| M6 | **ESLint sin configurar** — `next lint` pide setup interactivo | Falta `.eslintrc.*` |
| M7 | **Links internos rotos** — `/dashboard/leads/new`, `/dashboard/cases/new`, etc. | Páginas del dashboard |
| M8 | **Script embebible `/chatbot.js` prometido no existe** | `public/` |

### BAJOS (Fase 4)
| ID | Problema |
|---|---|
| B1 | `console.log` en webhooks con payloads de pago |
| B2 | Accesibilidad: chat-textarea sin aria-label, botones icono sin aria-label, login/register sin htmlFor |
| B3 | `sessionId` con `Math.random()` y sin persistencia (localStorage) |
| B4 | `onKeyPress` deprecado en chat-widget |
| B5 | Dependencias muertas: `openai`, `recharts`, `react-email`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `mercadopago`, `@lemonsqueezy/lemonsqueezy.js`, `@vercel/postgres`, `date-fns` |
| B6 | CSP con `unsafe-inline`/`unsafe-eval` |
| B7 | `EMAIL_FROM` ausente de `.env.example`; vars obsoletas (`POSTGRES_PRISMA_URL`, `STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`, etc.) en `.env.example` y docs |

---

## Plan de Tareas

---

### Fase 1 — Día 1: Seguridad y Autenticación

---

### Task 1: Implementar NextAuth

**Files:**
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `app/api/auth/[...nextauth]/auth-options.ts`
- Modify: `app/[locale]/login/page.tsx`
- Modify: `app/[locale]/register/page.tsx` (redirect a login después de registro real)
- Modify: `components/ui/button.tsx` (verificar si necesita spinner state)
- Modify: `messages/en.json`, `messages/es.json` (añadir claves auth faltantes)
- Test: Manual — login flow completo

- [ ] **Step 1: Crear `auth-options.ts` con configuración NextAuth**

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { compare } from 'bcryptjs';
import type { Adapter } from 'next-auth/adapters';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.email, credentials.email),
        });
        if (!user?.hashedPassword) return null;
        const isValid = await compare(credentials.password, user.hashedPassword);
        if (!isValid) return null;
        return { id: user.id.toString(), email: user.email, name: user.name };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login', newUser: '/register' },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
};
```

- [ ] **Step 2: Crear `route.ts` para NextAuth handler**

```typescript
import NextAuth from 'next-auth';
import { authOptions } from './auth-options';
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 3: Actualizar `login/page.tsx`** — usar `signIn` de next-auth, eliminar demo redirect

```typescript
'use client';
import { signIn } from 'next-auth/react';
// ... mantener UI, cambiar handleSubmit a:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  const result = await signIn('credentials', {
    email: form.email,
    password: form.password,
    redirect: false,
  });
  setLoading(false);
  if (result?.ok) router.push('/dashboard');
  else setError('Invalid credentials');
};
```

- [ ] **Step 4: Actualizar `register/page.tsx`** — crear usuario via API, luego signIn automático o redirect a login

Verificar que `POST /api/auth/register` (o lógica inline) cree usuario con bcrypt y lo persista en DB.

- [ ] **Step 5: Agregar claves `auth` faltantes a `messages/en.json` y `messages/es.json`**

Añadir `auth.backToHome` en ambos archivos si no existe, o eliminar su uso en login/register.

- [ ] **Step 6: Verificar que las tablas NextAuth tienen PK/unique correctos en `schema.ts`**

Modificar `verificationTokens` para que tenga PK compuesta `(identifier, token)` y `accounts` tenga unique compuesto `(provider, providerAccountId)`.

---

### Task 2: Proteger middleware y rutas API

**Files:**
- Modify: `middleware.ts` — añadir verificación de sesión
- Modify: `app/api/leads/route.ts` — añadir `getServerSession`
- Modify: `app/api/leads/qualify/route.ts`
- Modify: `app/api/payments/mercadopago/checkout/route.ts`
- Modify: `app/api/payments/lemonsqueezy/checkout/route.ts`
- Modify: `app/api/payments/mercadopago/webhook/route.ts`
- Modify: `app/api/payments/lemonsqueezy/webhook/route.ts`
- Create: `lib/auth/session.ts` — helper para obtener sesión + firmId

- [ ] **Step 1: Crear helper `lib/auth/session.ts`**

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return { userId: parseInt(session.user.id), session };
}
```

- [ ] **Step 2: Actualizar `middleware.ts` para proteger dashboard**

```typescript
import { withAuth } from 'next-auth/middleware';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

const authMiddleware = withAuth(
  (req) => intlMiddleware(req),
  {
    callbacks: {
      authorized({ token }) {
        // Proteger solo rutas del dashboard
        return !!token;
      },
    },
  }
);

export default function middleware(req: NextRequest) {
  const isDashboard = req.nextUrl.pathname.match(/\/(en|es)?\/?dashboard/);
  if (isDashboard) return (authMiddleware as any)(req);
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/', '/(en|es)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

- [ ] **Step 3: Añadir `requireAuth()` a cada API route (menos chatbot público)**

En `/api/leads/route.ts`, `/api/leads/qualify/route.ts`, `/api/payments/*/checkout/route.ts`:

```typescript
import { requireAuth } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const { userId } = await requireAuth();
  // ... usar userId en vez de firmId del query
}
```

- [ ] **Step 4: Enrutar `/api/chatbot/message` POST público pero GET protegido**

POST queda público (es para captación de leads). Agregar rate limiting (ver Task 3.1). GET requiere auth.

- [ ] **Step 5: Derivar `firmId` de la sesión, no del request**

En todas las queries de DB, usar `firmId` obtenido de la sesión o de una relación user→firm.

---

### Task 3: Fix webhooks — firma obligatoria + bugs

**Files:**
- Modify: `app/api/payments/mercadopago/webhook/route.ts`
- Modify: `lib/payments/mercadopago.ts`
- Modify: `app/api/payments/lemonsqueezy/webhook/route.ts`
- Modify: `lib/payments/lemonsqueezy.ts`

- [ ] **Step 1: Hacer verificación de firma OBLIGATORIA en MP**

En `webhook/route.ts`: si `process.env.MP_WEBHOOK_SECRET` falta, devolver 500 con error de configuración (no aceptar el webhook). Validación HMAC debe ejecutarse siempre.

- [ ] **Step 2: Hacer verificación OBLIGATORIA en LS**

En `lib/payments/lemonsqueezy.ts`: si `LEMONSQUEEZY_WEBHOOK_SECRET` está vacía o ausente, rechazar con 500.

- [ ] **Step 3: Corregir `transaction_amount` en MP**

Los eventos de MP solo envían `data.id`; hay que consultar la API de MP para obtener el monto real.

```typescript
// En lugar de body.data?.transaction_amount:
const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
  headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
});
const paymentData = await paymentResponse.json();
const amount = paymentData.transaction_amount;
```

- [ ] **Step 4: Corregir `parseInt('anonymous')` → NaN**

En checkout, obtener userId de la sesión real. Si es checkout anónimo (no autenticado), rechazar con 401.

- [ ] **Step 5: Corregir `subscriptionId: null` en LS payment_success**

Hacer el lookup: `subscriptionId` debe obtenerse de la suscripción asociada al evento.

- [ ] **Step 6: Agregar idempotencia en ambos webhooks**

Verificar `providerPaymentId` duplicado en `paymentHistory` antes de insertar. Usar `UNIQUE` en la columna.

- [ ] **Step 7: Eliminar `console.log` de payloads de pago**

Reemplazar con logger estructurado o eliminar.

---

### Task 4: Prevenir mass-assignment + validar inputs

**Files:**
- Create: `lib/validations.ts`
- Modify: `app/api/leads/route.ts`
- Modify: `app/api/leads/qualify/route.ts`
- Modify: `app/api/chatbot/message/route.ts`

- [ ] **Step 1: Crear `lib/validations.ts` con schemas Zod**

```typescript
import { z } from 'zod';

export const leadCreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().optional(),
  practiceArea: z.string().optional(),
  caseDescription: z.string().optional(),
  source: z.string().optional(),
  // firmId NO incluido — se deriva de la sesión
});

export const leadUpdateSchema = leadCreateSchema.partial().extend({
  id: z.number(),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'lost']).optional(),
  score: z.number().min(0).max(100).optional(),
});

export const chatbotMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
  context: z.object({
    firmName: z.string().optional(),
    practiceAreas: z.array(z.string()).optional(),
    locale: z.enum(['en', 'es']).optional(),
    mode: z.enum(['public', 'internal']).optional(),
  }).optional(),
});
```

- [ ] **Step 2: Aplicar schemas en endpoints**

En `PATCH /api/leads`: eliminar `...updates` (spread del body). Solo actualizar campos permitidos por `leadUpdateSchema`. Nunca permitir cambiar `firmId`.

```typescript
const parsed = leadUpdateSchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
const { id, ...updates } = parsed.data;
// updates no contiene firmId porque no está en el schema
await db.update(leads).set(updates).where(eq(leads.id, id));
```

---

### Fase 2 — Día 2-3: Core Stability & Data Integrity

---

### Task 5: Eliminar árbol duplicado raíz

**Files:**
- Delete: `app/(dashboard)/` (directorio completo, 8 archivos)
- Delete: `app/sales/page.tsx`
- Modify: `app/layout.tsx` — restaurar `<html>`/`<body>` correctos
- Verify: `next build` no rompe

- [ ] **Step 1: Verificar que `app/[locale]/` tree cubre todas las rutas**
- [ ] **Step 2: Eliminar `app/(dashboard)/dashboard/*` y `app/(dashboard)/layout.tsx`**
- [ ] **Step 3: Eliminar `app/sales/page.tsx`**
- [ ] **Step 4: Actualizar `app/layout.tsx`** con `<html>`/`<body>` correctos y metadata
- [ ] **Step 5: Ejecutar `next build` y verificar que no hay errores**

---

### Task 6: Conectar dashboard a APIs reales

**Files:**
- Modify: `app/[locale]/(dashboard)/dashboard/page.tsx` — KPIs desde API
- Modify: `app/[locale]/(dashboard)/dashboard/leads/page.tsx` — leads desde DB
- Modify: `app/[locale]/(dashboard)/dashboard/cases/page.tsx`
- Create: `app/api/cases/route.ts` (GET)
- Create: `app/api/tasks/route.ts` (GET)
- Create: `app/api/dashboard/kpi/route.ts`

**Nota:** Esta tarea es grande. Dependiendo del tiempo disponible, puede priorizarse solo leads + dashboard KPIs como MVP real, dejando cases/tasks/analytics/billing como mock data con disclaimer visible.

- [ ] **Step 1: Crear `GET /api/dashboard/kpi`** que devuelva conteos reales de leads, casos, tareas, ingresos del período (desde DB)
- [ ] **Step 2: Conectar `dashboard/page.tsx`** para consumir `/api/dashboard/kpi` con fetch o React Query
- [ ] **Step 3: Crear `GET /api/cases`** con filtros por firmId (de la sesión)
- [ ] **Step 4: Crear `GET /api/tasks`** con filtros por firmId
- [ ] **Step 5: Conectar páginas del dashboard** para usar fetch real con loading/error states

---

### Task 7: Revisar y cablear seguridad y emails

**Files:**
- Modify: `next.config.js` — añadir `output: 'standalone'` y security headers reales
- Modify: `middleware.ts` — añadir security headers via middleware
- Decide: mantener o eliminar `lib/security/middleware.ts`
- Decide: mantener o eliminar `lib/email/automation.ts`

- [ ] **Step 1: Añadir `output: 'standalone'` a `next.config.js`** para Docker
- [ ] **Step 2: Decidir destino de `lib/security/middleware.ts`** — si se va a usar, cablear a middleware.ts; si no, eliminar archivo y actualizar SECURITY-AUDIT.md
- [ ] **Step 3: Añadir security headers reales** via middleware o next.config.js headers()

```javascript
// next.config.js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
    ],
  }];
},
```

- [ ] **Step 4: Decidir destino de `lib/email/automation.ts`** — si se va a usar, cablear en webhooks (payment success, new lead, etc.) y agregar cron para trial emails; si no, eliminar archivo

---

### Task 8: i18n y Chatbot

**Files:**
- Modify: `components/chatbot/chat-widget.tsx` — añadir `useTranslations`
- Modify: `lib/ai/legal-ai-service.ts` — recibir y usar locale
- Modify: `app/[locale]/page.tsx` — montar chatbot en landing
- Modify: `app/[locale]/sales/page.tsx` — montar chatbot en ventas
- Modify: `app/[locale]/(dashboard)/dashboard/cases/page.tsx`
- Modify: `app/[locale]/(dashboard)/dashboard/billing/page.tsx`
- Modify: `app/[locale]/(dashboard)/dashboard/analytics/page.tsx`
- Modify: `app/[locale]/(dashboard)/dashboard/messages/page.tsx`
- Modify: `app/[locale]/(dashboard)/dashboard/settings/page.tsx`

- [ ] **Step 1: Internacionalizar `chat-widget.tsx`** — reemplazar strings hardcodeados con `t('chatbot.greeting')`, etc. Enviar `locale` en context al backend.
- [ ] **Step 2: Actualizar `legal-ai-service.ts`** para usar `context.locale` en el system prompt
- [ ] **Step 3: Montar chatbot en landing y sales** — importar `<ChatWidget mode="public" />`
- [ ] **Step 4: Traducir páginas del dashboard** que están en inglés hardcoded (billing, analytics, messages, settings). Usar `useTranslations('dashboard')`

---

### Fase 3 — Día 4-5: Calidad y Documentación

---

### Task 9: DB Schema — índices, PKs, limpieza

**Files:**
- Modify: `lib/db/schema.ts`

- [ ] **Step 1: Añadir PK compuesta a `verificationTokens`**
- [ ] **Step 2: Añadir unique compuesto a `accounts`** en `(provider, providerAccountId)`
- [ ] **Step 3: Añadir índices** a `leads.firmId`, `cases.firmId`, `tasks.firmId`, `chatConversations.firmId`, `subscriptions.userId`, `paymentHistory.subscriptionId`
- [ ] **Step 4: Cambiar columnas `text` libres a enums** donde corresponda (`users.role`, `tasks.priority`, `paymentHistory.status`, `chatConversations.outcome`)

---

### Task 10: Limpiar dependencias y código muerto

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Identificar dependencias sin uso en todo el código** (ver auditoría — al menos 12 paquetes)
- [ ] **Step 2: Eliminar del `package.json`** y ejecutar `npm uninstall` por cada una
- [ ] **Step 3: Eliminar código muerto** en `lib/ai/legal-ai-service.ts` (funciones nunca llamadas) y `lib/email/automation.ts` si se decide no usarlo
- [ ] **Step 4: Eliminar funciones no usadas** de `lib/utils.ts`

---

### Task 11: Script embebible de chatbot

**Files:**
- Create: `public/chatbot.js` o `app/api/chatbot/widget/route.ts`

- [ ] **Step 1: Crear script embebible** que cargue el widget de chat desde un CDN/endpoint
- [ ] **Step 2: Documentar** en README el snippet de embebido

**Nota:** Esta tarea requiere un análisis más profundo de cómo hacer el widget renderizable desde un script externo. Alternativa: crear un iframe embebible.

---

### Task 12: Actualizar documentación

**Files:**
- Modify: `README.md` — corregir endpoints, env vars, eliminar promesas falsas
- Modify: `.env.example` — agregar `EMAIL_FROM`, eliminar vars obsoletas
- Modify: `setup.sh` — actualizar prompts (Gemini en vez de Anthropic)
- Modify: `DEPLOYMENT.md` — Docker comandos verificados
- Modify: `QUICKSTART.md` — pasos reales
- Delete/Archive: `STRIPE-SETUP.md` (Stripe no existe en el código)
- Delete/Archive: `EMAIL-AUTOMATION-GUIDE.md` (si el código muerto se elimina)
- Update: `SECURITY-AUDIT.md` — reflejar estado real post-remediación

- [ ] **Step 1: Revisar y corregir README.md**
- [ ] **Step 2: Limpiar `.env.example`**
- [ ] **Step 3: Actualizar setup.sh y DEPLOYMENT.md**
- [ ] **Step 4: Archivar o eliminar documentación obsoleta**
- [ ] **Step 5: Actualizar SECURITY-AUDIT.md**

---

### Fase 4 — Día 6: Deuda Técnica

---

### Task 13: ESLint + npm audit fix

**Files:**
- Create: `.eslintrc.json`

- [ ] **Step 1: Crear `.eslintrc.json`**

```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

- [ ] **Step 2: Ejecutar `npm audit fix`** y evaluar roturas
- [ ] **Step 3: Corregir `console.log`** en webhooks (reemplazar por logger o eliminar)

---

### Task 14: Accesibilidad

**Files:**
- Modify: `components/chatbot/chat-widget.tsx`
- Modify: `app/[locale]/(dashboard)/layout.tsx`
- Modify: `app/[locale]/login/page.tsx`
- Modify: `app/[locale]/register/page.tsx`

- [ ] **Step 1: Añadir `aria-label`** a botones de icono (X, send, menu, bell)
- [ ] **Step 2: Añadir `aria-label` o `<label>`** al textarea del chat
- [ ] **Step 3: Corregir `htmlFor`/`id`** en login/register
- [ ] **Step 4: Reemplazar `onKeyPress`** con `onKeyDown` en chat-widget

---

### Task 15: Rate limiting + mejoras menores

**Files:**
- Modify: `middleware.ts` o crear `app/api/middleware.ts` — rate limit básico

- [ ] **Step 1: Implementar rate limiting en memoria** para endpoints públicos (chatbot POST, login) — usar `lib/security/middleware.ts` o instalar `ioredis`
- [ ] **Step 2: Persistir `sessionId`** del chatbot en `localStorage`
- [ ] **Step 3: Eliminar imports huérfanos** en `app/[locale]/page.tsx` (WordsPullUpMultiStyle, CheckoutButton)

---

### Task 16: Verificación final

- [ ] **Step 1: Ejecutar `npx tsc --noEmit`** — 0 errores
- [ ] **Step 2: Ejecutar `npm run lint`** — 0 errores
- [ ] **Step 3: Ejecutar `npm run build`** — build exitoso
- [ ] **Step 4: Probar flujo completo localmente** — registro → login → dashboard → crear lead → checkout → webhook

---

## Resumen de severidad y esfuerzo

| Fase | Tareas | Severidad | Esfuerzo estimado |
|---|---|---|---|
| Fase 1 | Tasks 1-4 | CRÍTICO | 2-3 días |
| Fase 2 | Tasks 5-8 | ALTO | 2-3 días |
| Fase 3 | Tasks 9-12 | MEDIO | 1-2 días |
| Fase 4 | Tasks 13-16 | BAJO | 1 día |

**Total estimado: 6-9 días para implementación completa.**

## Recomendación de orden de ejecución

1. **Task 1 (NextAuth)** es prerequisito de casi todo lo demás — hacer primero.
2. **Task 3 (Webhooks)** debe hacerse antes de aceptar pagos reales.
3. **Task 4 (Validación)** es rápida y protege contra mass-assignment.
4. **Task 2 (Middleware)** puede hacerse en paralelo con Task 1.
5. **Task 5 (Duplicados)** es riesgosa (borrar archivos) — hacer con cuidado.
6. **Tasks 9-16** son independientes y pueden paralelizarse.

## Glosario de archivos clave

| Ruta | Propósito |
|---|---|
| `app/api/auth/[...nextauth]/auth-options.ts` | Configuración compartida de NextAuth |
| `app/api/auth/[...nextauth]/route.ts` | Handler HTTP de NextAuth |
| `lib/auth/session.ts` | Helpers `getAuthSession()`, `requireAuth()` |
| `lib/validations.ts` | Schemas Zod para todos los endpoints |
| `lib/db/schema.ts` | Schema Drizzle ORM (16 tablas) |
| `lib/payments/mercadopago.ts` | Integración MercadoPago (fetch crudo + HMAC) |
| `lib/payments/lemonsqueezy.ts` | Integración LemonSqueezy (fetch crudo + HMAC) |
| `lib/ai/legal-ai-service.ts` | Servicio Google Gemini (5 funciones exportadas, 2 usadas) |
| `lib/security/middleware.ts` | Código muerto — funciones de seguridad nunca importadas |
| `lib/email/automation.ts` | Código muerto — plantillas de email nunca llamadas |
| `lib/utils.ts` | Utilidades varias (cn, formatCurrency, generadores) |
| `lib/db/index.ts` | Conexión a PostgreSQL con postgres.js |
| `components/chatbot/chat-widget.tsx` | Widget de chat flotante |
| `components/payment/checkout-button.tsx` | Botón de checkout multi-proveedor |
| `middleware.ts` | Middleware de i18n (y próximamente auth + security headers) |
| `next.config.js` | Config Next.js (próximamente + standalone + security headers) |
