import { NextRequest, NextResponse } from 'next/server';
import { getActiveSLARules, createSLARule } from '@/lib/messaging/notifications';

// GET /api/sla/rules
export async function GET(request: NextRequest) {
  try {
    const rules = await getActiveSLARules();
    return NextResponse.json({ rules, count: rules.length });
  } catch (error) {
    console.error('Error getting SLA rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/sla/rules
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type, timeLimitMinutes, priority, channels, conditions, actions } = body;

    if (!name || !description || !type || !timeLimitMinutes || !priority || !channels) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const ruleId = await createSLARule({
      name,
      description,
      type,
      timeLimitMinutes,
      priority,
      channels,
      conditions: conditions || {},
      actions: actions || { notifyUsers: [], notifyRoles: [] },
      isActive: true
    });

    return NextResponse.json({ id: ruleId, success: true });
  } catch (error) {
    console.error('Error creating SLA rule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
