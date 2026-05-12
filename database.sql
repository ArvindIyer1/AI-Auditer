-- Create tables for AI Stack Auditor
-- Execute this in Supabase SQL Editor

-- Audits table - stores completed audits
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit items table - individual tool recommendations
CREATE TABLE IF NOT EXISTS audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  current_plan TEXT NOT NULL,
  monthly_spend DECIMAL(10, 2) NOT NULL,
  seats INTEGER NOT NULL,
  recommendation TEXT,
  monthly_savings DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table - captured email leads
CREATE TABLE IF NOT EXISTS audit_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  role TEXT,
  team_size INTEGER,
  audit_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_items_audit_id ON audit_items(audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_leads_email ON audit_leads(email);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);
