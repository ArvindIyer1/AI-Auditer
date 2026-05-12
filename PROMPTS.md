# AI Stack Auditor - Prompts & System Instructions

## Anthropic Claude Summary Prompt

Used in `app/api/generate-summary/route.ts`

### Current Prompt

```
You are an AI expert analyzing a company's AI tool spending. Based on the following audit data, 
provide a concise 1-2 sentence personalized summary of their AI stack and key opportunity.

Current Stack:
[List of tools with plans and monthly spend]

Team Size: [number]
Use Case: [coding/writing/data/research/mixed]

Audit Results:
- Total Monthly Spend: $[amount]
- Total Monthly Savings Opportunity: $[amount]

Key Recommendations:
[List of top recommendations with savings amounts]

Provide a brief 1-2 sentence summary focused on:
1. Their current annual spend
2. The most impactful action they can take

Keep it conversational and actionable.
```

### Customization

To change the AI summary style:
1. Edit the prompt in `app/api/generate-summary/route.ts`
2. Adjust tone (more technical, more casual, more business-focused, etc.)
3. Change max_tokens to control length (currently 150)
4. Try different Claude models if needed

### Example Outputs

Good examples of what the summary should produce:

- "You're spending $4,800/year on Claude and ChatGPT separately. Consolidating to Claude Pro alone would save $2,400 annually while improving performance."

- "With a team of 5 developers, you're overspending on individual Cursor licenses. Switching to team plan would cut costs by $600/month."

- "Your current AI stack is well-optimized for your mixed-use case. The only opportunity is downgrading ChatGPT Team to Plus given your team size."

## Email Confirmation Prompt

No AI prompt here - it's hardcoded in `app/api/save-lead/route.ts`

To customize:
1. Edit the HTML email template in `app/api/save-lead/route.ts` 
2. Change subject line, greeting, key findings display
3. Add links to consultation booking or other CTAs

Current email includes:
- Confirmation that audit is ready
- Link to shareable report
- Key metrics (monthly spend, monthly savings, annual savings)
- Optional CTA for team follow-up

## Recommendation Engine Rules

The recommendation logic is not AI-powered - it uses hardcoded rules in `lib/audit-engine.ts`

Current rules focus on:

### Cursor
- Suggest Pro if team > 1 (team needs collaboration)
- Suggest Business if >= 5 seats and coding use case
- Downgrade if Business and <= 2 seats

### GitHub Copilot
- Downgrade Business to Individual if <= 2 users
- Downgrade Enterprise to Business if <= 5 users

### Claude
- Suggest Cursor for coding use case vs Claude Pro
- Downgrade Team to Pro if <= 2 users
- Flag Max as rarely justified

### ChatGPT
- Downgrade Team to Plus if <= 2 users
- Flag Enterprise as expensive alternative

### Gemini
- Compare pricing with Claude Pro
- Flag Ultra as rarely needed

To add new recommendations:
1. Edit `getRecommendation()` function in `lib/audit-engine.ts`
2. Add new if block for tool
3. Set recommendation text, recommended plan, and monthly savings
4. Test with various input combinations

## Customization Best Practices

1. **Email Tone**: Keep emails warm but professional
2. **Savings Calculations**: Be conservative - don't overstate savings
3. **Recommendation Threshold**: Only show recommendations if savings >= $10-20/month
4. **AI Summary Length**: Keep 1-2 sentences max for better shareability
5. **Recommendation Wording**: Be specific and actionable ("Switch to..." not "Consider...")
