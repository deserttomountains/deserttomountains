/**
 * Public Send Message API
 * Handles sending messages from the admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { messagingService } from '@/lib/messaging/service';
import { SendMessageRequest } from '@/lib/messaging/types';
import { RATE_LIMITS, createRateLimitMiddleware } from '@/lib/security/rate-limiter';
import { validateRequestBody, validateHeaders, logSecurityEvent } from '@/lib/security/security-utils';
import { AppError, createErrorResponse, withErrorHandling } from '@/lib/security/error-handler';

// Rate limiting middleware
const rateLimitMiddleware = createRateLimitMiddleware(RATE_LIMITS.MESSAGE_SEND);

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
    const body: SendMessageRequest = await request.json();
    
    const bodyValidation = validateRequestBody(body);
    if (!bodyValidation.valid) {
      throw AppError.validation(bodyValidation.error!);
    }

    const sanitizedBody = bodyValidation.sanitizedData as SendMessageRequest;
    
    // Validate required fields
    if (!sanitizedBody.channel || !sanitizedBody.threadId) {
      throw AppError.validation('Channel and threadId are required');
    }

    if (!sanitizedBody.text && !sanitizedBody.template) {
      throw AppError.validation('Either text or template is required');
    }

    // Log security event
    logSecurityEvent('MESSAGE_SEND_ATTEMPT', request, {
      channel: sanitizedBody.channel,
      threadId: sanitizedBody.threadId,
      hasText: !!sanitizedBody.text,
      hasTemplate: !!sanitizedBody.template
    });

    // Send message
    const result = await messagingService.sendMessage(sanitizedBody);
    
    if (!result.success) {
      throw AppError.externalApi(result.error || 'Failed to send message');
    }

    // Log successful send
    logSecurityEvent('MESSAGE_SEND_SUCCESS', request, {
      messageId: result.messageId,
      providerId: result.providerId
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
    logSecurityEvent('MESSAGE_SEND_ERROR', request, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return createErrorResponse(
      AppError.internal('Failed to send message'),
      request
    );
  }
}
