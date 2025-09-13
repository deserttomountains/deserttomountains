import { NextRequest, NextResponse } from 'next/server';
import { resolveSLAViolation } from '@/lib/messaging/notifications';

// POST /api/sla/violations/[id]/resolve
export async function POST(request: NextRequest, context: any) {
  try {
    const body = await request.json();
    const { resolvedBy, notes } = body;
    const params = await context.params;
    const violationId = params?.id as string | undefined;

    if (!violationId || !resolvedBy) {
      return NextResponse.json({ error: 'Violation ID and resolvedBy are required' }, { status: 400 });
    }

    await resolveSLAViolation(violationId, resolvedBy, notes);
    return NextResponse.json({ success: true, violationId, resolvedBy });
  } catch (error) {
    console.error('Error resolving SLA violation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
