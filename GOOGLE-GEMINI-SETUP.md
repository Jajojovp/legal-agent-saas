# 🔑 Configuración de Google Gemini API

## ✨ Por qué Google Gemini?

### **CAPA GRATUITA GENEROSA** (Mejor que Anthropic Claude)

| Característica | Google Gemini (Flash) | Anthropic Claude |
|---|---|---|
| **Tier Gratuito** | ✅ 15 requests/min GRATIS | ❌ Solo $5 crédito inicial |
| **Límite Mensual** | ✅ 1,500 requests/día GRATIS | ❌ Pay-as-you-go desde $1 |
| **Costo después** | $0.075 / 1M tokens | $3.00 / 1M tokens |
| **Velocidad** | ⚡ Ultra rápido (Flash) | 🐢 Más lento |
| **Límite de Tokens** | 1M tokens/request | 200k tokens/request |
| **Multimodal** | ✅ Texto, imágenes, audio, video | ⚠️ Solo texto e imágenes |

### **Ventajas para tu Bufete:**

✅ **GRATIS para empezar** - 1,500 conversaciones diarias sin costo  
✅ **40x más barato** que Claude en producción  
✅ **Más rápido** - respuestas instantáneas  
✅ **Sin tarjeta de crédito** requerida para tier gratuito  
✅ **Escalable** - mismo modelo cuando crezcas  

---

## 🚀 Cómo Obtener tu API Key (5 minutos)

### Paso 1: Ir a Google AI Studio

1. Abre tu navegador
2. Ve a: **https://makersuite.google.com/app/apikey**
3. Inicia sesión con tu cuenta de Google (Gmail)

### Paso 2: Crear API Key

1. Haz clic en **"Create API Key"** (botón azul)
2. Selecciona un proyecto de Google Cloud (o crea uno nuevo)
3. Copia la API key que aparece

**La key se ve así:**
```
AIzaSyD-ABC123def456GHI789jklMNO012pqrSTU
```

### Paso 3: Configurar en tu Aplicación

1. Abre el archivo `.env.local` en tu proyecto
2. Pega tu API key:

```bash
GOOGLE_API_KEY=AIzaSyD-ABC123def456GHI789jklMNO012pqrSTU
```

3. Guarda el archivo

### Paso 4: Verificar que Funciona

```bash
# Reinicia el servidor
npm run dev

# Abre http://localhost:3000
# Prueba el chatbot
```

---

## 📊 Límites del Tier Gratuito

### Gemini 1.5 Flash (Usado en esta app)

| Límite | Valor | Suficiente para |
|---|---|---|
| Requests por minuto | 15 | ~900/hora |
| Requests por día | 1,500 | Bufete pequeño (~50 leads/día) |
| Tokens por request | 1,000,000 | Conversaciones largas |
| Multimodal | ✅ Sí | Analizar documentos, imágenes |

### ¿Cuándo Alcanzarás el Límite?

**Escenario Realista para Bufete:**
- 50 leads por día capturados por chatbot
- 5 mensajes promedio por lead
- Total: 250 requests/día

**Conclusión:** El tier gratuito cubre **6x tu volumen** estimado inicialmente.

---

## 💰 Costos Cuando Crezcas

### Pricing de Producción (después del tier gratuito)

**Gemini 1.5 Flash:**
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

**Ejemplo Mensual (1,000 leads):**
- 1,000 leads × 5 mensajes = 5,000 requests
- ~500 tokens promedio por request
- Total: 2.5M tokens
- **Costo: ~$2.50/mes** 🤯

**Comparación vs Claude:**
- Claude Sonnet: $15.00 / 1M tokens
- Mismo volumen = **$37.50/mes**
- **Ahorro: $420/año con Gemini**

---

## 🔐 Seguridad de API Key

### ✅ Buenas Prácticas:

```bash
# NUNCA hagas esto:
const API_KEY = "AIzaSy..." // ❌ En código público

# SIEMPRE haz esto:
const API_KEY = process.env.GOOGLE_API_KEY // ✅ En variable de entorno
```

