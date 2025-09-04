/**
 * Test API for Local Development
 * Allows testing webhook functionality with sample data
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  whatsappInboundFixture, 
  instagramInboundFixture,
  whatsappStatusFixture,
  instagramDeliveryFixture,
  instagramReadFixture,
  instagramPostbackFixture,
  instagramReactionFixture
} from '@/lib/messaging/fixtures';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, fixture } = body;
    
    if (!type || !fixture) {
      return NextResponse.json(
        { error: 'Type and fixture are required' },
        { status: 400 }
      );
    }
    
    let payload: any;
    
    switch (fixture) {
      case 'whatsapp_inbound':
        payload = whatsappInboundFixture;
        break;
      case 'instagram_inbound':
        payload = instagramInboundFixture;
        break;
      case 'whatsapp_status':
        payload = whatsappStatusFixture;
        break;
      case 'instagram_delivery':
        payload = instagramDeliveryFixture;
        break;
      case 'instagram_read':
        payload = instagramReadFixture;
        break;
      case 'instagram_postback':
        payload = instagramPostbackFixture;
        break;
      case 'instagram_reaction':
        payload = instagramReactionFixture;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid fixture type' },
          { status: 400 }
        );
    }
    
    // Forward to appropriate webhook endpoint
    const webhookUrl = type === 'whatsapp' 
      ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/whatsapp`
      : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/instagram`;
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hub-signature-256': 'sha256=test_signature_for_local_dev'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      fixture,
      type,
      result
    });
    
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    available_fixtures: [
      'whatsapp_inbound',
      'instagram_inbound', 
      'whatsapp_status',
      'instagram_delivery',
      'instagram_read',
      'instagram_postback',
      'instagram_reaction'
    ],
    usage: {
      method: 'POST',
      body: {
        type: 'whatsapp|instagram',
        fixture: 'fixture_name'
      }
    }
  });
}
