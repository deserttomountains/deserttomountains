import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check environment variables (without exposing sensitive data)
    const config = {
      environment: process.env.NEXT_PUBLIC_CASHFREE_ENV || 'NOT_SET',
      hasClientId: !!process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID,
      hasClientSecret: !!process.env.CASHFREE_CLIENT_SECRET,
      hasWebhookSecret: !!process.env.CASHFREE_WEBHOOK_SECRET,
      clientIdPrefix: process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID ? 
        process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID.substring(0, 10) + '...' : 'NOT_SET',
      baseUrl: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD' 
        ? 'https://api.cashfree.com/pg' 
        : 'https://sandbox.cashfree.com/pg'
    };

    return NextResponse.json({
      status: 'success',
      message: 'Cashfree configuration check',
      config,
      recommendations: [
        'Make sure NEXT_PUBLIC_CASHFREE_ENV is set to "PROD" for production',
        'Ensure all Cashfree credentials are properly set in .env.local',
        'Check that your Cashfree account is active and has proper permissions'
      ]
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check configuration',
      error: error.message
    }, { status: 500 });
  }
}
