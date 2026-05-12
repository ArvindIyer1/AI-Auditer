import { Tool, UseCase } from './pricing-data';

export interface AuditInput {
  tools: Array<{
    name: Tool;
    plan: string;
    monthlySpend: number;
    seats: number;
  }>;
  teamSize: number;
  useCase: UseCase;
}

export interface AuditRecommendation {
  toolName: Tool;
  currentPlan: string;
  currentMonthlySpend: number;
  seats: number;
  recommendation: string | null;
  recommendedPlan: string | null;
  monthlySavings: number;
  reason: string;
}

export interface AuditResult {
  recommendations: AuditRecommendation[];
  totalCurrentMonthlySpend: number;
  totalSavingsMonthly: number;
  totalSavingsAnnual: number;
  isOptimal: boolean;
}

export function auditSpend(input: AuditInput): AuditResult {
  const recommendations: AuditRecommendation[] = [];
  let totalCurrentMonthlySpend = 0;
  let totalSavingsMonthly = 0;

  for (const tool of input.tools) {
    totalCurrentMonthlySpend += tool.monthlySpend;

    const recommendation = getRecommendation(
      tool.name,
      tool.plan,
      tool.monthlySpend,
      tool.seats,
      input.teamSize,
      input.useCase
    );

    recommendations.push({
      toolName: tool.name,
      currentPlan: tool.plan,
      currentMonthlySpend: tool.monthlySpend,
      seats: tool.seats,
      ...recommendation,
    });

    totalSavingsMonthly += recommendation.monthlySavings;
  }

  const isOptimal = totalSavingsMonthly < 100 && recommendations.every((r) => !r.recommendation);

  return {
    recommendations,
    totalCurrentMonthlySpend,
    totalSavingsMonthly,
    totalSavingsAnnual: totalSavingsMonthly * 12,
    isOptimal,
  };
}

function getRecommendation(
  tool: Tool,
  plan: string,
  monthlySpend: number,
  seats: number,
  teamSize: number,
  useCase: UseCase
): Omit<AuditRecommendation, 'toolName' | 'currentPlan' | 'currentMonthlySpend' | 'seats'> {
  // Default: no change needed
  let recommendation: string | null = null;
  let recommendedPlan: string | null = null;
  let monthlySavings = 0;
  let reason = 'Optimal choice for your use case';

  // Cursor recommendations
  if (tool === 'Cursor') {
    if (plan === 'Hobby (Free)' && teamSize > 1) {
      recommendation = 'Upgrade to Pro for team collaboration';
      recommendedPlan = 'Pro ($20/month)';
      monthlySavings = 0; // Actually costs money, but better features
      reason = 'Team size requires paid plan';
    } else if (plan === 'Pro ($20/month)' && seats >= 5 && useCase === 'Coding') {
      recommendation = 'Switch to Business for 5+ seats';
      recommendedPlan = 'Business ($40/month)';
      monthlySavings = 0; // Actually more expensive, but better value
      reason = 'Business plan offers better pricing at scale';
    } else if (plan === 'Business ($40/month)' && seats <= 2) {
      recommendation = 'Downgrade to Pro plan';
      recommendedPlan = 'Pro ($20/month)';
      monthlySavings = 20;
      reason = 'Pro plan sufficient for small teams';
    }
  }

  // GitHub Copilot recommendations
  if (tool === 'GitHub Copilot') {
    if (plan === 'Business ($19/seat/month)' && seats <= 2) {
      recommendation = 'Switch Individual plan for 1-2 users';
      recommendedPlan = 'Individual ($10/month)';
      monthlySavings = monthlySpend - 10;
      reason = 'Individual plan more cost-effective for small teams';
    } else if (plan === 'Enterprise ($39/seat/month)' && seats <= 5) {
      recommendation = 'Downgrade to Business plan';
      recommendedPlan = 'Business ($19/seat/month)';
      monthlySavings = monthlySpend - 19 * seats;
      reason = 'Business plan sufficient for teams under 6';
    }
  }

  // Claude recommendations
  if (tool === 'Claude') {
    if (plan === 'Pro ($20/month)' && useCase === 'Coding') {
      recommendation = 'Consider Cursor Pro for coding workflows';
      recommendedPlan = 'Cursor Pro ($20/month)';
      monthlySavings = 0;
      reason = 'Cursor optimized for coding use cases';
    } else if (plan === 'Team ($30/seat/month)' && seats <= 2) {
      recommendation = 'Switch to Pro plan';
      recommendedPlan = 'Pro ($20/month)';
      monthlySavings = monthlySpend - 20;
      reason = 'Pro plan sufficient for individual/small team usage';
    } else if (plan === 'Max ($100/month)') {
      recommendation = 'Downgrade to Team plan unless heavy API usage';
      recommendedPlan = 'Team ($30/seat/month)';
      monthlySavings = 70; // Assumes ~1 seat
      reason = 'Max rarely justified unless running heavy inference';
    }
  }

  // ChatGPT recommendations
  if (tool === 'ChatGPT') {
    if (plan === 'Team ($30/seat/month)' && seats <= 2) {
      recommendation = 'Switch to Plus for individual users';
      recommendedPlan = 'Plus ($20/month)';
      monthlySavings = monthlySpend - 20;
      reason = 'Plus plan better value for small teams';
    } else if (plan === 'Enterprise (Custom)') {
      recommendation = 'Audit Enterprise needs vs Team plan';
      recommendedPlan = 'Team ($30/seat/month)';
      monthlySavings = monthlySpend * 0.2; // Rough estimate
      reason = 'Team plan often sufficient; Enterprise should be last resort';
    }
  }

  // Gemini recommendations
  if (tool === 'Gemini') {
    if (plan === 'Pro ($20/month)') {
      recommendation = 'Compare pricing with Claude Pro';
      recommendedPlan = 'Claude Pro ($20/month)';
      monthlySavings = 0;
      reason = 'Claude Pro better for many use cases';
    } else if (plan === 'Ultra ($30/month)') {
      recommendation = 'Verify if Ultra is truly needed';
      recommendedPlan = 'Team ($30/seat/month)';
      monthlySavings = 0;
      reason = 'Team plans may offer better value';
    }
  }

  return {
    recommendation,
    recommendedPlan,
    monthlySavings: Math.max(0, monthlySavings),
    reason,
  };
}
