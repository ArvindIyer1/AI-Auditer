'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface LeadCaptureProps {
  auditData: {
    input: any;
    result: any;
  };
}

export function LeadCapture({ auditData }: LeadCaptureProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company,
          role,
          teamSize: teamSize ? parseInt(teamSize) : null,
          auditData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save lead');
        return;
      }

      setSubmitted(true);
      setShareUrl(`${window.location.origin}/audit/${data.auditId}`);
    } catch (err) {
      console.error('[v0] Lead capture error:', err);
      setError('Failed to save lead. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3 text-accent">
          <CheckCircle className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Audit Report Saved</h2>
        </div>

        <p className="text-muted-foreground">
          We&apos;ve sent a confirmation email to <strong>{email}</strong>
        </p>

        <div className="bg-background rounded p-4 space-y-2">
          <p className="text-xs text-muted-foreground">Your shareable audit URL:</p>
          <p className="text-sm font-mono text-primary break-all">{shareUrl}</p>
        </div>

        <Button
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
          }}
          variant="outline"
          className="w-full"
        >
          Copy URL
        </Button>

        <Button
          onClick={() => {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just saved $${auditData.result.totalSavingsMonthly.toFixed(0)}/mo on AI tools using AI Stack Auditor ${shareUrl}`)}`);
          }}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Share on Twitter
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Save Your Audit Report</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-accent">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-background border-border"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Optional"
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role
            </Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., CTO, Tech Lead"
              className="bg-background border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamSize" className="text-sm font-medium">
            Team Size
          </Label>
          <Input
            id="teamSize"
            type="number"
            value={teamSize}
            onChange={(e) => setTeamSize(e.target.value)}
            placeholder="Optional"
            className="bg-background border-border"
            min="1"
          />
        </div>

        {error && (
          <div className="flex gap-2 items-start p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !email}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
          size="lg"
        >
          {isLoading ? 'Saving...' : 'Save Audit Report'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          We&apos;ll send you a confirmation email with your shareable audit URL
        </p>
      </form>
    </Card>
  );
}
