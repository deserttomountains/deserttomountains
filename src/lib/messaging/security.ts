/**
 * Security utilities for webhook verification
 * Handles raw body parsing and signature verification
 */

import crypto from 'crypto';

/**
 * Get raw body from Next.js request
 * Required for signature verification
 */
export async function getRawBody(request: Request): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = request.body?.getReader();
  
  if (!reader) {
    throw new Error('Request body is not available');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

/**
 * Verify Meta webhook signature using HMAC SHA-256
 */
export function verifyMetaSignature(
  rawBody: Buffer,
  signature: string,
  appSecret: string
): boolean {
  try {
    // Extract signature from header format: "sha256=..."
    const expectedSignature = signature.replace('sha256=', '');
    
    // Calculate HMAC SHA-256
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(rawBody);
    const calculatedSignature = hmac.digest('hex');
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verify WhatsApp webhook signature
 */
export function verifyWhatsAppSignature(
  rawBody: Buffer,
  signature: string
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) {
    console.error('WHATSAPP_APP_SECRET not configured');
    return false;
  }
  
  return verifyMetaSignature(rawBody, signature, appSecret);
}

/**
 * Verify Instagram webhook signature
 */
export function verifyInstagramSignature(
  rawBody: Buffer,
  signature: string
): boolean {
  const appSecret = process.env.INSTAGRAM_APP_SECRET;
  if (!appSecret) {
    console.error('INSTAGRAM_APP_SECRET not configured');
    return false;
  }
  
  return verifyMetaSignature(rawBody, signature, appSecret);
}

/**
 * Extract signature from request headers
 */
export function extractSignature(request: Request, headerName: string): string | null {
  return request.headers.get(headerName);
}

/**
 * Validate webhook verification token
 */
export function validateWebhookToken(
  receivedToken: string,
  expectedToken: string
): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(receivedToken),
    Buffer.from(expectedToken)
  );
}

/**
 * Generate webhook challenge response
 */
export function generateWebhookChallenge(challenge: string): Response {
  return new Response(challenge, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}

/**
 * Log webhook security event (without sensitive data)
 */
export function logWebhookSecurityEvent(
  event: 'signature_verified' | 'signature_failed' | 'token_verified' | 'token_failed',
  source: 'whatsapp' | 'instagram',
  metadata?: Record<string, any>
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    source,
    ...metadata
  };
  
  console.log(`Webhook Security: ${JSON.stringify(logData)}`);
}
