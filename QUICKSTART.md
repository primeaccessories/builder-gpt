# Builder GPT - Quick Start Guide

Get Builder GPT running locally in under 10 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Docker recommended)
- OpenAI API key
- Email service (SendGrid recommended)

## 1. Install Dependencies

```bash
cd /Users/gibbo/Desktop/builder-gpt
npm install
```

## 2. Start PostgreSQL Database

**Option A: Docker (Recommended)**

```bash
docker run --name builder-gpt-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=builder_gpt \
  -p 5432:5432 \
  -d postgres:15
```

**Option B: Local PostgreSQL**

```bash
# macOS with Homebrew
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb builder_gpt
```

## 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with minimum required values:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/builder_gpt"

# Auth (use these for development only)
JWT_SECRET="dev-jwt-secret-change-in-production"
MAGIC_LINK_SECRET="dev-magic-link-secret"

# Email (SendGrid - free tier available)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="YOUR_SENDGRID_API_KEY"
FROM_EMAIL="auth@yourdomain.com"

# Stripe (use test mode)
STRIPE_SECRET_KEY="sk_test_YOUR_KEY"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET"

# Stripe Prices (set after creating products - see step 5)
STRIPE_PRICE_SOLO="price_test_solo"
STRIPE_PRICE_SMALL_FIRM="price_test_small_firm"
STRIPE_PRICE_PRO="price_test_pro"

# OpenAI
OPENAI_API_KEY="sk-YOUR_OPENAI_KEY"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 4. Set Up Database

```bash
# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

## 5. Set Up Stripe Products (Optional for dev)

1. Go to https://dashboard.stripe.com/test/products
2. Create 3 products:
   - **Solo Builder** - £29/month recurring
   - **Small Firm** - £79/month recurring
   - **Pro** - £149/month recurring
3. Copy each Price ID to `.env`:
   - `STRIPE_PRICE_SOLO`
   - `STRIPE_PRICE_SMALL_FIRM`
   - `STRIPE_PRICE_PRO`

## 6. Set Up Email Service

**Option A: SendGrid (Free tier - 100 emails/day)**

1. Sign up at https://sendgrid.com
2. Create API key: Settings → API Keys → Create API Key
3. Verify sender: Settings → Sender Authentication → Verify Single Sender
4. Add to `.env`:
   ```bash
   SMTP_PASS="SG.your-api-key"
   FROM_EMAIL="your-verified-email@example.com"
   ```

**Option B: Development - Log to console**

For testing without email, modify `/app/api/auth/magic-link/route.ts`:

```typescript
// Comment out transporter.sendMail()
// Add this instead:
console.log('Magic link:', magicLink)
```

## 7. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Add to `.env`:
   ```bash
   OPENAI_API_KEY="sk-..."
   ```

Ensure you have billing set up (required for API access).

## 8. Start Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

## 9. Test the Application

### Test Magic Link Authentication:

1. Go to http://localhost:3000
2. Enter your email in the hero section
3. Click "Get started"
4. Check console logs for magic link (if not using real email)
5. Copy URL and paste in browser
6. Should redirect to `/app` (issue selector)

### Test Issue Selector:

1. Should see 7 issue cards
2. Click "Payment problem"
3. Should redirect to `/app/chat?issue=payment`

### Test Chat:

1. Type a message: "Client hasn't paid me in 3 weeks, what should I do?"
2. Click "Send"
3. Should receive AI response with:
   - What's happening
   - The main risk
   - What to do now
   - Copy-paste wording

### Test Job Context (Tier 2+):

1. In chat, click "Add job"
2. Fill in job details:
   - Name: "Kitchen extension"
   - Type: "Extension"
   - Value: "£25k"
3. Send another message
4. AI should reference job context in response

## 10. Access Database (Optional)

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

Visit: **http://localhost:5555**

## Common Issues

### Database connection error:

```bash
# Check PostgreSQL is running
docker ps  # Should see builder-gpt-db

# Or for local install
brew services list  # Should show postgresql@15 started
```

### Prisma client error:

```bash
# Regenerate client
npx prisma generate
```

### Magic link not sending:

- Check SendGrid API key is correct
- Verify sender email is verified in SendGrid
- Check console logs for the link if in dev mode

### OpenAI error:

- Verify API key is correct
- Check you have billing set up
- Ensure you have credit/quota available

### Stripe webhook error (development):

Use Stripe CLI to forward webhooks to localhost:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy webhook signing secret to .env
# STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Development Workflow

### 1. Make database changes:

```bash
# Edit prisma/schema.prisma
# Then run:
npx prisma migrate dev --name your_change_name
npx prisma generate
```

### 2. View database:

```bash
npx prisma studio
```

### 3. Reset database:

```bash
npx prisma migrate reset
```

### 4. Check logs:

```bash
# Development server logs appear in terminal
# Check for errors or console.log() output
```

### 5. Test Stripe webhooks locally:

```bash
# Terminal 1: Run development server
npm run dev

# Terminal 2: Forward Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Next Steps

### Once local development works:

1. **Review the code:**
   - Read `/lib/ai-prompt.ts` to understand AI personality
   - Review `/app/api/chat/route.ts` for tier enforcement
   - Check tier limits are working correctly

2. **Customize:**
   - Adjust AI prompt for your use case
   - Modify pricing tiers if needed
   - Update branding/colors in Tailwind config

3. **Test thoroughly:**
   - Test all 7 issue types
   - Verify tier limits (Solo vs Small Firm)
   - Test trial expiration logic
   - Test Stripe subscription flow

4. **Deploy:**
   - Follow `DEPLOYMENT.md` for production setup
   - Use Vercel for easiest deployment
   - Configure production Stripe products
   - Set up production email service

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production build

# Database
npx prisma studio        # Visual database browser
npx prisma migrate dev   # Run migrations
npx prisma generate      # Generate client
npx prisma migrate reset # Reset database

# Stripe
stripe listen            # Listen for webhooks
stripe trigger           # Trigger test events

# Deployment
vercel                   # Deploy to Vercel
vercel env pull          # Pull environment variables
```

## Project Structure Quick Reference

```
builder-gpt/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── app/
│   │   ├── page.tsx             # Issue selector
│   │   └── chat/page.tsx        # Chat interface
│   └── api/
│       ├── auth/magic-link/     # Authentication
│       ├── chat/                # AI chat logic
│       └── stripe/webhook/      # Subscription events
├── lib/
│   ├── db.ts                    # Database client
│   ├── auth.ts                  # JWT utilities
│   └── ai-prompt.ts             # AI system prompt
└── prisma/
    └── schema.prisma            # Database schema
```

## Support

### Documentation:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Production deployment guide
- `PROJECT-STRUCTURE.md` - Codebase overview

### Common Questions:

**Q: Can I use a different database?**
A: Prisma supports MySQL, SQLite, MongoDB. Update `schema.prisma` datasource.

**Q: Can I use a different AI model?**
A: Yes, modify `/app/api/chat/route.ts` to use gpt-3.5-turbo or claude-3.

**Q: How do I add a new issue type?**
A: Update `ISSUES` array in `/app/app/page.tsx` and add to Prisma enum.

**Q: Can I disable Stripe for testing?**
A: Yes, comment out subscription checks in `/app/api/chat/route.ts`.

---

**You're ready to build! Builder GPT is now running locally.**

Next: Test all features, then deploy to production using `DEPLOYMENT.md`.
