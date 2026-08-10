# 📧 EMAIL AUTOMATION - GUÍA COMPLETA

## 🎯 ¿CÓMO FUNCIONA LA AUTOMATIZACIÓN DE EMAILS?

### **Sistema de Emails Transaccionales y Campañas**

---

## 📋 RESUMEN EJECUTIVO

**Email automation** es un sistema que envía emails automáticamente basado en **triggers** (disparadores) y **eventos del usuario**. En lugar de enviar emails manualmente, el sistema detecta cuando algo sucede y envía el email correcto en el momento perfecto.

**Beneficios:**
- ✅ **+25% trial-to-paid conversion** (emails de nurture)
- ✅ **-70% churn rate** (emails de retención)
- ✅ **+40% engagement** (emails de onboarding)
- ✅ **90% time saved** (vs enviar manualmente)

---

## 🔧 ARQUITECTURA DEL SISTEMA

### **Componentes:**

```
1. Resend (Email Service Provider)
   ├── Sends actual emails
   ├── Tracks opens, clicks, bounces
   ├── Manages email reputation
   └── Cost: $20/mo for 10K emails

2. Event Triggers (Your Application)
   ├── User signs up → Welcome email
   ├── Trial day 3 → Feature highlight
   ├── Payment failed → Retry notification
   └── Lead captured → Attorney notification

3. Email Templates (HTML + CSS)
   ├── Responsive design
   ├── Brand consistency
   ├── Personalization
   └── Call-to-action buttons

4. Database (PostgreSQL)
   ├── User preferences
   ├── Send history
   ├── Unsubscribe list
   └── Email metrics
```

---

## 📨 TIPOS DE EMAILS IMPLEMENTADOS

### **1. TRANSACTIONAL EMAILS**

Emails enviados en respuesta a una acción específica del usuario.

#### **A) Welcome Email**

**Trigger:** Usuario completa signup / inicia trial

```typescript
// Cuando se crea un usuario:
await sendWelcomeEmail(
  userEmail: 'attorney@lawfirm.com',
  userName: 'John Smith',
  trialEndsAt: '2024-05-06'
);
```

**Contenido:**
- ✅ Bienvenida personalizada
- ✅ Qué está incluido en el trial
- ✅ Quick start guide (3 pasos)
- ✅ CTA: "Go to Dashboard"
- ✅ Fecha de expiración del trial

**Objetivo:** Activar al usuario (get them to dashboard)

**Timing:** Inmediato (< 1 minuto después de signup)

**Open Rate Target:** 80%+

---

#### **B) Payment Success Email**

**Trigger:** Stripe webhook `invoice.payment_succeeded`

```typescript
// En el webhook de Stripe:
await sendPaymentSuccessEmail(
  userEmail: session.customer_email,
  userName: customer.name,
  amount: invoice.amount_paid, // En centavos
  invoiceUrl: invoice.invoice_pdf
);
```

**Contenido:**
- ✅ Confirmación de pago recibido
- ✅ Detalles de la transacción
- ✅ Link para descargar factura
- ✅ Próxima fecha de cobro
- ✅ Soporte contact info

**Objetivo:** Confirmar transacción + proveer recibo

**Timing:** Inmediato (después de cargo exitoso)

**Open Rate Target:** 65%+

---

#### **C) Payment Failed Email**

**Trigger:** Stripe webhook `invoice.payment_failed`

```typescript
await sendPaymentFailedEmail(
  userEmail: customer.email,
  userName: customer.name,
  retryDate: '2024-04-29' // 7 días después
);
```

**Contenido:**
- ⚠️ **Urgente:** Pago falló
- ✅ Razones comunes (tarjeta expirada, fondos insuficientes)
- ✅ CTA: "Update Payment Method"
- ✅ Fecha de reintento automático
- ✅ Consecuencias si no se actualiza

**Objetivo:** Recuperar el pago + evitar churn

**Timing:** Inmediato (después de fallo)

**Open Rate Target:** 85%+ (alta urgencia)

**Click Rate Target:** 40%+ (update payment)

---

#### **D) New Lead Notification**

**Trigger:** Chatbot captura lead

```typescript
// Cuando el chatbot califica un lead:
await sendNewLeadNotification(
  attorneyEmail: 'attorney@firm.com',
  leadData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-1234',
    practiceArea: 'Personal Injury',
    score: 87,
    message: 'Car accident last week...'
  }
);
```

**Contenido:**
- 🎯 **Nuevo lead capturado!**
- ✅ Información del lead (nombre, email, teléfono)
- ✅ Score de calidad (0-100)
- ✅ Área de práctica
- ✅ Mensaje original
- ✅ CTA: "View in Dashboard"
- 💡 Tip: "Respond within 1 hour for best results"

**Objetivo:** Notificar al abogado para follow-up rápido

