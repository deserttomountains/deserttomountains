/**
 * WhatsApp Webhook Route
 * Handles incoming WhatsApp messages and webhook verification with enhanced security
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
import { RATE_LIMITS, createRateLimitMiddleware } from '@/lib/security/rate-limiter';
import { logSecurityEvent } from '@/lib/security/security-utils';
import { AppError, createErrorResponse } from '@/lib/security/error-handler';

// Rate limiting middleware
const rateLimitMiddleware = createRateLimitMiddleware(RATE_LIMITS.WEBHOOK_WHATSAPP);

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const { searchParams } = new URL(request.url);
    
    // Handle webhook verification
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    
    // Log webhook verification attempt
    logSecurityEvent('WHATSAPP_WEBHOOK_VERIFY_ATTEMPT', request, {
      mode,
      hasToken: !!token,
      hasChallenge: !!challenge
    });
    
    if (mode === 'subscribe' && challenge) {
      const expectedToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
      
      if (!expectedToken) {
        logSecurityEvent('WHATSAPP_WEBHOOK_VERIFY_ERROR', request, {
          error: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN not configured'
        });
        throw AppError.validation('Webhook token not configured');
      }
      
      if (validateWebhookToken(token || '', expectedToken)) {
        logWebhookSecurityEvent('token_verified', 'whatsapp');
        logSecurityEvent('WHATSAPP_WEBHOOK_VERIFY_SUCCESS', request, { challenge });
        return generateWebhookChallenge(challenge);
      } else {
        logWebhookSecurityEvent('token_failed', 'whatsapp');
        logSecurityEvent('WHATSAPP_WEBHOOK_VERIFY_ERROR', request, {
          error: 'Invalid webhook token'
        });
        throw AppError.validation('Invalid webhook token');
      }
    }
    
    throw AppError.validation('Invalid webhook verification');

  } catch (error) {
    if (error instanceof AppError) {
      return createErrorResponse(error, request);
    }
    
    // Log verification error
    logSecurityEvent('WHATSAPP_WEBHOOK_VERIFY_ERROR', request, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return createErrorResponse(
      AppError.internal('Webhook verification failed'),
      request
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get raw body for signature verification
    const rawBody = await getRawBody(request);
    if (!rawBody) {
      throw AppError.validation('Empty request body');
    }

    const body = JSON.parse(rawBody.toString()) as WhatsAppWebhookEvent;
    
    // Verify webhook signature
    const signature = extractSignature(request, 'x-hub-signature-256');
    if (!signature) {
      logSecurityEvent('WHATSAPP_WEBHOOK_INVALID_SIGNATURE', request, {
        reason: 'missing_signature'
      });
      throw AppError.validation('Missing signature header');
    }
    
    const isValidSignature = verifyWhatsAppSignature(rawBody, signature);
    if (!isValidSignature) {
      logSecurityEvent('WHATSAPP_WEBHOOK_INVALID_SIGNATURE', request, {
        reason: 'invalid_signature',
        signature: signature.substring(0, 20) + '...',
        bodyLength: rawBody.length
      });
      throw AppError.validation('Invalid signature');
    }
    
    logWebhookSecurityEvent('signature_verified', 'whatsapp');
    
    // Log webhook reception
    logSecurityEvent('WHATSAPP_WEBHOOK_RECEIVED', request, {
      object: body.object,
      entryCount: body.entry?.length || 0
    });
    
    // Process webhook events
    if (body.object === 'whatsapp_business_account' && body.entry) {
      for (const entry of body.entry) {
        await processWhatsAppEntry(entry);
      }
    }
    
    // Log processing results
    logSecurityEvent('WHATSAPP_WEBHOOK_PROCESSED', request, {
      object: body.object,
      entryCount: body.entry?.length || 0
    });
    
    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    if (error instanceof AppError) {
      return createErrorResponse(error, request);
    }
    
    // Log processing error
    logSecurityEvent('WHATSAPP_WEBHOOK_PROCESSING_ERROR', request, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return createErrorResponse(
      AppError.internal('Webhook processing failed'),
      request
    );
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
