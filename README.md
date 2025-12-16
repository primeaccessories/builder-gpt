# Builder GPT - MVP Documentation

A specialist construction problem-solver for UK builders and trades.

Builder GPT helps builders deal with real job issues (payments, extras, difficult customers, pricing pushback, disputes) via a focused chat interface.

## Project Overview

**Location:** `/Users/gibbo/Desktop/builder-gpt`

**Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Prisma (PostgreSQL)
- Stripe (subscriptions)
- OpenAI (GPT-4)
- Nodemailer (magic link emails)

## Core Principles

1. Simple, calm, professional UI
2. Builders are busy — minimise clicks and typing
3. Opinionated guidance, not vague AI answers
4. Focus on "what to do next"
5. UK construction context

## Pricing Tiers

### Tier 1 - Solo Builder (£29/month)
- Unlimited chat
- Core issue categories
- No long-term memory

### Tier 2 - Small Firm (£79/month)
- Everything in Tier 1
- Job context (job name, type, value)
- Conversation history
- Light memory across chats

### Tier 3 - Pro (£149/month)
- Everything in Tier 2
- Multiple users per account (future feature)
- Shared conversations (future feature)
- Dispute wording packs / summaries

## File Structure

```
builder-gpt/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── app/
│   │   ├── page.tsx                # Issue selector
│   │   └── chat/
│   │       └── page.tsx            # Chat interface
│   └── api/
│       ├── auth/
│       │   └── magic-link/
│       │       └── route.ts        # Magic link email
│       ├── chat/
│       │   └── route.ts            # Chat endpoint (OpenAI)
│       └── stripe/
│           └── webhook/
│               └── route.ts        # Stripe webhooks
├── lib/
│   ├── db.ts                       # Prisma client
│   ├── auth.ts                     # JWT auth utilities
│   └── ai-prompt.ts                # AI system prompt
├── prisma/
│   └── schema.prisma               # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .env.example
└── README.md                       # This file
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd /Users/gibbo/Desktop/builder-gpt
npm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```bash
# Using Docker (recommended for local development)
docker run --name builder-gpt-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=builder_gpt \
  -p 5432:5432 \
  -d postgres:15

# Or use a hosted provider (Neon, Supabase, Railway)
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/builder_gpt"

# Auth
JWT_SECRET="generate-random-secret"
MAGIC_LINK_SECRET="generate-random-secret"

# Email (SendGrid example)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
FROM_EMAIL="auth@buildergpt.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Pricing (set these after creating products in Stripe)
STRIPE_PRICE_SOLO="price_..."
STRIPE_PRICE_SMALL_FIRM="price_..."
STRIPE_PRICE_PRO="price_..."

# OpenAI
OPENAI_API_KEY="sk-..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Set Up Stripe

1. Create account at https://stripe.com
2. Create 3 products:
   - Solo Builder (£29/month)
   - Small Firm (£79/month)
   - Pro (£149/month)
3. Copy Price IDs to `.env`
4. Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
5. Listen for events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### 6. Set Up Email (SendGrid)

1. Create account at https://sendgrid.com
2. Create API key
3. Verify sender email
4. Add credentials to `.env`

### 7. Set Up OpenAI

1. Create account at https://platform.openai.com
2. Generate API key
3. Add to `.env`
4. Ensure billing is set up

### 8. Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Key Features

### Landing Page (`/`)
- Product explanation
- Pricing cards (3 tiers)
- Email capture for magic link
- Clean, professional design

### Issue Selector (`/app`)
- 7 large, selectable issue cards:
  - Payment problem
  - Changes / extras
  - Difficult customer
  - Job running over
  - Pricing pushback
  - Dispute starting
  - Something else
- One click to start chat

### Chat Interface (`/app/chat`)
- WhatsApp-style UI
- Short, focused responses
- Copy-paste message blocks
- Job context panel (Tier 2+)
- Real-time streaming (future enhancement)

## API Endpoints

### POST `/api/auth/magic-link`

Send magic link email for passwordless auth.

**Request:**
```json
{
  "email": "builder@example.com"
}
```

**Response:**
```json
{
  "success": true
}
```

### POST `/api/chat`

