'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, AlertCircle, CheckCircle } from 'lucide-react';

interface Lead {
  id: string;
  email: string;
  company: string | null;
  role: string | null;
  team_size: number | null;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        setAuthenticated(true);
        await fetchLeads();
      } else {
        setError('Invalid API key');
      }
    } catch (err) {
      setError('Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/admin/leads', {
        headers: {
          'X-Admin-Key': apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads);
      }
    } catch (err) {
      console.error('[v0] Failed to fetch leads:', err);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await fetch('/api/admin/export', {
        headers: {
          'X-Admin-Key': apiKey,
        },
      });

      if (!response.ok) {
        setError('Failed to export leads');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Export completed successfully');
    } catch (err) {
      setError('Failed to export');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="border-border bg-card p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                Admin API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter admin key"
                className="bg-background border-border"
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
              disabled={loading || !apiKey}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage leads and audits</p>
          </div>
          <Button
            onClick={() => {
              setAuthenticated(false);
              setApiKey('');
            }}
            variant="outline"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-3xl font-bold text-foreground">{leads.length}</p>
            </Card>
          </div>

          {/* Export */}
          <Card className="border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Export Data</h2>
            <p className="text-sm text-muted-foreground">
              Download all captured leads as CSV for your CRM
            </p>

            {success && (
              <div className="flex gap-2 items-start p-3 bg-accent/20 border border-accent rounded text-sm text-accent">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{success}</p>
              </div>
            )}

            {error && (
              <div className="flex gap-2 items-start p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <Button
              onClick={handleExport}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Exporting...' : 'Export as CSV'}
            </Button>
          </Card>

          {/* Leads Table */}
          <Card className="border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Leads</h2>

            {leads.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No leads yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-2 font-semibold text-foreground">Email</th>
                      <th className="text-left py-2 font-semibold text-foreground">Company</th>
                      <th className="text-left py-2 font-semibold text-foreground">Role</th>
                      <th className="text-left py-2 font-semibold text-foreground">Team Size</th>
                      <th className="text-left py-2 font-semibold text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 text-primary">{lead.email}</td>
                        <td className="py-3 text-muted-foreground">{lead.company || '—'}</td>
                        <td className="py-3 text-muted-foreground">{lead.role || '—'}</td>
                        <td className="py-3 text-muted-foreground">
                          {lead.team_size || '—'}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