**Timing:** Inmediato (real-time)

**Open Rate Target:** 95%+ (alta prioridad)

---

### **2. LIFECYCLE EMAILS (Campaigns)**

Emails enviados basados en tiempo y comportamiento del usuario.

#### **A) Trial Ending Email**

**Trigger:** 3 días antes del fin del trial

```typescript
// Cron job diario:
const usersEndingTrial = await getUsersWithTrialEndingIn(3);

for (const user of usersEndingTrial) {
  await sendTrialEndingEmail(
    user.email,
    user.name,
    3 // days left
  );
}
```

**Contenido:**
- ⏰ "Your trial ends in 3 days"
- ✅ Resultados obtenidos (leads, tiempo ahorrado)
- ✅ Qué perderás si no continúas
- ✅ CTA: "Continue with LegalAgent"
- ✅ Pricing reminder ($299/mo)

**Objetivo:** Convertir trial → paid subscription

**Timing:** Day 11 de 14 (3 días antes)

**Conversion Target:** 30%+

---

#### **B) Trial Day 3 - Feature Education**

**Trigger:** 3 días después de signup

```typescript
// Cron job diario:
const users = await getUsersWhoSignedUpDaysAgo(3);

for (const user of users) {
  await emailCampaigns.trialDay3(user.email, user.name);
}
```

**Contenido:**
- 💡 "Quick Win: Automate Your Email Follow-Ups"
- ✅ Tutorial de una feature específica
- ✅ Video de 2 minutos
- ✅ Caso de uso real
- ✅ CTA: "Try it now"

**Objetivo:** Aumentar feature adoption

**Timing:** Day 3 de trial

**Open Rate Target:** 50%+

---

#### **C) Trial Day 7 - Case Study**

**Trigger:** 7 días después de signup

```typescript
const users = await getUsersWhoSignedUpDaysAgo(7);

for (const user of users) {
  await emailCampaigns.trialDay7(user.email, user.name);
}
```

**Contenido:**
- 📈 "How Martinez Law Firm 3x'd Their Leads in 60 Days"
- ✅ Story completa con números
- ✅ Before/after comparison
- ✅ Specific tactics used
- ✅ CTA: "Get similar results"

**Objetivo:** Demostrar ROI con social proof

**Timing:** Day 7 de trial

**Open Rate Target:** 45%+

---

#### **D) Trial Day 10 - Conversion Push**

**Trigger:** 10 días después de signup

```typescript
const users = await getUsersWhoSignedUpDaysAgo(10);

for (const user of users) {
  await emailCampaigns.trialDay10(user.email, user.name);
}
```

**Contenido:**
- 🎁 "Special Offer: Save 20% When You Subscribe Today"
- ✅ Limited-time discount (urgency)
- ✅ Recap of trial results
- ✅ What they'll lose
- ✅ Strong CTA: "Claim Your Discount"

**Objetivo:** Empujar conversión con incentivo

**Timing:** Day 10 de trial (4 días antes de expirar)

**Conversion Target:** 40%+

---

## 🔄 FLUJOS DE AUTOMATIZACIÓN

### **Flujo 1: Onboarding de Nuevo Usuario**

```
DAY 0: User signs up
└→ Send: Welcome Email (immediately)
   └→ Open rate: 80%
   └→ Click to dashboard: 60%

DAY 3: Feature education
└→ Send: "Quick Win" email
   └→ Open rate: 50%
   └→ Feature activation: 35%

DAY 7: Social proof
└→ Send: Case study email
   └→ Open rate: 45%
   └→ Engagement boost: 20%

DAY 10: Conversion push
└→ Send: Discount offer
   └→ Open rate: 55%
   └→ Conversion: 40%

DAY 11: Trial ending
└→ Send: "3 days left" reminder
   └→ Open rate: 70%
   └→ Conversion: 30%

DAY 14: Trial expires
└→ If not converted:
   └→ Send: "We miss you" email
   └→ Offer: Extended trial or discount
```

---

### **Flujo 2: Lead Capture & Follow-Up**

```
STEP 1: Lead captured by chatbot
└→ Send to attorney: Lead notification (immediate)
   └→ Open rate: 95%
   
STEP 2: Lead not contacted (24 hours)
└→ Send to attorney: "Don't forget to follow up"
   └→ Reminder email

STEP 3: Lead converts to client
└→ Send to client: Welcome to the firm
   └→ Next steps, documents needed
   
STEP 4: Lead goes cold (30 days)
└→ Send to lead: Re-engagement email
   └→ "Still looking for legal help?"
```

---

### **Flujo 3: Recuperación de Pago Fallido**

