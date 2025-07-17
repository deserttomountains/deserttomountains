import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/instagram/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Instagram credentials not configured' },
        { status: 500 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Instagram token exchange error:', errorData);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code for token' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();

    // Get long-lived access token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${tokenData.access_token}`
    );

    if (!longLivedTokenResponse.ok) {
      console.error('Failed to get long-lived token');
      // Return short-lived token if long-lived token fails
      return NextResponse.json({
        access_token: tokenData.access_token,
        user_id: tokenData.user_id,
        expires_in: 3600, // 1 hour
        token_type: 'short_lived',
      });
    }

    const longLivedTokenData = await longLivedTokenResponse.json();

    return NextResponse.json({
      access_token: longLivedTokenData.access_token,
      user_id: tokenData.user_id,
      expires_in: longLivedTokenData.expires_in,
      token_type: 'long_lived',
    });
  } catch (error) {
    console.error('Error in Instagram token exchange:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 