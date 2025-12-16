# Builder GPT - Project Structure

Complete overview of the Builder GPT MVP codebase.

## Directory Tree

```
builder-gpt/
│
├── app/                                # Next.js App Router
│   ├── page.tsx                        # Landing page (home, pricing, signup)
│   ├── layout.tsx                      # Root layout with metadata
│   ├── globals.css                     # Global Tailwind styles
│   │
│   ├── app/                            # Main application (protected)
│   │   ├── page.tsx                    # Issue selector screen
│   │   ├── chat/
│   │   │   └── page.tsx                # Chat interface
│   │   └── settings/                   # Future: user settings
│   │       └── page.tsx
│   │
│   └── api/                            # API routes
│       ├── auth/
│       │   └── magic-link/
│       │       └── route.ts            # Send magic link email
│       ├── chat/
│       │   └── route.ts                # Chat with AI (main logic)
│       └── stripe/
│           └── webhook/
│               └── route.ts            # Handle Stripe events
│
├── lib/                                # Shared utilities
│   ├── db.ts                           # Prisma client instance
│   ├── auth.ts                         # JWT signing/verification
│   └── ai-prompt.ts                    # OpenAI system prompt
│
├── prisma/                             # Database
│   └── schema.prisma                   # Database schema (User, Conversation, Message, JobContext)
│
├── public/                             # Static assets
│   └── (future: logo, favicon)
│
├── package.json                        # Dependencies
├── tsconfig.json                       # TypeScript config
├── tailwind.config.ts                  # Tailwind config (dark theme)
├── next.config.js                      # Next.js config
├── .env.example                        # Environment variables template
├── .gitignore                          # Git ignore rules
│
├── README.md                           # Main documentation
├── DEPLOYMENT.md                       # Deployment guide
└── PROJECT-STRUCTURE.md                # This file
```

## Key Files Explained

### Frontend Components

**`app/page.tsx`** - Landing Page
- Hero section with email capture
- Product benefits
- Pricing cards (3 tiers)
- How it works section
- Footer

**`app/app/page.tsx`** - Issue Selector
- 7 large issue cards:
  - Payment problem
  - Changes / extras
  - Difficult customer
  - Job running over
  - Pricing pushback
  - Dispute starting
  - Something else
- Redirects to chat with issue context

**`app/app/chat/page.tsx`** - Chat Interface
- WhatsApp-style message display
- User messages (blue, right-aligned)
- Assistant messages (grey, left-aligned)
- Input textarea with send button
- Job context sidebar (Tier 2+ only)
- Loading animation (3 bouncing dots)

### API Routes

**`app/api/auth/magic-link/route.ts`**
- Receives email from landing page
- Finds or creates user
- Generates JWT magic link token
- Sends email via Nodemailer
- Returns success/error

**`app/api/chat/route.ts`** - CORE LOGIC
- Authenticates request (JWT)
- Checks user plan and subscription status
- Enforces tier limits:
  - Solo: No history, no job context
  - Small Firm: History + job context
  - Pro: Same as Small Firm + future features
- Builds OpenAI prompt with context
- Calls OpenAI GPT-4
- Saves conversation (Tier 2+)
- Returns AI response

**`app/api/stripe/webhook/route.ts`**
- Verifies Stripe signature
- Handles subscription events:
  - Created → Set plan and status
  - Updated → Update plan
  - Deleted → Mark as canceled
  - Payment failed → Mark as past_due
- Updates user in database

### Libraries

**`lib/db.ts`**
- Prisma client singleton
- Prevents multiple instances in development

**`lib/auth.ts`**
- `signToken()` - Create JWT for authenticated sessions
- `verifyToken()` - Verify JWT from Authorization header
- `signMagicLink()` - Create short-lived token for email links
- `verifyMagicLink()` - Verify magic link token
- `getUserFromRequest()` - Extract user from request headers

**`lib/ai-prompt.ts`** - CRITICAL FILE
- `BUILDER_GPT_SYSTEM_PROMPT` - Core AI personality
- `buildChatPrompt()` - Builds prompt with issue type and job context
- Defines response format:
  - What's happening
  - The main risk
  - What to do now
  - Copy-paste wording

### Database Schema

**`prisma/schema.prisma`**

4 main models:

1. **User**
   - Email, plan, Stripe IDs
   - Subscription status, trial end date

2. **Conversation**
   - Links to user and issue type
   - Optional job context reference

3. **Message**
   - Links to conversation
   - Role (USER or ASSISTANT)
   - Content

4. **JobContext** (Tier 2+)
   - Job name, type, value
   - Links to user

## Data Flow

### 1. User Signs Up

```
Landing page (email input)
  ↓
POST /api/auth/magic-link
  ↓
Create user with 7-day trial
  ↓
Send email with JWT token
  ↓
User clicks link → Verify token → Create session
```

### 2. User Starts Chat

