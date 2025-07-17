import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

    if (!clientSecret) {
      return NextResponse.json(
        { error: 'Instagram credentials not configured' },
        { status: 500 }
      );
    }

    // Refresh the long-lived access token
    const refreshResponse = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${access_token}`
    );

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.text();
      console.error('Instagram token refresh error:', errorData);
      return NextResponse.json(
        { error: 'Failed to refresh access token' },
        { status: 400 }
      );
    }

    const refreshData = await refreshResponse.json();

    return NextResponse.json({
      access_token: refreshData.access_token,
      expires_in: refreshData.expires_in,
      token_type: 'refreshed',
    });
  } catch (error) {
    console.error('Error in Instagram token refresh:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 