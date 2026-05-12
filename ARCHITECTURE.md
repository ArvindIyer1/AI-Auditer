# AI Stack Auditor - Architecture

## Overview

AI Stack Auditor is a full-stack Next.js application that helps teams audit their AI tool spending and identify optimization opportunities.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Backend Services**:
  - Anthropic Claude for AI summaries
  - Resend for email confirmations
  - Supabase Auth & Database
- **State Management**: React hooks + sessionStorage for form persistence

## Architecture

### Pages

1. **Home (/)** - Spend input form
   - Multi-step form for adding AI tools
   - Form state persists to localStorage
   - Collects team size and primary use case

2. **Results (/results)** - Audit results
   - Shows audit engine recommendations
   - Displays total savings (monthly/annual)
   - Fetches AI-powered summary from Anthropic API
   - Shows CTA banner if savings > $500/mo

3. **Lead Capture (inline on /results)** - Email gate
   - Captures email + optional company/role/team size
   - Saves lead to Supabase audit_leads table
   - Sends confirmation email via Resend
   - Generates UUID and redirects to shareable URL

4. **Public Audit (/audit/[id])** - Shareable page
   - Server-side rendered with OG meta tags
   - Shows audit results without personal information
   - Stripped of email and company details

5. **Admin Dashboard (/admin)** - Lead management
   - Protected with API key authentication
   - Lists all captured leads
   - CSV export functionality
   - Shows lead statistics

### API Routes

- `POST /api/generate-summary` - Calls Anthropic Claude to generate AI summary
- `POST /api/save-lead` - Saves lead to Supabase, sends email via Resend
- `POST /api/admin/verify` - Authenticates admin with API key
- `GET /api/admin/leads` - Fetches all leads (admin only)
- `GET /api/admin/export` - Exports leads as CSV (admin only)

### Core Libraries

- **lib/audit-engine.ts** - Pure function audit logic
  - `auditSpend()` - Runs hardcoded recommendation rules
  - `getRecommendation()` - Per-tool optimization logic

- **lib/pricing-data.ts** - Pricing constants
  - All tool plans and pricing
  - USE_CASES enum

- **lib/supabase.ts** - Supabase client initialization

- **lib/rate-limit.ts** - Simple in-memory rate limiter
  - Limits 5 requests per IP per hour

- **lib/types.ts** - TypeScript interfaces

### Database Schema

```sql
-- audits table
CREATE TABLE audits (
  id UUID PRIMARY KEY,
  audit_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- audit_leads table
CREATE TABLE audit_leads (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  role TEXT,
  team_size INTEGER,
  audit_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `ANTHROPIC_API_KEY` - Claude API key for summaries
- `RESEND_API_KEY` - Resend API key for emails
- `ADMIN_API_KEY` - Secret key for admin dashboard access
- `NEXT_PUBLIC_APP_URL` - App URL for email links (e.g., http://localhost:3000)

## Data Flow

1. User fills spend form → localStorage persistence
2. User submits → audit engine runs recommendations
3. Results page loads with sessionStorage data
4. AI summary API call generates Claude summary
5. User enters email → lead saved + email sent
6. Redirect to shareable audit URL
7. Shareable URL fetches audit from Supabase + renders with OG tags

## Security

- Rate limiting: 5 requests per IP per hour on lead capture
- Honeypot field on lead form to filter bots
- Admin routes require secret API key
- Supabase RLS can be enabled for additional protection
- Email deduplication prevents duplicate leads

## Customization

### Pricing Data

Edit `lib/pricing-data.ts` to:
- Add/remove tools
- Update plan names and prices
- Change use case categories

### Recommendation Logic

Edit `lib/audit-engine.ts` `getRecommendation()` function to:
- Add new recommendation rules
- Change savings calculations
- Adjust thresholds

### Email Template

Edit `app/api/save-lead/route.ts` to customize confirmation email HTML

### Branding

Update `app/layout.tsx` metadata and `globals.css` color tokens for branding
