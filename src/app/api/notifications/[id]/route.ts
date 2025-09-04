import { NextRequest, NextResponse } from 'next/server';
import { markNotificationAsRead, acknowledgeNotification } from '@/lib/messaging/notifications';

export async function PATCH(request: NextRequest, context: any) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const notificationId = context?.params?.id as string | undefined;
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'read':
        await markNotificationAsRead(notificationId);
        break;
      case 'acknowledge':
        await acknowledgeNotification(notificationId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      action
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