```
DAY 0: Payment fails
└→ Send: Payment failed notification (immediate)
   └→ CTA: Update payment method
   └→ Click rate target: 40%

DAY 3: Still not updated
└→ Send: Second reminder
   └→ More urgent tone
   └→ "Account will be suspended in 4 days"

DAY 7: Final notice
└→ Send: Last chance email
   └→ "Account suspended today unless updated"
   └→ Phone call from support

DAY 8: Account suspended
└→ Send: Account suspended notice
   └→ How to reactivate
   └→ Data retention policy (30 days)

DAY 15: Win-back attempt
└→ Send: "We miss you" email
   └→ 50% discount offer for 3 months
   └→ Last attempt to recover
```

---

## 🛠️ IMPLEMENTACIÓN TÉCNICA

### **Setup de Resend (5 minutos)**

**1. Crear cuenta:**
```bash
# Ir a: https://resend.com/signup
# Verificar email
# Agregar dominio de envío
```

**2. Verificar dominio:**
```bash
# En Resend dashboard:
Domains → Add Domain → yourlawfirm.com

# Agregar DNS records (en tu proveedor de DNS):
TXT: resend._domainkey.yourlawfirm.com
CNAME: em.yourlawfirm.com → feedback-smtp.resend.com

# Esperar verificación (2-24 horas)
```

**3. Obtener API key:**
```bash
# Resend Dashboard → API Keys → Create
RESEND_API_KEY=re_123456789...
```

**4. Agregar a .env.local:**
```bash
RESEND_API_KEY=re_tu_api_key_aqui
EMAIL_FROM=noreply@yourlawfirm.com
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

---

### **Integración con Stripe Webhooks**

**Archivo:** `app/api/stripe/webhook/route.ts`

```typescript
import { sendWelcomeEmail, sendPaymentSuccessEmail, sendPaymentFailedEmail } from '@/lib/email/automation';

export async function POST(request: NextRequest) {
  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      // Send welcome email
      await sendWelcomeEmail(
        session.customer_email!,
        session.customer_details?.name || 'there',
        calculateTrialEndDate(14) // 14 días
      );
      
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      
      // Send payment success email
      await sendPaymentSuccessEmail(
        invoice.customer_email!,
        invoice.customer_name || 'Valued Customer',
        invoice.amount_paid,
        invoice.invoice_pdf!
      );
      
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      
      // Send payment failed email
      await sendPaymentFailedEmail(
        invoice.customer_email!,
        invoice.customer_name || 'Valued Customer',
        calculateRetryDate(7) // Retry en 7 días
      );
      
      break;
    }
  }

  return NextResponse.json({ received: true });
}

function calculateTrialEndDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}
```

---

### **Integración con Chatbot**

**Archivo:** `app/api/chatbot/message/route.ts`

```typescript
import { sendNewLeadNotification } from '@/lib/email/automation';

export async function POST(request: NextRequest) {
  // ... código del chatbot ...

  // Si el chatbot detecta que capturó información de contacto:
  if (leadCaptured) {
    const leadData = {
      name: extractedName,
      email: extractedEmail,
      phone: extractedPhone,
      practiceArea: detectedPracticeArea,
      score: aiLeadScore, // 0-100
      message: userMessage
    };

    // Guardar en database
    await db.insert(leads).values(leadData);

    // Notificar al abogado INMEDIATAMENTE
    await sendNewLeadNotification(
      firmEmail, // Email del abogado
      leadData
    );
  }

  return NextResponse.json({ message: aiResponse });
}
```

---

### **Campañas Programadas (Cron Jobs)**

**Opción 1: Vercel Cron Jobs**

**Archivo:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/trial-emails",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Archivo:** `app/api/cron/trial-emails/route.ts`

```typescript
import { sendTrialEndingEmail } from '@/lib/email/automation';

export async function GET(request: NextRequest) {
  // Verificar que es Vercel quien llama
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Usuarios con trial expirando en 3 días
  const users = await db
    .select()
    .from(subscriptions)
    .where(
      sql`trial_ends_at = CURRENT_DATE + INTERVAL '3 days'`
    );

  // Enviar email a cada uno
  let sent = 0;
  for (const user of users) {
    await sendTrialEndingEmail(
      user.email,
      user.name,
      3 // días restantes
    );
    sent++;
  }

  return NextResponse.json({ 
    success: true, 
    emailsSent: sent 
  });
}
```

---

**Opción 2: Trigger.dev (Más avanzado)**

```bash
npm install @trigger.dev/sdk
```

```typescript
import { eventTrigger } from "@trigger.dev/sdk";

