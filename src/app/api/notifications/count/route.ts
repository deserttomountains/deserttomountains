import { NextRequest, NextResponse } from 'next/server';
import { getUnreadNotificationCount } from '@/lib/messaging/notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const count = await getUnreadNotificationCount(userId);
    
    return NextResponse.json({
      count,
      userId
    });
  } catch (error) {
    console.error('Error getting notification count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


