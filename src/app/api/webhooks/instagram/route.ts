/**
 * Instagram Webhook Route
 * Handles incoming Instagram messages and webhook verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getRawBody, 
  verifyInstagramSignature, 
  extractSignature,
  validateWebhookToken,
  generateWebhookChallenge,
  logWebhookSecurityEvent
} from '@/lib/messaging/security';
import { mapInstagramInbound } from '@/lib/messaging/mappers';
import { InstagramWebhookEvent } from '@/lib/messaging/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Handle webhook verification
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    
    if (mode === 'subscribe' && challenge) {
      const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;
      
      if (!expectedToken) {
        console.error('INSTAGRAM_WEBHOOK_VERIFY_TOKEN not configured');
        return new NextResponse('Forbidden', { status: 403 });
      }
      
      if (validateWebhookToken(token || '', expectedToken)) {
        logWebhookSecurityEvent('token_verified', 'instagram');
        return generateWebhookChallenge(challenge);
      } else {
        logWebhookSecurityEvent('token_failed', 'instagram');
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
    
    return new NextResponse('Forbidden', { status: 403 });
  } catch (error) {
    console.error('Instagram webhook GET error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(request);
    const body = JSON.parse(rawBody.toString()) as InstagramWebhookEvent;
    
    // Verify webhook signature
    const signature = extractSignature(request, 'x-hub-signature-256');
    if (!signature) {
      console.error('Missing Instagram webhook signature');
      logWebhookSecurityEvent('signature_failed', 'instagram', { reason: 'missing_signature' });
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    const isValidSignature = verifyInstagramSignature(rawBody, signature);
    if (!isValidSignature) {
      console.error('Invalid Instagram webhook signature');
      logWebhookSecurityEvent('signature_failed', 'instagram', { reason: 'invalid_signature' });
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    logWebhookSecurityEvent('signature_verified', 'instagram');
    
    // Process webhook events
    if (body.object === 'instagram' && body.entry) {
      for (const entry of body.entry) {
        await processInstagramEntry(entry);
      }
    }
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Instagram webhook POST error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processInstagramEntry(entry: any) {
  try {
    // Handle messaging events
    if (entry.messaging) {
      for (const messaging of entry.messaging) {
        await processInstagramMessaging(messaging);
      }
    }

    // Handle postback events
    if (entry.postback) {
      for (const postback of entry.postback) {
        await processInstagramPostback(postback);
      }
    }

    // Handle reaction events
    if (entry.reaction) {
      for (const reaction of entry.reaction) {
        await processInstagramReaction(reaction);
      }
    }

    // Handle delivery events
    if (entry.delivery) {
      for (const delivery of entry.delivery) {
        await processInstagramDelivery(delivery);
      }
    }

    // Handle read events
    if (entry.read) {
      for (const read of entry.read) {
        await processInstagramRead(read);
      }
    }
  } catch (error) {
    console.error('Error processing Instagram entry:', error);
  }
}

async function processInstagramMessaging(messaging: any) {
  try {
    if (messaging.message) {
      // Map Instagram message to our internal format
      const mappedData = await mapInstagramInbound({
        messaging,
        entry: { id: messaging.sender.id }
      });
      
      if (mappedData) {
        // Store in database (this will be implemented in the mappers)
        console.log('Instagram message processed:', mappedData.message.id);
      }
    }
  } catch (error) {
    console.error('Error processing Instagram messaging:', error);
  }
}

async function processInstagramPostback(postback: any) {
  try {
    console.log('Instagram postback:', postback.postback.payload);
    // TODO: Handle postback actions
  } catch (error) {
    console.error('Error processing Instagram postback:', error);
  }
}

async function processInstagramReaction(reaction: any) {
  try {
    console.log('Instagram reaction:', reaction.reaction.action, reaction.reaction.emoji);
    // TODO: Handle reaction updates
  } catch (error) {
    console.error('Error processing Instagram reaction:', error);
  }
}

async function processInstagramDelivery(delivery: any) {
  try {
    console.log('Instagram delivery:', delivery.delivery.mids);
    // TODO: Update message delivery status
  } catch (error) {
    console.error('Error processing Instagram delivery:', error);
  }
}

async function processInstagramRead(read: any) {
  try {
    console.log('Instagram read:', read.read.watermark);
    // TODO: Update message read status
  } catch (error) {
    console.error('Error processing Instagram read:', error);
  }
}