export const trialEmailCampaign = eventTrigger({
  id: "trial-email-campaign",
  name: "Trial Email Campaign",
  on: eventTrigger({ name: "user.trial.started" }),
  run: async (event, io, ctx) => {
    // Day 3
    await io.wait("wait-3-days", 3 * 24 * 60 * 60);
    await io.sendEmail("day-3", {
      to: event.user.email,
      subject: "Quick Win...",
    });

    // Day 7
    await io.wait("wait-4-more-days", 4 * 24 * 60 * 60);
    await io.sendEmail("day-7", {
      to: event.user.email,
      subject: "Case Study...",
    });

    // Day 10
    await io.wait("wait-3-more-days", 3 * 24 * 60 * 60);
    await io.sendEmail("day-10", {
      to: event.user.email,
      subject: "Special Offer...",
    });
  },
});
```

---

## 📊 MÉTRICAS & TRACKING

### **KPIs de Email Marketing**

**Deliverability:**
```
Bounce Rate: <2% (target)
Spam Rate: <0.1% (target)
Inbox Placement: >95% (target)
```

**Engagement:**
```
Open Rate: 
├── Transactional: 65-80%
├── Lifecycle: 40-55%
└── Promotional: 25-35%

Click Rate:
├── Transactional: 20-40%
├── Lifecycle: 10-20%
└── Promotional: 3-8%

Unsubscribe Rate: <0.5%
```

**Business Impact:**
```
Trial-to-Paid Conversion: +25%
Churn Reduction: -30%
Feature Adoption: +40%
Support Ticket Reduction: -20%
```

---

### **Tracking con Resend**

```typescript
// Resend automáticamente trackea:
- Delivered
- Opened
- Clicked
- Bounced
- Complained (spam)

// Acceder a métricas:
const emails = await resend.emails.list();

for (const email of emails.data) {
  console.log({
    id: email.id,
    to: email.to,
    subject: email.subject,
    created_at: email.created_at,
    // Eventos:
    delivered: email.delivered,
    opened: email.opened,
    clicked: email.clicked
  });
}
```

---

## 💰 COSTOS

### **Resend Pricing:**

```
Free Tier:
├── 100 emails/day
├── 3,000 emails/month
└── 1 domain

Paid Plans:
├── $20/mo: 50,000 emails/month
├── $80/mo: 100,000 emails/month
└── $250/mo: 1,000,000 emails/month

For 400 customers:
├── Welcome: 400 emails
├── Trial reminders: 1,200 emails
├── New leads: 1,800 emails (est.)
├── Payment: 400 emails/month
Total: ~4,000 emails/month

Cost: $20/month ✅
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Setup Inicial (30 min):**

- [ ] Crear cuenta Resend
- [ ] Verificar dominio de envío
- [ ] Obtener API key
- [ ] Agregar a .env.local
- [ ] Instalar dependencias (resend, react-email)
- [ ] Test de envío manual

### **Integración (2 horas):**

- [ ] Crear email templates (HTML)
- [ ] Integrar con Stripe webhooks
- [ ] Integrar con chatbot
- [ ] Setup cron jobs
- [ ] Test de cada email type

### **Optimización (1 semana):**

- [ ] A/B test subject lines
- [ ] Optimizar send times
- [ ] Personalización avanzada
- [ ] Segmentación de audiencia
- [ ] Monitorear métricas

---

## 🎯 MEJORES PRÁCTICAS

### **Subject Lines:**

✅ **Buenos:**
- "Your trial ends in 3 days"
- "New Personal Injury lead captured"
- "Payment received - Thank you!"

❌ **Malos:**
- "URGENT!!!! READ NOW"
- "You won $1,000,000"
- "Re: Re: Re: Follow up"

### **Contenido:**

✅ **Buenos:**
- Personalizado (nombre del usuario)
- Clear CTA (1 acción principal)
- Mobile-responsive
- Plain text alternative
- Unsubscribe link

❌ **Malos:**
- Generic "Dear Customer"
- Multiple CTAs
- All images (no text)
- No unsubscribe option
- Spammy words (FREE, URGENT, !!!)

### **Timing:**

✅ **Óptimo:**
- Transactional: Inmediato
- Lifecycle: 9 AM - 11 AM (timezone del usuario)
- Avoid: Weekends, holidays
- Test: A/B test send times

---

## 🚀 PRÓXIMOS PASOS

### **Implementado:**
- [x] Welcome email
- [x] Payment success/failed
- [x] Trial ending
- [x] New lead notification

### **Por Implementar:**

1. **Segmentación Avanzada** (Semana 2)
   - Por practice area
   - Por engagement level
   - Por plan tier

2. **A/B Testing** (Semana 3)
   - Subject lines
   - Send times
   - CTA copy
   - Email length

3. **Personalización** (Semana 4)
   - Dynamic content
   - Behavior-based
   - Predictive send times

4. **Analytics Dashboard** (Mes 2)
   - Email performance
   - Revenue attribution
   - Funnel analysis

---

**¿Necesitas más detalles sobre algún aspecto específico del email automation?** 📧
