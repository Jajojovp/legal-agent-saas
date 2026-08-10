# Setup Deploy en Vercel con Neon PostgreSQL

## Requisitos previos
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [GitHub](https://github.com)
- Proyecto funcionando localmente

## Paso 1: Push a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/legal-agent-saas.git
git push -u origin main
```

## Paso 2: Importar proyecto en Vercel
1. Ve a [vercel.com/new](https://vercel.com/new)
2. Selecciona el repositorio `legal-agent-saas`
3. Vercel detectara automaticamente Next.js
4. El `vercel.json` ya esta configurado en el proyecto

## Paso 3: Crear Neon DB en Storage
1. En el dashboard de Vercel, ve a la pestaña **Storage**
2. Selecciona **Neon** (PostgreSQL serverless)
3. Plan gratuito: **0.5 GB** de almacenamiento, branches ilimitados
4. Haz clic en **Create**
5. Vercel creara automaticamente las variables de entorno:
   - `POSTGRES_URL` (con pooling, para serverless)
   - `POSTGRES_URL_NON_POOLING` (sin pooling, para migraciones)
   - `POSTGRES_PRISMA_URL`
6. Selecciona los entornos (Production, Preview, Development)
7. Haz clic en **Connect**

## Paso 4: Agregar variables de entorno adicionales
En el dashboard de Vercel > Settings > Environment Variables, agrega:

| Variable | Valor | Entorno |
|----------|-------|---------|
| `GOOGLE_API_KEY` | Tu key de Google Gemini AI | Production, Preview |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Production, Preview |
| `NEXTAUTH_URL` | `https://tu-app.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://preview-*.vercel.app` | Preview |
| `GOOGLE_CLIENT_ID` | Tu OAuth client ID | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | Tu OAuth client secret | Production, Preview |

> **Nota:** `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, y `POSTGRES_PRISMA_URL` ya fueron configuradas por Neon automaticamente.

## Paso 5: Deploy
1. Vercel hara deploy automaticamente al pushear a `main`
2. Tambien puedes hacer deploy manual desde el dashboard
3. El build command configurado ejecutara `npm run build`

## Paso 6: Ejecutar migraciones de DB
Despues del primer deploy exitoso, ejecuta las migraciones:

```bash
# Opcion A: Desde la CLI de Vercel
npx vercel env pull .env.production
npm run db:push

# Opcion B: Desde el dashboard de Vercel
# Ve a tu proyecto > Settings > Git > Connected Git Repository
# El script vercel-build ya incluye db:push
```

## Paso 7: Crear usuario demo (seed)
```bash
npx vercel env pull .env.production
npm run db:seed
```

Esto creara el usuario demo:
- **Email:** admin@example.com
- **Password:** password123

## Solucion de problemas

### Error: "POSTGRES_URL not configured"
Asegura que la integracion Neon este conectada en Vercel Storage.

### Error de conexion SSL
Neon requiere SSL en produccion. El proyecto ya esta configurado con `ssl: 'require'` para `NODE_ENV=production`.

### Cold starts
Neon serverless puede tener cold starts (~1-2s). La configuracion de postgres.js:
- `max: 1` limita conexiones en serverless
- `prepare: false` evita prepared statements (no soportados por Neon)
- `idle_timeout: 20` cierra conexiones inactivas
- `connect_timeout: 10` timeout de conexion de 10s

### Verificar variables de entorno
```bash
npx vercel env ls
```