### Proteger tu Key:

1. **Nunca** la subas a GitHub
2. Usa `.env.local` (ya está en `.gitignore`)
3. En producción, usa variables de entorno de Vercel
4. Rota la key cada 90 días
5. Monitorea uso en Google Cloud Console

---

## 📈 Monitoreo de Uso

### Ver Cuánto Estás Usando:

1. Ve a: **https://console.cloud.google.com**
2. Selecciona tu proyecto
3. Menu → **APIs & Services** → **Dashboard**
4. Busca "Generative Language API"
5. Ve gráficos de uso en tiempo real

### Configurar Alertas:

1. En Google Cloud Console
2. **Billing** → **Budgets & Alerts**
3. Crear presupuesto (ej: $10/mes)
4. Recibir email si te acercas al límite

---

## 🎯 Modelos Disponibles

Esta aplicación usa **Gemini 1.5 Flash** por defecto (recomendado).

### Comparación de Modelos:

| Modelo | Velocidad | Costo | Uso Recomendado |
|---|---|---|---|
| **Gemini 1.5 Flash** | ⚡⚡⚡ | $ | Chatbot, leads (RECOMENDADO) |
| Gemini 1.5 Pro | ⚡⚡ | $$$ | Análisis complejo de docs |
| Gemini 1.0 Pro | ⚡ | $ | Legacy, no recomendado |

### Cambiar de Modelo (si necesitas):

En `lib/ai/legal-ai-service.ts`:

```typescript
// Para más inteligencia (más caro):
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro' 
});

// Para más velocidad (más barato - default):
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash' 
});
```

---

## 🔧 Troubleshooting

### Error: "API key not valid"
```bash
# Solución:
# 1. Verifica que la key esté en .env.local
# 2. Reinicia el servidor: npm run dev
# 3. Verifica que la key no tenga espacios
```

### Error: "Quota exceeded"
```bash
# Llegaste al límite gratuito
# Soluciones:
# 1. Espera al siguiente día (se resetea)
# 2. Habilita billing en Google Cloud
# 3. Optimiza: reduce requests duplicados
```

### Error: "Model not found"
```bash
# Solución:
# Verifica el nombre del modelo en legal-ai-service.ts
# Debe ser: 'gemini-1.5-flash' o 'gemini-1.5-pro'
```

---

## 📞 Soporte

### Documentación Oficial:
- **Google AI Studio:** https://makersuite.google.com
- **API Docs:** https://ai.google.dev/docs
- **Pricing:** https://ai.google.dev/pricing

### Comunidad:
- **Discord:** https://discord.gg/google-ai
- **Stack Overflow:** Tag `google-gemini`
- **GitHub Issues:** En este repositorio

---

## ✅ Checklist de Configuración

Antes de deployar a producción:

- [ ] API key de Google Gemini obtenida
- [ ] `.env.local` configurado con `GOOGLE_API_KEY`
- [ ] Chatbot probado localmente
- [ ] Variables de entorno configuradas en Vercel
- [ ] Monitoreo de uso configurado en Google Cloud
- [ ] Alertas de presupuesto activadas
- [ ] Documentación del equipo actualizada

---

## 🎉 Resumen

**Google Gemini es IDEAL para tu bufete porque:**

1. ✅ **Tier gratuito generoso** - 1,500 requests/día
2. ✅ **40x más barato** que Claude en producción
3. ✅ **Mismo nivel de calidad** para chatbot legal
4. ✅ **Más rápido** - mejor experiencia de usuario
5. ✅ **Sin tarjeta de crédito** para empezar
6. ✅ **Escalable** cuando crezcas

**Costo estimado primer año:**
- Meses 1-3: **$0** (tier gratuito)
- Meses 4-12: **~$30** total
- **Total año 1: $30 vs $450 con Claude**

**¡Empieza gratis hoy y escala cuando lo necesites!**

---

**Última actualización:** Abril 2024  
**Versión de la app:** 1.0.0 con Gemini
