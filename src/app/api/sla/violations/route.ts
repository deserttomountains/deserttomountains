import { NextRequest, NextResponse } from 'next/server';
import { getSLAViolations } from '@/lib/messaging/notifications';

// GET /api/sla/violations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '50');

    const violations = await getSLAViolations(status);
    return NextResponse.json({ violations: violations.slice(0, limit), count: violations.length, total: violations.length });
  } catch (error) {
    console.error('Error getting SLA violations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
