/**
 * Enhanced Security Utilities
 * Production-ready security measures for messaging system
 */

import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Security configuration
export interface SecurityConfig {
  maxRequestSize: number; // Maximum request body size in bytes
  allowedOrigins: string[]; // CORS allowed origins
  maxConcurrentRequests: number; // Maximum concurrent requests per IP
  requestTimeout: number; // Request timeout in milliseconds
}

// Default security configuration
export const SECURITY_CONFIG: SecurityConfig = {
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
  maxConcurrentRequests: 10,
  requestTimeout: 30000 // 30 seconds
};

// Request validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedData?: any;
}

/**
 * Validate and sanitize request body
 */
export function validateRequestBody(
  body: any,
  maxSize: number = SECURITY_CONFIG.maxRequestSize
): ValidationResult {
  try {
    // Check body size
    const bodySize = JSON.stringify(body).length;
    if (bodySize > maxSize) {
      return {
        valid: false,
        error: `Request body too large: ${bodySize} bytes (max: ${maxSize})`
      };
    }

    // Deep sanitize the body
    const sanitized = sanitizeObject(body);
    
    return {
      valid: true,
      sanitizedData: sanitized
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid request body format'
    };
  }
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = sanitizeString(key);
      if (sanitizedKey) {
        sanitized[sanitizedKey] = sanitizeObject(value);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize string input
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }

  // Remove null bytes
  str = str.replace(/\0/g, '');
  
  // Remove control characters (except newlines and tabs)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  str = str.trim();
  
  // Limit length
  const maxLength = 10000; // 10KB max string length
  if (str.length > maxLength) {
    str = str.substring(0, maxLength);
  }
  
  return str;
}

/**
 * Validate CORS origin
 */
export function validateOrigin(origin: string): boolean {
  if (!origin) return false;
  
  return SECURITY_CONFIG.allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2);
      return origin.endsWith(domain);
    }
    return origin === allowed;
  });
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data
 */
export function hashSensitiveData(data: string, salt?: string): string {
  const saltToUse = salt || generateSecureToken(16);
  const hash = crypto.createHash('sha256');
  hash.update(data + saltToUse);
  return hash.digest('hex') + ':' + saltToUse;
}

/**
 * Verify hashed data
 */
export function verifyHashedData(data: string, hashedData: string): boolean {
  const [hash, salt] = hashedData.split(':');
  const computedHash = hashSensitiveData(data, salt).split(':')[0];
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(computedHash, 'hex')
  );
}

/**
 * Validate request headers
 */
export function validateHeaders(req: NextRequest): ValidationResult {
  // Always require user-agent
  if (!req.headers.get('user-agent')) {
    return {
      valid: false,
      error: 'Missing required header: user-agent'
    };
  }

  // Only validate content-type for POST requests
  if (req.method === 'POST') {
    const contentType = req.headers.get('content-type');
    if (!contentType) {
      return {
        valid: false,
        error: 'Missing required header: content-type'
      };
    }
    
    if (!contentType.includes('application/json')) {
      return {
        valid: false,
        error: 'Invalid content type. Expected application/json'
      };
    }
  }

  return { valid: true };
}

/**
 * Get client fingerprint for security
 */
export function getClientFingerprint(req: NextRequest): string {
  const components = [
    req.headers.get('user-agent') || '',
    req.headers.get('accept-language') || '',
    req.headers.get('accept-encoding') || '',
    req.headers.get('x-forwarded-for') || '',
    req.headers.get('x-real-ip') || ''
  ];
  
  const fingerprint = crypto.createHash('sha256');
  fingerprint.update(components.join('|'));
  return fingerprint.digest('hex');
}

/**
 * Validate request timing (prevent timing attacks)
 */
export function validateRequestTiming(req: NextRequest): ValidationResult {
  const timestamp = req.headers.get('x-request-timestamp');
  if (!timestamp) {
    return { valid: true }; // Optional header
  }

  const requestTime = parseInt(timestamp, 10);
  const currentTime = Date.now();
  const timeDiff = Math.abs(currentTime - requestTime);
  
  // Allow 5 minute clock skew
  if (timeDiff > 5 * 60 * 1000) {
    return {
      valid: false,
      error: 'Request timestamp too old or in the future'
    };
  }

  return { valid: true };
}

/**
 * Log security events
 */
export function logSecurityEvent(
  event: string,
  req: NextRequest,
  details?: any
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    method: req.method,
    url: req.url,
    clientIp: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent'),
    fingerprint: getClientFingerprint(req),
    details
  };

  console.log('[SECURITY_EVENT]', logData);
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to security monitoring service
  }
}

/**
 * Create security headers
 */
export function createSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  maxSize: number = 5 * 1024 * 1024, // 5MB
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
): ValidationResult {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large: ${file.size} bytes (max: ${maxSize})`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed: ${file.type}`
    };
  }

  return { valid: true };
}
