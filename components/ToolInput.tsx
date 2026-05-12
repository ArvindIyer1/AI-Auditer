'use client';

import { Tool, TOOLS, PRICING } from '@/lib/pricing-data';
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
import { X } from 'lucide-react';

interface ToolInputProps {
  id: string;
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
  onUpdate: (updates: Partial<ToolInputProps>) => void;
  onRemove: () => void;
}

export function ToolInput({
  id,
  name,
  plan,
  monthlySpend,
  seats,
  onUpdate,
  onRemove,
}: ToolInputProps) {
  const selectedTool = TOOLS.find((t) => t === name) as Tool | undefined;
  const toolPricing = selectedTool ? PRICING[selectedTool] : null;
  const planOptions = toolPricing ? Object.keys(toolPricing.plans) : [];

  const handleToolChange = (newName: string) => {
    const newTool = TOOLS.find((t) => t === newName) as Tool;
    const newPlans = Object.keys(PRICING[newTool].plans);
    onUpdate({
      name: newName,
      plan: newPlans[0],
      monthlySpend: PRICING[newTool].plans[newPlans[0]] || 0,
    });
  };

  const handlePlanChange = (newPlan: string) => {
    if (!selectedTool) return;
    const newSpend = PRICING[selectedTool].plans[newPlan] || 0;
    onUpdate({
      plan: newPlan,
      monthlySpend: newSpend,
    });
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-4 bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {name || 'Select a tool'}
        </h3>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Remove tool"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Tool</Label>
          <Select value={name} onValueChange={handleToolChange}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select tool" />
            </SelectTrigger>
            <SelectContent>
              {TOOLS.map((tool) => (
                <SelectItem key={tool} value={tool}>
                  {tool}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Plan</Label>
          <Select value={plan} onValueChange={handlePlanChange}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              {planOptions.map((planOption) => (
                <SelectItem key={planOption} value={planOption}>
                  {planOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Monthly Spend</Label>
          <Input
            type="number"
            value={monthlySpend}
            onChange={(e) => onUpdate({ monthlySpend: parseFloat(e.target.value) || 0 })}
            className="bg-background border-border"
            placeholder="$0"
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Seats</Label>
          <Input
            type="number"
            value={seats}
            onChange={(e) => onUpdate({ seats: parseInt(e.target.value) || 1 })}
            className="bg-background border-border"
            placeholder="1"
            min="1"
            step="1"
          />
        </div>
      </div>
    </div>
  );
}
