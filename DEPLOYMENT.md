# Builder GPT - Deployment Guide

Complete guide to deploying Builder GPT to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database set up (PostgreSQL)
- [ ] Stripe products created
- [ ] OpenAI API key valid
- [ ] Email sending configured
- [ ] Domain purchased (optional but recommended)

## Quick Deploy to Vercel (Recommended)

### 1. Prepare Repository

```bash
cd /Users/gibbo/Desktop/builder-gpt
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
gh repo create builder-gpt --private
git push origin main
```

### 2. Set Up Database (Neon)

1. Go to https://neon.tech
2. Create account (free tier available)
3. Create new project: "builder-gpt-production"
4. Copy connection string
5. Save for step 4

### 3. Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Import `builder-gpt` repository
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 4. Add Environment Variables

In Vercel project settings → Environment Variables, add:

```bash
# Database
DATABASE_URL=postgresql://...neon.tech/builder_gpt?sslmode=require

# Auth (generate with: openssl rand -base64 32)
JWT_SECRET=<generate-random-secret>
MAGIC_LINK_SECRET=<generate-random-secret>

# Email (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-sendgrid-api-key
FROM_EMAIL=auth@buildergpt.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in Stripe dashboard)
STRIPE_PRICE_SOLO=price_...
STRIPE_PRICE_SMALL_FIRM=price_...
STRIPE_PRICE_PRO=price_...

# OpenAI
OPENAI_API_KEY=sk-...

# App URL (update after deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 5. Run Database Migration

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate
```

### 6. Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy signing secret
6. Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET`

### 7. Test Production Deployment

1. Visit your Vercel URL
2. Test magic link signup
3. Start a chat
4. Verify AI responses
5. Test Stripe subscription flow

### 8. Add Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your domain (e.g., `buildergpt.com`)
3. Configure DNS as instructed
4. Wait for SSL certificate
5. Update `NEXT_PUBLIC_APP_URL` environment variable

## Alternative: Deploy to Railway

### 1. Create Railway Account

Go to https://railway.app and sign up.

### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect your `builder-gpt` repository

### 3. Add PostgreSQL Database

1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway will create database automatically
3. Copy DATABASE_URL from Variables tab

### 4. Configure Environment Variables

In project settings → Variables, add all variables from Vercel guide above.

### 5. Deploy

Railway will automatically deploy. Monitor logs for errors.

## Alternative: Deploy to AWS (Advanced)

### 1. Set Up EC2 Instance

```bash
# Launch Ubuntu 22.04 instance
# t3.small minimum (2GB RAM)
# Open ports: 22, 80, 443

# SSH into instance
ssh -i your-key.pem ubuntu@your-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### 2. Set Up PostgreSQL

```bash
sudo -u postgres psql

CREATE DATABASE builder_gpt;
CREATE USER builder_user WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE builder_gpt TO builder_user;
\q
```

### 3. Clone and Build Application

```bash
cd /home/ubuntu
git clone https://github.com/yourusername/builder-gpt.git
cd builder-gpt

npm install
npm run build

# Create .env file
nano .env
# Paste environment variables
# Save with Ctrl+X, Y, Enter
```

### 4. Run Database Migration

```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Start with PM2

```bash
pm2 start npm --name "builder-gpt" -- start
pm2 save
pm2 startup
```

### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/builder-gpt
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/builder-gpt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Set Up SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Post-Deployment

### 1. Monitor Application

```bash
# Vercel
vercel logs --follow

# Railway
# Use dashboard logs viewer

# AWS/PM2
pm2 logs builder-gpt
pm2 monit
```

### 2. Set Up Error Tracking (Sentry)

1. Go to https://sentry.io
2. Create new Next.js project
3. Follow integration guide
4. Add to `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig({
  // ... existing config
})
```

### 3. Set Up Uptime Monitoring

Options:
- UptimeRobot (free tier available)
- Better Uptime
- Pingdom

Monitor endpoints:
- Landing page: `/`
- API health: `/api/health` (create this)

### 4. Enable Database Backups

**Neon:** Automatic backups included

**Railway:** Enable backups in database settings

**AWS RDS:** Configure automated backups

**Self-hosted:** Set up cron job:

```bash
# Add to crontab
0 2 * * * pg_dump builder_gpt > /backup/builder_gpt_$(date +\%Y\%m\%d).sql
```

### 5. Set Up Analytics (Optional)

Add Plausible Analytics:

```bash
npm install plausible-tracker
```

Add to `app/layout.tsx`:

```typescript
import PlausibleProvider from 'next-plausible'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <PlausibleProvider domain="buildergpt.com" />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

## Scaling Considerations

### When you reach 100+ users:

1. **Database:**
   - Upgrade to paid tier
   - Enable connection pooling
   - Add read replicas

2. **OpenAI:**
   - Monitor token usage
   - Implement caching for common responses
   - Consider rate limiting per user

3. **Hosting:**
   - Upgrade Vercel/Railway plan
   - Enable CDN caching
   - Add Redis for session storage

4. **Monitoring:**
   - Set up application performance monitoring
   - Track user behavior analytics
   - Monitor chat quality metrics

## Rollback Procedure

### Vercel:

1. Go to project → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Railway:

1. Go to Deployments tab
2. Select previous deployment
3. Click "Redeploy"

### AWS:

```bash
cd /home/ubuntu/builder-gpt
git log  # Find previous commit
git reset --hard <commit-hash>
npm install
npm run build
pm2 restart builder-gpt
```

## Troubleshooting Production Issues

### 500 Internal Server Error:

1. Check Vercel/Railway logs
2. Verify all environment variables set
3. Check database connection
4. Review OpenAI API status

### Stripe webhook not working:

1. Check webhook signing secret
2. Verify endpoint URL is correct
3. Review Stripe dashboard logs
4. Test with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Magic link emails not sending:

1. Verify SendGrid API key
2. Check sender verification
3. Review email logs in SendGrid
4. Test with different email provider

### Database connection timeout:

1. Check DATABASE_URL format
2. Verify SSL mode for cloud databases
3. Increase connection pool size
4. Check network connectivity

## Security Hardening

### 1. Rate Limiting

Add to `/app/api/chat/route.ts`:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})
```

### 2. CORS Configuration

Add to `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
      ],
    },
  ]
}
```

### 3. Content Security Policy

Add to `app/layout.tsx`:

```typescript
export const metadata = {
  other: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  },
}
```

## Maintenance Schedule

**Daily:**
- Monitor error logs
- Check Stripe payments
- Review user feedback

**Weekly:**
- Review usage metrics
- Check database performance
- Update dependencies if needed

**Monthly:**
- Review and optimize costs
- Analyze chat quality
- Plan feature updates

---

**Deployment complete. Builder GPT is ready for UK builders.**
