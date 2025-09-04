/**
 * Messages API
 * Handles fetching messages for a specific thread
 */

import { NextRequest, NextResponse } from 'next/server';
import { messagingService } from '@/lib/messaging/service';
import { MessageListRequest } from '@/lib/messaging/types';
import { RATE_LIMITS, createRateLimitMiddleware } from '@/lib/security/rate-limiter';
import { validateHeaders, logSecurityEvent } from '@/lib/security/security-utils';
import { AppError, createErrorResponse } from '@/lib/security/error-handler';

// Rate limiting middleware
const rateLimitMiddleware = createRateLimitMiddleware(RATE_LIMITS.MESSAGE_HISTORY);

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    
    if (!threadId) {
      throw AppError.validation('Thread ID is required');
    }

    const messageRequest: MessageListRequest = {
      threadId,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };

    // Normalize with defaults for validation
    const limit = messageRequest.limit ?? 100;
    const offset = messageRequest.offset ?? 0;

    // Validate parameters
    if (limit < 1 || limit > 100) {
      throw AppError.validation('Limit must be between 1 and 100');
    }

    if (offset < 0) {
      throw AppError.validation('Offset must be non-negative');
    }

    // Log security event
    logSecurityEvent('MESSAGES_FETCH_ATTEMPT', request, {
      threadId: messageRequest.threadId,
      limit,
      offset
    });

    const result = await messagingService.getMessages({ ...messageRequest, limit, offset });
    
    // Log successful fetch
    logSecurityEvent('MESSAGES_FETCH_SUCCESS', request, {
      threadId: messageRequest.threadId,
      count: result.messages?.length || 0
    });

    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof AppError) {
      return createErrorResponse(error, request);
    }
    
    // Log unexpected error
    logSecurityEvent('MESSAGES_FETCH_ERROR', request, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return createErrorResponse(
      AppError.internal('Failed to fetch messages'),
      request
    );
  }
}
