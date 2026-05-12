import { AuditInput, AuditResult } from './audit-engine';

export interface FormState {
  tools: Array<{
    id: string;
    name: string;
    plan: string;
    monthlySpend: number;
    seats: number;
  }>;
  teamSize: number;
  useCase: string;
}

export interface AuditSession {
  input: AuditInput;
  result: AuditResult;
  summary: string;
}
