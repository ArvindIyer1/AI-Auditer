import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const { input, result } = await request.json();

    const client = new Anthropic();

    // Build a detailed prompt for the AI
    const toolsList = input.tools
      .map(
        (t: any) =>
          `- ${t.name} (${t.plan}): $${t.monthlySpend.toFixed(2)}/month, ${t.seats} seat(s)`
      )
      .join('\n');

    const recommendationsList = result.recommendations
      .filter((r: any) => r.recommendation)
      .map(
        (r: any) =>
          `- ${r.toolName}: ${r.recommendation} (save $${r.monthlySavings.toFixed(2)}/month)`
      )
      .join('\n');

    const prompt = `You are an AI expert analyzing a company's AI tool spending. Based on the following audit data, provide a concise 1-2 sentence personalized summary of their AI stack and key opportunity.

Current Stack:
${toolsList}

Team Size: ${input.teamSize}
Use Case: ${input.useCase}

Audit Results:
- Total Monthly Spend: $${result.totalCurrentMonthlySpend.toFixed(2)}
- Total Monthly Savings Opportunity: $${result.totalSavingsMonthly.toFixed(2)}

Key Recommendations:
${recommendationsList || 'No changes recommended - current setup is well-optimized'}

Provide a brief 1-2 sentence summary focused on:
1. Their current annual spend
2. The most impactful action they can take

Keep it conversational and actionable.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const summary =
      message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate summary';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('[v0] Summary generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
