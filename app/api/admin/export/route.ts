import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    const configuredKey = process.env.ADMIN_API_KEY;

    if (!configuredKey || adminKey !== configuredKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: leads, error } = await supabase
      .from('audit_leads')
      .select('email, company, role, team_size, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[v0] Export error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    // Convert to CSV
    const headers = ['Email', 'Company', 'Role', 'Team Size', 'Created At'];
    const rows = (leads || []).map((lead) => [
      lead.email,
      lead.company || '',
      lead.role || '',
      lead.team_size || '',
      new Date(lead.created_at).toISOString().split('T')[0],
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma
            if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(',')
      ),
    ].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[v0] Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export' },
      { status: 500 }
    );
  }
}
