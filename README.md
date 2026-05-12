# AI Stack Auditor

A full-stack web application that helps teams audit their AI tool spending and discover optimization opportunities.

## Features

- **Spend Audit Form** - Add multiple AI tools with current spend and seat counts
- **Smart Recommendations** - Hardcoded logic identifies overspending patterns and suggests cheaper alternatives
- **AI-Powered Summary** - Claude generates personalized analysis of your stack
- **Lead Capture** - Email gate with optional company/role fields
- **Email Confirmations** - Resend integration sends audit confirmations
- **Shareable URLs** - Generate public URLs with Open Graph meta tags for social sharing
- **Admin Dashboard** - Manage leads and export to CSV for your CRM
- **Rate Limiting** - Built-in abuse protection (5 requests per IP per hour)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude (summaries)
- **Email**: Resend (confirmations)
- **Forms**: React hooks + localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- Anthropic API key
- Resend API key
- Admin API key (any secret string)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repo>
   cd ai-stack-auditor
   pnpm install
   ```

2. **Set up environment variables**
   Create `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ANTHROPIC_API_KEY=your_anthropic_key
   RESEND_API_KEY=your_resend_key
   ADMIN_API_KEY=your_secret_admin_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Set up database schema**
   - Open Supabase SQL Editor
   - Copy contents of `database.sql`
   - Execute the queries to create tables and indexes

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Open browser**
   - App: http://localhost:3000
   - Admin: http://localhost:3000/admin (use ADMIN_API_KEY to login)

## Usage

### Creating an Audit

1. Visit home page
2. Enter team size and primary use case
3. Add each AI tool with current plan and monthly spend
4. Click "Audit My AI Spend"
5. View results with recommendations and savings
6. Enter email to save and share audit

### Sharing Audits

After capturing an email, you'll get a shareable URL like:
```
https://yourdomain.com/audit/[uuid]
```

This URL:
- Has Open Graph meta tags for Twitter/LinkedIn sharing
- Shows all recommendations and savings
- Doesn't show email or company name
- Redirects users to create their own audit

### Admin Dashboard

1. Visit `/admin`
2. Enter your ADMIN_API_KEY
3. View all captured leads with metrics
4. Export leads as CSV for your CRM

## File Structure

```
├── app/
│   ├── page.tsx                 # Home - spend input form
│   ├── results/page.tsx         # Results + lead capture
│   ├── audit/[id]/page.tsx      # Shareable audit URL
│   ├── admin/page.tsx           # Admin dashboard
│   └── api/
│       ├── generate-summary/    # Claude summary API
│       ├── save-lead/           # Lead save + email API
│       └── admin/               # Admin auth, leads, export
├── components/
│   ├── ToolInput.tsx            # Tool selector component
│   ├── LeadCapture.tsx          # Email capture form
│   └── ui/                      # shadcn components
├── lib/
│   ├── audit-engine.ts          # Recommendation logic
│   ├── pricing-data.ts          # Tool prices + plans
│   ├── supabase.ts              # DB client
│   ├── rate-limit.ts            # Rate limiting
│   └── types.ts                 # TypeScript interfaces
├── hooks/
│   └── useAuditForm.ts          # Form state hook
├── database.sql                 # Schema + indexes
├── ARCHITECTURE.md              # System design
├── PROMPTS.md                   # AI/email templates
└── PRICING_DATA.md              # Pricing sources
```

## Configuration

### Updating AI Tool Pricing

Edit `lib/pricing-data.ts`:
```typescript
export const PRICING: Record<Tool, ...> = {
  'Your Tool': {
    plans: {
      'Free': 0,
      'Pro ($20/month)': 20,
    },
    description: 'Tool description',
  },
};
```

### Changing Recommendation Logic

Edit `lib/audit-engine.ts` `getRecommendation()` function:
```typescript
if (tool === 'Cursor' && plan === 'Pro' && seats >= 5) {
  return {
    recommendation: 'Upgrade to Business for volume discount',
    recommendedPlan: 'Business ($40/month)',
    monthlySavings: 50,
    reason: 'Better value for teams >= 5',
  };
}
```

### Customizing Email Template

Edit `app/api/save-lead/route.ts` email HTML to change:
- Sender email (currently noreply@auditor.credex.app)
- Subject line
- Email body and branding
- Links and CTAs

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `ADMIN_API_KEY` | Yes | Secret admin password |
| `NEXT_PUBLIC_APP_URL` | No | App URL for email links (defaults to http://localhost:3000) |

## Database Schema

### audits
```sql
id: UUID (primary key)
audit_data: JSONB (contains input + result)
created_at: TIMESTAMP
```

### audit_leads
```sql
id: UUID (primary key)
email: TEXT UNIQUE
company: TEXT
role: TEXT
team_size: INTEGER
audit_data: JSONB
created_at: TIMESTAMP
```

## API Routes

### Public
- `POST /api/generate-summary` - Generate AI audit summary (no auth)
- `POST /api/save-lead` - Capture lead + send email (rate limited)

### Admin (requires X-Admin-Key header)
- `POST /api/admin/verify` - Authenticate with API key
- `GET /api/admin/leads` - List all leads
- `GET /api/admin/export` - Export leads as CSV

## Security

- **Rate Limiting**: 5 requests per IP per hour on lead capture endpoint
- **Honeypot**: Hidden website field on lead form filters bots
- **Admin Authentication**: Secret API key required for admin routes
- **Input Validation**: Email validation on lead submission
- **Email Deduplication**: Duplicate emails don't create duplicate leads

## Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
# Set environment variables in Vercel dashboard
```

### Other Platforms

```bash
# Build
pnpm run build

# Start
pnpm start
```

## Performance Notes

- Form state saved to localStorage (no backend calls while editing)
- Audit calculation happens client-side (fast, no server call needed)
- AI summary is optional (graceful fallback if Claude API fails)
- Shareable URLs are statically generated from database (fast loads)
- Admin export streams CSV (efficient for large lead lists)

## Cost Breakdown (Monthly)

- **Supabase**: Free tier or ~$25+/month for Pro
- **Anthropic**: ~$0.01-0.10 per summary (depends on volume)
- **Resend**: Free tier or ~$20+/month for paid
- **Vercel**: Free tier or $20+/month for Pro

## Roadmap

Potential enhancements:
- [ ] Real-time pricing API integration
- [ ] Annual payment discount calculations
- [ ] Team member cost attribution
- [ ] Recommendation explanations with links
- [ ] Comparison with similar companies' stacks
- [ ] Automated price monitoring + alerts
- [ ] Integration with accounting software
- [ ] Multi-currency support

## Support

See issues or documentation files:
- `ARCHITECTURE.md` - System design
- `PROMPTS.md` - AI prompt + email template
- `PRICING_DATA.md` - Pricing sources and how to update

## License

MIT - Feel free to fork and customize for your use case.
