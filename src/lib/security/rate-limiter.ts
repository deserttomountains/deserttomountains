/**
 * Rate Limiting Utility
 * Provides per-endpoint, per-IP (and optional per-entity) rate limiting.
 * Uses an in-memory fallback store and can be extended to Redis in production.
 */

import { NextRequest } from 'next/server';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (req: NextRequest) => string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Default limit profiles
export const RATE_LIMITS = {
  MESSAGE_SEND: {
    windowMs: 10 * 1000,
    max: 5,
    keyGenerator: (req: NextRequest) => {
      const ip = getClientIp(req);
      const threadId = req.nextUrl.searchParams.get('threadId') || 'global';
      return `msg_send:${ip}:${threadId}`;
    }
  },
  MESSAGE_THREADS: {
    windowMs: 60 * 1000,
    max: 30,
    keyGenerator: (req: NextRequest) => {
      const ip = getClientIp(req);
      return `msg_threads:${ip}`;
    }
  },
  MESSAGE_HISTORY: {
    windowMs: 60 * 1000,
    max: 50,
    keyGenerator: (req: NextRequest) => {
      const ip = getClientIp(req);
      const threadId = req.nextUrl.searchParams.get('threadId') || 'global';
      return `msg_history:${ip}:${threadId}`;
    }
  },
  WEBHOOK_WHATSAPP: {
    windowMs: 60 * 1000,
    max: 100,
    keyGenerator: (req: NextRequest) => `whatsapp_webhook:${getClientIp(req)}`
  },
  WEBHOOK_INSTAGRAM: {
    windowMs: 60 * 1000,
    max: 100,
    keyGenerator: (req: NextRequest) => `instagram_webhook:${getClientIp(req)}`
  },
  WEBHOOK_CASHFREE: {
    windowMs: 60 * 1000,
    max: 100,
    keyGenerator: (req: NextRequest) => `cashfree_webhook:${getClientIp(req)}`
  }
} as const;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-client-ip') ||
    'unknown'
  );
}

// Simple in-memory store (replace with Redis for production)
class MemoryStore {
  private map = new Map<string, { count: number; resetTime: number }>();

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const current = this.map.get(key);
    if (!current || now > current.resetTime) {
      const resetTime = now + windowMs;
      this.map.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }
    current.count += 1;
    this.map.set(key, current);
    return { count: current.count, resetTime: current.resetTime };
  }
}

const store = new MemoryStore();

export async function checkRateLimit(req: NextRequest, config: RateLimitConfig): Promise<RateLimitResult> {
  const key = config.keyGenerator ? config.keyGenerator(req) : getClientIp(req);
  const { count, resetTime } = await store.increment(key, config.windowMs);
  const remaining = Math.max(0, config.max - count);
  const success = count <= config.max;
  return {
    success,
    remaining,
    resetTime,
    retryAfter: success ? undefined : Math.ceil((resetTime - Date.now()) / 1000),
  };
}

export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (req: NextRequest) => {
    const result = await checkRateLimit(req, config);
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded', retryAfter: result.retryAfter, remaining: result.remaining }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(config.max),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(result.resetTime),
            'Retry-After': String(result.retryAfter ?? 60),
          },
        }
      );
    }
    return null;
  };
}
