'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolInput } from '@/components/ToolInput';
import { useAuditForm } from '@/hooks/useAuditForm';
import { auditSpend } from '@/lib/audit-engine';
import { USE_CASES } from '@/lib/pricing-data';

export default function Home() {
  const router = useRouter();
  const {
    formState,
    isHydrated,
    addTool,
    removeTool,
    updateTool,
    updateTeamSize,
    updateUseCase,
  } = useAuditForm();
  const [isLoading, setIsLoading] = useState(false);

  const handleAudit = async () => {
    if (!formState.useCase || formState.tools.length === 0) {
      alert('Please select a use case and add at least one tool');
      return;
    }

    setIsLoading(true);
    try {
      // Run the audit engine
      const auditInput = {
        tools: formState.tools.map((t) => ({
          name: t.name as any,
          plan: t.plan,
          monthlySpend: t.monthlySpend,
          seats: t.seats,
        })),
        teamSize: formState.teamSize,
        useCase: formState.useCase as any,
      };

      const result = auditSpend(auditInput);

      // Store result in session storage for results page
      sessionStorage.setItem(
        'auditResult',
        JSON.stringify({
          input: auditInput,
          result,
        })
      );

      router.push('/results');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-balance">AI Stack Auditor</h1>
          </div>
          <p className="text-muted-foreground">
            Identify overspending and find instant savings across your AI tools
          </p>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Team & Use Case Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Team Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teamSize" className="text-sm font-medium">
                  Team Size
                </Label>
                <Input
                  id="teamSize"
                  type="number"
                  value={formState.teamSize}
                  onChange={(e) => updateTeamSize(parseInt(e.target.value) || 1)}
                  className="bg-background border-border"
                  placeholder="1"
                  min="1"
                  step="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="useCase" className="text-sm font-medium">
                  Primary Use Case
                </Label>
                <Select value={formState.useCase} onValueChange={updateUseCase}>
                  <SelectTrigger id="useCase" className="bg-background border-border">
                    <SelectValue placeholder="Select use case" />
                  </SelectTrigger>
                  <SelectContent>
                    {USE_CASES.map((useCase) => (
                      <SelectItem key={useCase} value={useCase}>
                        {useCase}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Tools Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. AI Tools & Spend</h2>
            <p className="text-sm text-muted-foreground">
              Add each AI tool your team uses and its current spend
            </p>

            <div className="space-y-3">
              {formState.tools.map((tool) => (
                <ToolInput
                  key={tool.id}
                  {...tool}
                  onUpdate={(updates) => updateTool(tool.id, updates)}
                  onRemove={() => removeTool(tool.id)}
                />
              ))}
            </div>

            <Button
              onClick={addTool}
              variant="outline"
              className="w-full border-dashed border-muted text-muted-foreground hover:text-foreground hover:border-foreground"
            >
              + Add Tool
            </Button>
          </section>

          {/* Submit Button */}
          <section className="flex gap-3">
            <Button
              onClick={handleAudit}
              disabled={isLoading || !formState.useCase || formState.tools.length === 0}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
              size="lg"
            >
              {isLoading ? 'Auditing...' : 'Audit My AI Spend'}
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}
