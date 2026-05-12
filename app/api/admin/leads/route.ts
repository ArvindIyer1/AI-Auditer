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
      .select('id, email, company, role, team_size, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[v0] Leads fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({ leads }, { status: 200 });
  } catch (error) {
    console.error('[v0] Admin leads error:', error);
    return NextResponse.json(
      { error: 'Failed to get leads' },
      { status: 500 }
    );
  }
}
