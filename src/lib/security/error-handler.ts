/**
 * Enhanced Error Handling
 * Production-ready error handling for messaging system
 */

import { NextRequest, NextResponse } from 'next/server';

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  RATE_LIMIT = 'RATE_LIMIT',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  EXTERNAL_API = 'EXTERNAL_API',
  DATABASE = 'DATABASE',
  INTERNAL = 'INTERNAL'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Custom error class
export class AppError extends Error {
  public type: ErrorType;
  public severity: ErrorSeverity;
  public statusCode: number;
  public code: string;
  public details?: any;
  public retryable: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    statusCode: number = 500,
    code?: string,
    details?: any,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.code = code || `${type}_ERROR`;
    this.details = details;
    this.retryable = retryable;
  }

  static validation(message: string, details?: any): AppError {
    return new AppError(
      message,
      ErrorType.VALIDATION,
      ErrorSeverity.LOW,
      400,
      'VALIDATION_ERROR',
      details,
      false
    );
  }

  static authentication(message: string): AppError {
    return new AppError(
      message,
      ErrorType.AUTHENTICATION,
      ErrorSeverity.HIGH,
      401,
      'AUTHENTICATION_ERROR',
      undefined,
      false
    );
  }

  static authorization(message: string): AppError {
    return new AppError(
      message,
      ErrorType.AUTHORIZATION,
      ErrorSeverity.HIGH,
      403,
      'AUTHORIZATION_ERROR',
      undefined,
      false
    );
  }

  static rateLimit(message: string, retryAfter?: number): AppError {
    return new AppError(
      message,
      ErrorType.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      429,
      'RATE_LIMIT_ERROR',
      { retryAfter },
      true
    );
  }

  static notFound(message: string): AppError {
    return new AppError(
      message,
      ErrorType.NOT_FOUND,
      ErrorSeverity.LOW,
      404,
      'NOT_FOUND_ERROR',
      undefined,
      false
    );
  }

  static conflict(message: string, details?: any): AppError {
    return new AppError(
      message,
      ErrorType.CONFLICT,
      ErrorSeverity.MEDIUM,
      409,
      'CONFLICT_ERROR',
      details,
      false
    );
  }

  static externalApi(message: string, details?: any): AppError {
    return new AppError(
      message,
      ErrorType.EXTERNAL_API,
      ErrorSeverity.HIGH,
      502,
      'EXTERNAL_API_ERROR',
      details,
      true
    );
  }

  static database(message: string, details?: any): AppError {
    return new AppError(
      message,
      ErrorType.DATABASE,
      ErrorSeverity.HIGH,
      500,
      'DATABASE_ERROR',
      details,
      true
    );
  }

  static internal(message: string, details?: any): AppError {
    return new AppError(
      message,
      ErrorType.INTERNAL,
      ErrorSeverity.CRITICAL,
      500,
      'INTERNAL_ERROR',
      details,
      false
    );
  }
}

// Error response interface
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    type: ErrorType;
    severity: ErrorSeverity;
    retryable: boolean;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

// Request context for error logging
export interface RequestContext {
  method: string;
  url: string;
  clientIp: string;
  userAgent?: string;
  userId?: string;
  requestId: string;
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: AppError,
  req: NextRequest,
  includeDetails: boolean = false
): NextResponse<ErrorResponse> {
  const requestId = generateRequestId();
  const timestamp = new Date().toISOString();

  const errorResponse: ErrorResponse = {
    error: {
      message: error.message,
      code: error.code,
      type: error.type,
      severity: error.severity,
      retryable: error.retryable,
      timestamp,
      requestId
    }
  };

  // Include details only in development or if explicitly requested
  if (includeDetails && (process.env.NODE_ENV === 'development' || process.env.INCLUDE_ERROR_DETAILS === 'true')) {
    errorResponse.error.details = error.details;
  }

  // Log error
  logError(error, {
    method: req.method,
    url: req.url,
    clientIp: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || undefined,
    requestId
  });

  // Add headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': requestId
  };

  if (error.retryable && error.details?.retryAfter) {
    headers['Retry-After'] = error.details.retryAfter.toString();
  }

  return NextResponse.json(errorResponse, {
    status: error.statusCode,
    headers
  });
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log error with context
 */
export function logError(error: AppError, context: RequestContext): void {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      type: error.type,
      severity: error.severity,
      code: error.code,
      stack: error.stack,
      details: error.details
    },
    context,
    retryable: error.retryable
  };

  // Log based on severity
  switch (error.severity) {
    case ErrorSeverity.CRITICAL:
      console.error('[CRITICAL_ERROR]', logData);
      break;
    case ErrorSeverity.HIGH:
      console.error('[HIGH_ERROR]', logData);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn('[MEDIUM_ERROR]', logData);
      break;
    case ErrorSeverity.LOW:
      console.log('[LOW_ERROR]', logData);
      break;
  }

  // Send critical errors to monitoring service
  if (error.severity === ErrorSeverity.CRITICAL && process.env.NODE_ENV === 'production') {
    // TODO: Send to error monitoring service (Sentry, etc.)
  }
}

/**
 * Handle async errors in route handlers
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      // Convert unknown errors to AppError
      if (error instanceof Error) {
        throw AppError.internal(
          'An unexpected error occurred',
          { originalError: error.message, stack: error.stack }
        );
      }
      
      throw AppError.internal('An unknown error occurred');
    }
  };
}

/**
 * Validate and sanitize error details
 */
export function sanitizeErrorDetails(details: any): any {
  if (!details) return undefined;

  // Remove sensitive information
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...details };

  for (const key of sensitiveKeys) {
    if (sanitized[key]) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Create error from external API response
 */
export function createExternalApiError(
  response: Response,
  context: string
): AppError {
  const statusCode = response.status;
  const isRetryable = statusCode >= 500 || statusCode === 429;

  return AppError.externalApi(
    `${context} failed with status ${statusCode}`,
    {
      statusCode,
      statusText: response.statusText,
      url: response.url,
      retryable: isRetryable
    }
  );
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: any, operation: string): AppError {
  // Firebase/Firestore specific error handling
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        return AppError.authorization(`Database ${operation} permission denied`);
      case 'not-found':
        return AppError.notFound(`Database ${operation} not found`);
      case 'already-exists':
        return AppError.conflict(`Database ${operation} already exists`);
      case 'resource-exhausted':
        return AppError.rateLimit(`Database ${operation} resource exhausted`);
      case 'unavailable':
        return AppError.database(`Database ${operation} unavailable`, { retryable: true });
      case 'deadline-exceeded':
        return AppError.database(`Database ${operation} deadline exceeded`, { retryable: true });
      default:
        return AppError.database(`Database ${operation} failed: ${error.message}`, { 
          code: error.code,
          retryable: true 
        });
    }
  }

  return AppError.database(`Database ${operation} failed`, { 
    originalError: error.message,
    retryable: true 
  });
}