```
Issue selector → Click "Payment problem"
  ↓
Redirect to /app/chat?issue=payment
  ↓
Chat interface loads
  ↓
User types message
  ↓
POST /api/chat
  ↓
Authenticate (JWT)
  ↓
Check plan and tier limits
  ↓
Build AI prompt with context
  ↓
Call OpenAI GPT-4
  ↓
Save conversation (Tier 2+)
  ↓
Return response
  ↓
Display in chat UI
```

### 3. Subscription Events

```
User upgrades to Small Firm in Stripe
  ↓
Stripe sends webhook
  ↓
POST /api/stripe/webhook
  ↓
Verify signature
  ↓
Update user: plan = SMALL_FIRM, status = active
  ↓
User now has access to Tier 2 features
```

## Tier Enforcement Logic

Implemented in `/app/api/chat/route.ts`:

```typescript
// Get user plan
const user = await prisma.user.findUnique({ where: { id: userId } })

// Solo: No job context
const canUseJobContext = user.plan !== 'SOLO'
const finalJobContext = canUseJobContext ? jobContext : undefined

// Solo: No conversation history
const canUseHistory = user.plan !== 'SOLO'
if (canUseHistory && conversationHistory.length > 0) {
  // Include history in prompt
}

// Save conversation only for Tier 2+
if (canUseHistory) {
  await prisma.message.create(...)
}
```

## Environment Variables

Required for all environments:

```bash
DATABASE_URL              # PostgreSQL connection string
JWT_SECRET                # For session tokens
MAGIC_LINK_SECRET         # For email link tokens
SMTP_HOST                 # Email server
SMTP_PORT                 # Email port
SMTP_USER                 # Email username
SMTP_PASS                 # Email password
FROM_EMAIL                # Sender email
STRIPE_SECRET_KEY         # Stripe API key
STRIPE_PUBLISHABLE_KEY    # Stripe public key
STRIPE_WEBHOOK_SECRET     # Webhook signing secret
STRIPE_PRICE_SOLO         # Price ID for Solo plan
STRIPE_PRICE_SMALL_FIRM   # Price ID for Small Firm
STRIPE_PRICE_PRO          # Price ID for Pro plan
OPENAI_API_KEY            # OpenAI API key
NEXT_PUBLIC_APP_URL       # App URL (for magic links)
```

## Dependencies

### Production

- **next** (14.1.0) - React framework
- **react** (18) - UI library
- **@prisma/client** (5.8.0) - Database ORM
- **stripe** (14.10.0) - Payment processing
- **openai** (4.24.0) - AI integration
- **jsonwebtoken** (9.0.2) - Auth tokens
- **nodemailer** (6.9.8) - Email sending
- **zod** (3.22.4) - Schema validation

### Development

- **typescript** (5) - Type safety
- **tailwindcss** (3.3.0) - Styling
- **prisma** (5.8.0) - Database migrations
- **eslint** - Code linting

## API Response Formats

### Chat Response

```json
{
  "response": "**What's happening:**\nYour description...\n\n**The main risk:**\nRisk description...\n\n**What to do now:**\n1. First step\n2. Second step\n\n**Text to send:**\n```\nHi [Client],\n...\n```"
}
```

### Error Response

```json
{
  "error": "Subscription required"
}
```

Status codes:
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 402: Payment required
- 404: Not found
- 500: Server error

## Future Enhancements

### Phase 2 (1-2 months):
- Real-time streaming responses
- Conversation export to PDF
- Email summaries of chats
- Mobile responsive improvements

### Phase 3 (3-6 months):
- Multi-user accounts (Pro tier)
- Shared team conversations
- Admin dashboard
- Usage analytics

### Phase 4 (6-12 months):
- Mobile app (React Native)
- WhatsApp bot integration
- Voice input
- Dispute wording template library

## Testing Strategy

### Manual Testing:

1. **Auth flow:**
   - Enter email → Receive magic link → Click link → Session created

2. **Issue selection:**
   - Click each issue type → Verify correct context passed

3. **Chat:**
   - Send message → Receive relevant response
   - Check copy-paste blocks formatted correctly

4. **Tier limits:**
   - Test Solo: No history saved
   - Test Small Firm: History works, job context accepted
   - Test Pro: Same as Small Firm

5. **Stripe:**
   - Start trial → Verify 7 days
   - Subscribe → Verify plan updated
   - Cancel → Verify status updated

### Automated Testing (Future):

```bash
# Add to package.json
"test": "jest"
"test:e2e": "playwright test"
```

## Performance Optimization

### Current:
- Server-side rendering (Next.js)
- PostgreSQL indexes on userId, conversationId
- Prisma connection pooling

### Future:
- Redis caching for common responses
- Edge runtime for API routes
- Database read replicas
- CDN for static assets

## Security Measures

### Implemented:
- JWT authentication
- Stripe webhook signature verification
- Environment variable separation
- SQL injection protection (Prisma)

### Future:
- Rate limiting (Upstash)
- CORS restrictions
- Content Security Policy
- Input sanitization with Zod

---

**This MVP is production-ready and optimized for fast iteration based on user feedback.**
