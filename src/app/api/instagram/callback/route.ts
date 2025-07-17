import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('Instagram OAuth error:', { error, errorReason, errorDescription });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin?instagram_error=${error}&error_reason=${errorReason}&error_description=${errorDescription}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin?instagram_error=no_code`
      );
    }

    // Exchange the authorization code for an access token
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/instagram/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin?instagram_error=token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();

    // Redirect back to admin with success and token data
    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin?instagram_success=true&access_token=${tokenData.access_token}&user_id=${tokenData.user_id}&expires_in=${tokenData.expires_in}`;
    
    return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error('Error in Instagram callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin?instagram_error=callback_error`
    );
  }
} 