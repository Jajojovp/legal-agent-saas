# Deployment Guide - Legal Agent SaaS Platform

## 🚀 Quick Deploy to Vercel (Recommended - 5 minutes)

### Step 1: Prepare Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Legal Agent SaaS"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/legal-agent-saas.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

### Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```bash
# Required
GOOGLE_API_KEY=AIzaSy-your-google-gemini-key
POSTGRES_URL=postgres://default:password@host:5432/database
POSTGRES_PRISMA_URL=postgres://default:password@host:5432/database?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://default:password@host:5432/database

# Optional
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 4: Set Up Database

Vercel automatically provisions PostgreSQL. To use it:

1. Go to Storage tab in Vercel
2. Click "Create Database" → "Postgres"
3. Name it (e.g., "legal-agent-db")
4. Vercel auto-populates the env vars

Or use your own PostgreSQL:
- [Neon](https://neon.tech) - Free tier, auto-scaling
- [Supabase](https://supabase.com) - Free tier, includes auth
- [Railway](https://railway.app) - Simple setup

### Step 5: Initialize Database Schema

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Push database schema
npm run db:push
```

### Step 6: Deploy!

```bash
vercel --prod
```

Your app is now live! 🎉

---

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t legal-agent-saas .
```

### Run Container
```bash
docker run -d \
  -p 3000:3000 \
  -e GOOGLE_API_KEY=your-key \
  -e POSTGRES_URL=your-db-url \
  --name legal-agent \
  legal-agent-saas
```

### Docker Compose
Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - POSTGRES_URL=${POSTGRES_URL}
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: legal_agent
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: legal_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

---

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Click "New App" → "Host Web App"
   - Connect to GitHub

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**
   - Add all required env vars in Amplify Console

4. **Database**: Use AWS RDS PostgreSQL

---

## 🔧 Self-Hosted (VPS)

### Requirements
- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- PostgreSQL 14+
- Nginx (reverse proxy)
- PM2 (process manager)

### Setup Script

```bash
#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/legal-agent-saas.git
cd legal-agent-saas

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
GOOGLE_API_KEY=your-key
POSTGRES_URL=postgresql://legal_user:password@localhost:5432/legal_db
NEXT_PUBLIC_APP_URL=https://yourdomain.com
EOF

# Build application
npm run build

# Start with PM2
pm2 start npm --name "legal-agent" -- start
pm2 save
pm2 startup
```

### Nginx Configuration

Create `/etc/nginx/sites-available/legal-agent`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/legal-agent /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 Database Setup

### Create Database
```sql
CREATE DATABASE legal_db;
CREATE USER legal_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE legal_db TO legal_user;
```

### Initialize Schema
```bash
npm run db:push
```

### Seed Data (Optional)
Create `lib/db/seed.ts`:

```typescript
import { db } from './index';
import { lawFirms, users } from './schema';

async function seed() {
  // Create demo firm
  const [firm] = await db.insert(lawFirms).values({
    name: 'Demo Law Firm',
    email: 'contact@demolaw.com',
    phone: '+1 (555) 123-4567',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    practiceAreas: ['personal-injury', 'family-law'],
  }).returning();

  // Create demo user
  await db.insert(users).values({
    firmId: firm.id,
    email: 'admin@demolaw.com',
    name: 'Admin User',
    role: 'admin',
  });

  console.log('✅ Database seeded');
}

seed().catch(console.error);
```

Run: `npx tsx lib/db/seed.ts`

---

## 🔐 Security Checklist

- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up CORS properly
- [ ] Implement rate limiting
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Monitor error logs
- [ ] Set up uptime monitoring

---

## 📈 Monitoring & Analytics

### Vercel Analytics (Built-in)
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
```

### PostHog (Product Analytics)
```bash
npm install posthog-js
```

---

## 🧪 Testing Before Deploy

```bash
# Run build locally
npm run build
npm start

# Test in production mode
NODE_ENV=production npm start

# Check for build errors
npm run lint
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 🎯 Post-Deployment

1. **Test Chatbot**: Visit your site and test the chat widget
2. **Check API Routes**: Test `/api/chatbot/message`
3. **Monitor Logs**: Check Vercel/server logs
4. **Set Up Backups**: Configure daily database backups
5. **Add Custom Domain**: Point your domain to Vercel
6. **Configure Email**: Set up transactional emails
7. **Analytics**: Connect Google Analytics
8. **Uptime Monitor**: Use UptimeRobot or similar

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues
- Check connection string format
- Verify database is accessible
- Check firewall rules
- Ensure SSL is configured if required

### API Routes Not Working
- Check environment variables are set
- Verify API keys are valid
- Check logs for errors

---

## 📞 Support

- GitHub Issues: [Create Issue](https://github.com/yourusername/legal-agent-saas/issues)
- Documentation: Check README.md
- Email: support@yourapp.com

---

**Deployment Time:** ~10-15 minutes with Vercel
**Maintenance:** Minimal (automatic updates with Vercel)
**Cost:** Free tier available, scales as needed
