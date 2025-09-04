import { NextRequest, NextResponse } from 'next/server';
import { checkSLACompliance } from '@/lib/messaging/notifications';

// POST /api/sla/check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { threadId } = body;

    if (!threadId) {
      return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
    }

    const violations = await checkSLACompliance(threadId);
    return NextResponse.json({ violations, count: violations.length, threadId });
  } catch (error) {
    console.error('Error checking SLA compliance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
