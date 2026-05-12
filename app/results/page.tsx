'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AuditResult } from '@/lib/audit-engine';
import { AuditInput } from '@/lib/types';
import { LeadCapture } from '@/components/LeadCapture';
import Link from 'next/link';
import { ArrowRight, TrendingDown, AlertCircle } from 'lucide-react';

interface AuditData {
  input: AuditInput;
  result: AuditResult;
}

export default function ResultsPage() {
  const router = useRouter();
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('auditResult');
    if (!stored) {
      router.push('/');
      return;
    }

    const data = JSON.parse(stored) as AuditData;
    setAuditData(data);

    // Generate AI summary
    generateSummary(data);
  }, [router]);

  const generateSummary = async (data: AuditData) => {
    setLoadingSummary(true);
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setAiSummary(result.summary);
      } else {
        // Fallback summary
        const topSaving = data.result.recommendations
          .filter((r) => r.monthlySavings > 0)
          .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

        const fallback = topSaving
          ? `Based on your stack of ${data.input.tools.length} AI tools, you're spending $${data.result.totalCurrentMonthlySpend.toFixed(2)}/mo. Our top recommendation is to ${topSaving.recommendation}, which alone saves $${topSaving.monthlySavings.toFixed(2)}/mo.`
          : `You're spending $${data.result.totalCurrentMonthlySpend.toFixed(2)}/mo on ${data.input.tools.length} AI tools. Your current setup is well-optimized.`;

        setAiSummary(fallback);
      }
    } catch (error) {
      console.error('[v0] Failed to generate summary:', error);
      setAiSummary('Unable to generate AI summary at this time.');
    } finally {
      setLoadingSummary(false);
    }
  };

  if (!auditData) return null;

  const { input, result } = auditData;
  const hasSignificantSavings = result.totalSavingsMonthly >= 500;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link href="/" className="text-sm text-primary hover:underline mb-4 inline-block">
            ← Back to Audit
          </Link>
          <h1 className="text-3xl font-bold text-balance">Your Audit Results</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Savings Hero */}
        <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-lg p-8 text-center space-y-4">
          <p className="text-muted-foreground">Total Monthly Savings</p>
          <p className="text-5xl font-bold text-accent">
            ${result.totalSavingsMonthly.toFixed(0)}
          </p>
          <p className="text-xl text-muted-foreground">
            ${result.totalSavingsAnnual.toFixed(0)} per year
          </p>
          {result.isOptimal && (
            <div className="bg-primary/20 border border-primary rounded p-3 text-sm text-foreground rounded mt-4">
              You&apos;re spending well across your AI tools
            </div>
          )}
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <Card className="border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">AI-Powered Summary</h2>
            <p className="text-muted-foreground leading-relaxed">{aiSummary}</p>
          </Card>
        )}

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
              <AlertCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">Your current setup is well-optimized!</p>
            </Card>
          )}
        </section>

        {/* Tool Summary */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Current Spend</h2>
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
              <span>Total</span>
              <span>${result.totalCurrentMonthlySpend.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        {hasSignificantSavings && (
          <div className="bg-accent text-accent-foreground rounded-lg p-6 space-y-4 border border-accent">
            <h3 className="text-lg font-semibold">Book a Credex Consultation</h3>
            <p>
              With ${result.totalSavingsMonthly.toFixed(0)}/month in potential savings, our team
              can help you implement these optimizations.
            </p>
            <Button className="w-full bg-accent-foreground text-accent hover:bg-accent-foreground/90">
              Schedule Consultation <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Lead Capture */}
        <LeadCapture auditData={auditData} />
      </main>
    </div>
  );
}
