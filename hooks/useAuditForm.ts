import { useState, useEffect } from 'react';
import { FormState } from '@/lib/types';

const STORAGE_KEY = 'ai-audit-form-state';

export function useAuditForm() {
  const [formState, setFormState] = useState<FormState>({
    tools: [],
    teamSize: 1,
    useCase: '',
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormState(JSON.parse(saved));
      } catch (e) {
        console.error('[v0] Failed to parse saved form state:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage on change
  const updateFormState = (newState: FormState) => {
    setFormState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const addTool = () => {
    const newTool = {
      id: Math.random().toString(36).substring(7),
      name: '',
      plan: '',
      monthlySpend: 0,
      seats: 1,
    };
    updateFormState({
      ...formState,
      tools: [...formState.tools, newTool],
    });
  };

  const removeTool = (id: string) => {
    updateFormState({
      ...formState,
      tools: formState.tools.filter((t) => t.id !== id),
    });
  };

  const updateTool = (id: string, updates: Partial<(typeof formState.tools)[0]>) => {
    updateFormState({
      ...formState,
      tools: formState.tools.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    });
  };

  const updateTeamSize = (size: number) => {
    updateFormState({
      ...formState,
      teamSize: size,
    });
  };

  const updateUseCase = (useCase: string) => {
    updateFormState({
      ...formState,
      useCase,
    });
  };

  const clearForm = () => {
    const cleared: FormState = {
      tools: [],
      teamSize: 1,
      useCase: '',
    };
    updateFormState(cleared);
  };

  return {
    formState,
    isHydrated,
    addTool,
    removeTool,
    updateTool,
    updateTeamSize,
    updateUseCase,
    clearForm,
  };
}
