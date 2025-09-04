/**
 * WhatsApp Webhook Route
 * Handles incoming WhatsApp messages and webhook verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getRawBody, 
  verifyWhatsAppSignature, 
  extractSignature,
  validateWebhookToken,
  generateWebhookChallenge,
  logWebhookSecurityEvent
} from '@/lib/messaging/security';
import { mapWhatsAppInbound } from '@/lib/messaging/mappers';
import { WhatsAppWebhookEvent } from '@/lib/messaging/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Handle webhook verification
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    
    if (mode === 'subscribe' && challenge) {
      const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
      
      if (!expectedToken) {
        console.error('WHATSAPP_WEBHOOK_VERIFY_TOKEN not configured');
        return new NextResponse('Forbidden', { status: 403 });
      }
      
      if (validateWebhookToken(token || '', expectedToken)) {
        logWebhookSecurityEvent('token_verified', 'whatsapp');
        return generateWebhookChallenge(challenge);
      } else {
        logWebhookSecurityEvent('token_failed', 'whatsapp');
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
    
    return new NextResponse('Forbidden', { status: 403 });
  } catch (error) {
    console.error('WhatsApp webhook GET error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(request);
    const body = JSON.parse(rawBody.toString()) as WhatsAppWebhookEvent;
    
    // Verify webhook signature
    const signature = extractSignature(request, 'x-hub-signature-256');
    if (!signature) {
      console.error('Missing WhatsApp webhook signature');
      logWebhookSecurityEvent('signature_failed', 'whatsapp', { reason: 'missing_signature' });
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    const isValidSignature = verifyWhatsAppSignature(rawBody, signature);
    if (!isValidSignature) {
      console.error('Invalid WhatsApp webhook signature');
      logWebhookSecurityEvent('signature_failed', 'whatsapp', { reason: 'invalid_signature' });
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    logWebhookSecurityEvent('signature_verified', 'whatsapp');
    
    // Process webhook events
    if (body.object === 'whatsapp_business_account' && body.entry) {
      for (const entry of body.entry) {
        await processWhatsAppEntry(entry);
      }
    }
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp webhook POST error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function processWhatsAppEntry(entry: any) {
  try {
    for (const change of entry.changes) {
      if (change.value?.messages) {
        for (const message of change.value.messages) {
          await processWhatsAppMessage(message, change.value.metadata);
        }
      }
      
      if (change.value?.statuses) {
        for (const status of change.value.statuses) {
          await processWhatsAppStatus(status);
        }
      }
    }
  } catch (error) {
    console.error('Error processing WhatsApp entry:', error);
  }
}

async function processWhatsAppMessage(message: any, metadata: any) {
  try {
    // Map WhatsApp message to our internal format
    const mappedData = await mapWhatsAppInbound({
      message,
      metadata,
      contacts: metadata.contacts || []
    });
    
    if (mappedData) {
      // Store in database (this will be implemented in the mappers)
      console.log('WhatsApp message processed:', mappedData.message.id);
    }
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
  }
}

async function processWhatsAppStatus(status: any) {
  try {
    // Update message delivery status
    console.log('WhatsApp status update:', status.id, status.status);
    // TODO: Update message status in database
  } catch (error) {
    console.error('Error processing WhatsApp status:', error);
  }
}
