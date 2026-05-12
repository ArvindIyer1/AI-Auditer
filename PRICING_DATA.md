# AI Stack Auditor - Pricing Data Reference

This document tracks pricing sources and helps with updates when prices change.

## Pricing Data (as of May 2025)

### Development Tools

#### Cursor
- **Hobby (Free)**: $0/month
- **Pro**: $20/month (per seat)
- **Business**: $40/month (per seat, team features)
- **Enterprise**: Custom pricing
- **Source**: https://cursor.com/pricing
- **Last Updated**: May 2025

#### GitHub Copilot
- **Individual**: $10/month
- **Business**: $19/seat/month
- **Enterprise**: $39/seat/month
- **Source**: https://github.com/features/copilot/plans
- **Last Updated**: May 2025

#### Windsurf
- **Free**: $0/month
- **Pro**: $15/month
- **Teams**: $25/seat/month
- **Source**: https://codeium.com/windsurf
- **Last Updated**: May 2025

### AI Models / APIs

#### Claude (Anthropic)
- **Free**: $0/month (limited)
- **Pro**: $20/month
- **Team**: $30/seat/month
- **Max**: $100/month (advanced)
- **API Direct**: Pay-as-you-go ($0.01-0.05 per 1K tokens)
- **Source**: https://claude.ai/pricing
- **Last Updated**: May 2025
- **Note**: API pricing more complex, simplified to $0 placeholder

#### ChatGPT (OpenAI)
- **Free**: $0/month (limited)
- **Plus**: $20/month
- **Team**: $30/seat/month (new, replaced shared subscription)
- **Enterprise**: Custom pricing
- **API Direct**: Pay-as-you-go (~$0.01-0.10 per 1K tokens)
- **Source**: https://openai.com/pricing
- **Last Updated**: May 2025
- **Note**: Team plan is newer, may not be widely known

#### Gemini (Google)
- **Free**: $0/month (limited)
- **Pro**: $20/month
- **Ultra**: $30/month (advanced)
- **API**: Pay-as-you-go ($0.01-0.10 per 1K tokens)
- **Source**: https://ai.google.dev/pricing
- **Last Updated**: May 2025

#### Anthropic API
- **Direct API Access**: Pay-as-you-go
- **Pricing**: $0.003 per 1K input tokens, $0.015 per 1K output tokens
- **Source**: https://www.anthropic.com/pricing
- **Last Updated**: May 2025

#### OpenAI API
- **Direct API Access**: Pay-as-you-go
- **GPT-4o**: $0.005-0.015 per 1K tokens
- **GPT-4 Turbo**: $0.01-0.03 per 1K tokens
- **Source**: https://openai.com/pricing/gpt-4
- **Last Updated**: May 2025

## Updating Prices

When pricing changes:

1. **Update lib/pricing-data.ts**
   - Edit PRICING constant with new values
   - Add comment with date

2. **Update this document**
   - Update price in relevant section
   - Update Last Updated timestamp
   - Note any changes (new plans, deprecated plans, etc.)

3. **Review recommendation logic**
   - Check if price changes affect recommendations
   - Edit lib/audit-engine.ts if thresholds change

## Tools Not Included (Why)

### DeepSeek, Qwen, Llama
- API only, no seat-based pricing
- Highly variable pricing
- Would need separate handling

### Perplexity, You.com, Kagi
- Smaller market share in 2025
- Can add if demand increases

### Enterprise AI Platforms (DataRobot, H2O)
- B2B, custom pricing only
- Outside scope of current audit

## Seasonal / Dynamic Pricing

Some tools offer:
- Annual discounts (15-20% savings vs monthly)
- Business/volume discounts
- Student/non-profit discounts

Current audit doesn't account for these. To add:
1. Add discount fields to form
2. Update audit engine to calculate with discounts
3. Note discounts in recommendations

## Real-Time Pricing APIs

In the future, could integrate:
- Stripe for pricing data
- Custom pricing API from each vendor
- Cron job to update prices daily

For now, manual updates work fine given industry pricing stability.
