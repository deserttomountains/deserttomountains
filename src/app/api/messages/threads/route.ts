/**
 * Threads API
 * Handles fetching threads with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { messagingService } from '@/lib/messaging/service';
import { ThreadListRequest } from '@/lib/messaging/types';
import { RATE_LIMITS, createRateLimitMiddleware } from '@/lib/security/rate-limiter';
import { validateHeaders, logSecurityEvent } from '@/lib/security/security-utils';
import { AppError, createErrorResponse } from '@/lib/security/error-handler';

// Rate limiting middleware
const rateLimitMiddleware = createRateLimitMiddleware(RATE_LIMITS.MESSAGE_THREADS);

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
    
    const threadRequest: ThreadListRequest = {
      status: searchParams.get('status') as any,
      assignee: searchParams.get('assignee') || undefined,
      channels: searchParams.get('channels')?.split(',') as any,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    };

    // Normalize with defaults
    const limit = threadRequest.limit ?? 50;
    const offset = threadRequest.offset ?? 0;

    // Validate parameters
    if (limit < 1 || limit > 100) {
      throw AppError.validation('Limit must be between 1 and 100');
    }

    if (offset < 0) {
      throw AppError.validation('Offset must be non-negative');
    }

    // Log security event
    logSecurityEvent('THREADS_FETCH_ATTEMPT', request, {
      status: threadRequest.status,
      assignee: threadRequest.assignee,
      channels: threadRequest.channels,
      limit,
      offset
    });

    const result = await messagingService.getThreads({ ...threadRequest, limit, offset });
    
    // Log successful fetch
    logSecurityEvent('THREADS_FETCH_SUCCESS', request, {
      count: result.threads?.length || 0
    });

    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof AppError) {
      return createErrorResponse(error, request);
    }
    
    // Log unexpected error
    logSecurityEvent('THREADS_FETCH_ERROR', request, {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return createErrorResponse(
      AppError.internal('Failed to fetch threads'),
      request
    );
  }
}
