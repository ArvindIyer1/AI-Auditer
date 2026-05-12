import { supabase } from '@/lib/supabase';
import { AuditResult } from '@/lib/audit-engine';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const { data } = await supabase
      .from('audits')
      .select('audit_data')
      .eq('id', id)
      .single();

    if (!data) {
      return {
        title: 'Audit Not Found',
        description: 'This audit report does not exist.',
      };
    }

    const auditData = data.audit_data as { result: AuditResult };
    const savings = auditData.result.totalSavingsMonthly;
    const topRec = auditData.result.recommendations
      .filter((r) => r.monthlySavings > 0)
      .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

    return {
      title: `I saved $${savings.toFixed(0)}/mo on AI tools`,
      description: topRec
        ? `I optimized my AI stack using AI Stack Auditor. Top recommendation: ${topRec.recommendation}`
        : 'Check out my AI Stack Audit Report',
      openGraph: {
        title: `I saved $${savings.toFixed(0)}/mo on AI tools`,
        description: topRec?.recommendation || 'See my AI Stack optimization',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `I saved $${savings.toFixed(0)}/mo on AI tools`,
        description: topRec?.recommendation,
      },
    };
  } catch (error) {
    return {
      title: 'AI Stack Auditor',
      description: 'Audit your AI tool spending',
    };
  }
}

export default async function AuditPage({ params }: PageProps) {
  const { id } = await params;

  let auditData = null;
  let error = null;

  try {
    const { data, error: queryError } = await supabase
      .from('audits')
      .select('audit_data, created_at')
      .eq('id', id)
      .single();

    if (queryError || !data) {
      error = 'Audit not found';
    } else {
      auditData = data;
    }
  } catch (e) {
    error = 'Failed to load audit';
  }

  if (error || !auditData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Audit Not Found</h1>
          <p className="text-muted-foreground">{error || 'This audit report does not exist.'}</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">Create Your Own Audit</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { input, result } = auditData.audit_data as {
    input: any;
    result: AuditResult;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="text-sm text-primary hover:underline mb-4 inline-block">
            ← AI Stack Auditor
          </Link>
          <h1 className="text-3xl font-bold text-balance">Shared Audit Report</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Savings Hero */}
        <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-lg p-8 text-center space-y-4">
          <p className="text-muted-foreground">Total Monthly Savings Opportunity</p>
          <p className="text-5xl font-bold text-accent">${result.totalSavingsMonthly.toFixed(0)}</p>
          <p className="text-xl text-muted-foreground">${result.totalSavingsAnnual.toFixed(0)} per year</p>
        </div>

        {/* Recommendations */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Recommendations</h2>

          {result.recommendations
            .filter((r) => r.recommendation)
            .length > 0 ? (
            <div className="grid gap-3">
              {result.recommendations
                .filter((r) => r.recommendation)
                .sort((a, b) => b.monthlySavings - a.monthlySavings)
                .map((rec, idx) => (
                  <Card key={idx} className="border-border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{rec.toolName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Current: {rec.currentPlan} • ${rec.currentMonthlySpend.toFixed(2)}/mo
                        </p>
                      </div>
                      {rec.monthlySavings > 0 && (
                        <div className="text-right">
                          <p className="text-sm font-semibold text-accent flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" />
                            ${rec.monthlySavings.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-background rounded p-3 space-y-2">
                      <p className="text-sm font-semibold text-foreground">
                        {rec.recommendation}
                      </p>
                      {rec.recommendedPlan && (
                        <p className="text-xs text-muted-foreground">
                          Recommended: {rec.recommendedPlan}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground italic">{rec.reason}</p>
                    </div>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="border-border bg-card p-6 text-center">
              <p className="text-muted-foreground">This audit shows an optimized AI tool stack</p>
            </Card>
          )}
        </section>

        {/* Tool Summary */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Current Spend Breakdown</h2>
          <div className="grid gap-2">
            {result.recommendations.map((rec, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-card border border-border rounded">
                <span className="text-sm">
                  {rec.toolName} ({rec.seats} {rec.seats === 1 ? 'seat' : 'seats'})
                </span>
                <span className="font-semibold text-foreground">
                  ${rec.currentMonthlySpend.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center p-3 bg-primary/10 border border-primary rounded font-semibold">
              <span>Total Monthly Spend</span>
              <span>${result.totalCurrentMonthlySpend.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-accent text-accent-foreground rounded-lg p-6 space-y-4 border border-accent text-center">
          <h3 className="text-lg font-semibold">Ready to optimize your AI stack?</h3>
          <p>Create your own AI spend audit and discover your savings opportunities.</p>
          <Link href="/">
            <Button className="bg-accent-foreground text-accent hover:bg-accent-foreground/90">
              Create Your Audit <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
          <p>
            This audit was created with{' '}
            <Link href="/" className="text-primary hover:underline">
              AI Stack Auditor
            </Link>
            {' '}by Credex
          </p>
        </div>
      </main>
    </div>
  );
}
