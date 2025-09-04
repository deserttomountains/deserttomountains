/**
 * Notification API Routes
 * Handles notification listing and creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserNotifications,
  createNotification
} from '@/lib/messaging/notifications';

// GET /api/notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as any;
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const notifications = await getUserNotifications(userId, status, limit);
    
    return NextResponse.json({
      notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, message, priority, targetUserId, targetRole, metadata } = body;
    
    if (!type || !title || !message || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const notificationId = await createNotification({
      type,
      title,
      message,
      priority,
      targetUserId,
      targetRole,
      metadata: metadata || {}
    });
    
    return NextResponse.json({
      id: notificationId,
      success: true
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
