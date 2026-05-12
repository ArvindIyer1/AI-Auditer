import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    const adminKey = process.env.ADMIN_API_KEY;

    if (!adminKey) {
      return NextResponse.json(
        { error: 'Admin API key not configured' },
        { status: 500 }
      );
    }

    if (apiKey === adminKey) {
      return NextResponse.json(
        { authenticated: true },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[v0] Admin verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify' },
      { status: 500 }
    );
  }
}
