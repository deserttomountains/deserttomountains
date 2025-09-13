/**
 * Meta API Connection Test
 * Tests the connection to Meta's WhatsApp Business API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get environment variables
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';

    // Check if required environment variables are set
    if (!accessToken || !phoneNumberId || !businessAccountId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required environment variables',
        details: {
          hasAccessToken: !!accessToken,
          hasPhoneNumberId: !!phoneNumberId,
          hasBusinessAccountId: !!businessAccountId,
          apiVersion
        }
      }, { status: 400 });
    }

    // Test Meta API connection by making a simple API call
    // We'll try to get the phone number info which is a lightweight operation
    const testUrl = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Meta API connection successful',
        data: {
          phoneNumberId: data.id,
          displayPhoneNumber: data.display_phone_number,
          verifiedName: data.verified_name,
          qualityRating: data.quality_rating,
          apiVersion
        }
      });
    } else {
      const errorData = await response.json();
      return NextResponse.json({
        success: false,
        error: 'Meta API connection failed',
        details: {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || 'Unknown error',
          apiVersion
        }
      }, { status: response.status });
    }

  } catch (error) {
    console.error('Meta API connection test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Meta API connection test failed',
      details: {
        message: error instanceof Error ? error.message : 'Unknown error',
        type: 'network_error'
      }
    }, { status: 500 });
  }
}