Send message and get AI response.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "issueType": "payment",
  "message": "Client hasn't paid final invoice for 3 weeks",
  "jobContext": {
    "name": "Kitchen extension, Oak Street",
    "type": "Extension",
    "value": "£25k"
  },
  "conversationHistory": []
}
```

**Response:**
```json
{
  "response": "**What's happening:**\nClient is 3 weeks overdue..."
}
```

### POST `/api/stripe/webhook`

Handle Stripe subscription webhooks.

**Headers:**
```
stripe-signature: <webhook-signature>
```

## Tier Enforcement

Tier limits are enforced at the API level in `/app/api/chat/route.ts`:

**Solo Builder:**
- No conversation history saved
- No job context accepted
- Fresh chat every time

**Small Firm:**
- Conversation history saved to database
- Job context accepted and used in prompts
- Messages linked to conversations

**Pro:**
- Same as Small Firm
- Multi-user support (future)
- Shared conversations (future)

## AI System Prompt

Located in `/lib/ai-prompt.ts`.

Key characteristics:
- Speaks in plain UK builder language
- Calm, practical, opinionated
- Every response includes:
  - What's happening
  - The main risk
  - What to do now
  - Copy-paste wording (where relevant)
- Maximum 200 words
- UK construction context
- No legal cop-outs

## Database Schema

**User:**
- id, email, name
- plan (SOLO | SMALL_FIRM | PRO)
- stripeCustomerId, stripeSubscriptionId
- subscriptionStatus (active, canceled, past_due, trialing)
- trialEndsAt
- timestamps

**Conversation:**
- id, userId, issueType
- jobContextId (optional)
- timestamps

**Message:**
- id, conversationId, userId
- role (USER | ASSISTANT)
- content
- timestamp

**JobContext:**
- id, userId
- name, type, value
- timestamps

## Deployment

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

PostgreSQL database options:
- Neon (free tier available)
- Supabase
- Railway
- Render

### Option 2: Railway

1. Create new project
2. Add PostgreSQL database
3. Deploy from GitHub
4. Set environment variables

### Option 3: AWS / DigitalOcean

1. Set up EC2 / Droplet
2. Install Node.js, PostgreSQL
3. Clone repository
4. Run `npm install && npm run build`
5. Use PM2 to manage process
6. Set up nginx reverse proxy

## Post-Launch Tasks

### Week 1:
- [ ] Set up Stripe test mode
- [ ] Test magic link emails
- [ ] Test all issue types
- [ ] Verify tier limits work
- [ ] Test payment flow

### Week 2:
- [ ] Deploy to production
- [ ] Configure production Stripe
- [ ] Set up domain and SSL
- [ ] Test on mobile devices
- [ ] Onboard first 10 beta users

### Future Enhancements:
- Real-time streaming responses
- Multi-user accounts (Pro tier)
- Shared conversations (Pro tier)
- Dispute wording packs
- Email notifications
- Usage analytics dashboard
- Export conversation as PDF

## Cost Breakdown

**Monthly running costs (estimated):**

- Database (Neon free tier or $19/month): £0-15
- Hosting (Vercel hobby free): £0
- Email (SendGrid 12k emails free): £0-10
- OpenAI API (varies by usage): £50-200
- Stripe fees (2.4% + 20p per transaction): Variable

**Total minimum:** ~£50/month
**Expected at 50 users:** ~£150-250/month

## Testing

### Manual Testing Checklist:

**Auth:**
- [ ] Magic link email received
- [ ] Login link works
- [ ] JWT stored correctly
- [ ] Protected routes work

**Issue Selector:**
- [ ] All 7 cards visible
- [ ] Clicking redirects to chat
- [ ] Issue type passed correctly

**Chat:**
- [ ] Messages send/receive
- [ ] AI responses are relevant
- [ ] Copy-paste blocks formatted
- [ ] Job context saves (Tier 2+)
- [ ] History persists (Tier 2+)

**Stripe:**
- [ ] Free trial starts automatically
- [ ] Subscription flow works
- [ ] Webhooks update database
- [ ] Tier limits enforced

## Security Considerations

1. **Environment variables:** Never commit `.env` file
2. **JWT secrets:** Use strong random secrets in production
3. **Stripe webhook verification:** Always verify signatures
4. **Rate limiting:** Add to `/api/chat` route (future)
5. **Input sanitization:** Validate all user inputs
6. **SQL injection:** Use Prisma parameterized queries (already handled)

## Support & Maintenance

**Database backups:**
- Set up daily automated backups
- Test restore process monthly

**Monitoring:**
- Set up error tracking (Sentry recommended)
- Monitor OpenAI API usage
- Track Stripe subscription metrics

**Logs:**
- Enable structured logging
- Monitor API errors
- Track chat quality issues

## Troubleshooting

### Magic link not sending:
- Check SMTP credentials
- Verify SendGrid sender verification
- Check email spam folder
- Review server logs

### Chat not responding:
- Verify OpenAI API key
- Check API rate limits
- Review conversation history length
- Check error logs

### Stripe webhook failing:
- Verify webhook secret
- Check endpoint is publicly accessible
- Review Stripe dashboard logs
- Ensure signature verification works

### Database connection error:
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Run `npx prisma generate`
- Check network/firewall settings

## Contributing

This is an MVP. Future development priorities:

1. Real-time streaming
2. Multi-user accounts
3. Conversation export
4. Mobile app (React Native)
5. WhatsApp bot integration

## License

Proprietary. Not for redistribution.

---

**Built for UK builders who need answers, not admin.**

