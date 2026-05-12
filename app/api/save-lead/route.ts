import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isRateLimited, getClientIP } from '@/lib/rate-limit';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, company, role, teamSize, auditData, website } = await request.json();

    // Honeypot check
    if (website) {
      // Silently reject if honeypot field is filled
      return NextResponse.json(
        { auditId: 'dummy', message: 'Lead saved' },
        { status: 200 }
      );
    }

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Save to Supabase
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert([
        {
          audit_data: auditData,
        },
      ])
      .select('id')
      .single();

    if (auditError || !audit) {
      console.error('[v0] Audit insert error:', auditError);
      return NextResponse.json(
        { error: 'Failed to save audit' },
        { status: 500 }
      );
    }

    // Save lead - handle duplicate email gracefully
    const { error: leadError } = await supabase
      .from('audit_leads')
      .insert([
        {
          email,
          company: company || null,
          role: role || null,
          team_size: teamSize || null,
          audit_data: auditData,
        },
      ]);

    // Ignore duplicate email error
    if (leadError && !leadError.message.includes('duplicate')) {
      console.error('[v0] Lead insert error:', leadError);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    // Send confirmation email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'noreply@auditor.credex.app',
          to: email,
          subject: 'Your AI Audit Report is Ready',
          html: `
            <h1>Your AI Stack Audit is Complete!</h1>
            <p>Hi there,</p>
            <p>We've completed your AI tool spend audit. You can access your personalized audit report here:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/audit/${audit.id}">View Your Audit Report</a>
            <p>Key Findings:</p>
            <ul>
              <li>Total Monthly Spend: $${auditData.result.totalCurrentMonthlySpend.toFixed(2)}</li>
              <li>Potential Monthly Savings: $${auditData.result.totalSavingsMonthly.toFixed(2)}</li>
              <li>Annual Savings: $${auditData.result.totalSavingsAnnual.toFixed(2)}</li>
            </ul>
            <p>Our team will reach out if we find additional optimization opportunities for your stack.</p>
            <p>Best regards,<br>Credex AI Auditor</p>
          `,
        });
      } catch (emailError) {
        console.error('[v0] Email send error:', emailError);
        // Continue even if email fails - lead is saved
      }
    }

    return NextResponse.json(
      { auditId: audit.id, message: 'Lead saved and email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Save lead error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
