/**
 * Send Message to Contact API
 * Handles sending individual messages to contacts with template support
 */

import { NextRequest, NextResponse } from 'next/server';
import { messagingService } from '@/lib/messaging/service';
import { RATE_LIMITS, createRateLimitMiddleware } from '@/lib/security/rate-limiter';
import { validateRequestBody, validateHeaders, logSecurityEvent } from '@/lib/security/security-utils';
import { AppError, createErrorResponse, withErrorHandling } from '@/lib/security/error-handler';

// Rate limiting middleware
const rateLimitMiddleware = createRateLimitMiddleware(RATE_LIMITS.MESSAGE_SEND);

interface SendToContactRequest {
  contactId: string;
  channel: 'whatsapp' | 'instagram' | 'email';
  template?: {
    name: string;
    lang: string;
    vars: Record<string, string>;
  };
  text?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Validate headers
    const headerValidation = validateHeaders(request);
    if (!headerValidation.valid) {
      throw AppError.validation(headerValidation.error!);
    }

    // Parse and validate request body
    const body: SendToContactRequest = await request.json();
    
    const bodyValidation = validateRequestBody(body);
    if (!bodyValidation.valid) {
      throw AppError.validation(bodyValidation.error!);
    }

    const sanitizedBody = bodyValidation.sanitizedData as SendToContactRequest;
    
    // Validate required fields
    if (!sanitizedBody.contactId || !sanitizedBody.channel) {
      throw AppError.validation('ContactId and channel are required');
    }

    if (!sanitizedBody.text && !sanitizedBody.template) {
      throw AppError.validation('Either text or template is required');
    }

    // Log security event
    logSecurityEvent('MESSAGE_SEND_TO_CONTACT_ATTEMPT', request, {
      contactId: sanitizedBody.contactId,
      channel: sanitizedBody.channel,
      hasText: !!sanitizedBody.text,
      hasTemplate: !!sanitizedBody.template
    });

    // Send message to contact
    const result = await messagingService.sendMessageToContact(sanitizedBody);
    
    if (!result.success) {
      throw AppError.externalApi(result.error || 'Failed to send message to contact');
    }

    // Log successful send
    logSecurityEvent('MESSAGE_SEND_TO_CONTACT_SUCCESS', request, {
      messageId: result.messageId,
      providerId: result.providerId,
      contactId: sanitizedBody.contactId
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      providerId: result.providerId
    });

  } catch (error) {
    if (error instanceof AppError) {
      return createErrorResponse(error, request);
    }
    
    // Log unexpected error
    logSecurityEvent('MESSAGE_SEND_TO_CONTACT_ERROR', request, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return createErrorResponse(
      AppError.internal('Failed to send message to contact'),
      request
    );
  }
}


