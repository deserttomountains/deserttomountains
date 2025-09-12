/**
 * Campaign Analytics API Route
 * Provides comprehensive analytics for campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/security/error-handler';
import { campaignService } from '@/lib/messaging/campaign-service';

// GET /api/analytics/campaigns - Get campaign analytics
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 30,
      keyGenerator: (req) => `analytics:campaigns:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y
    const campaignId = searchParams.get('campaignId');
    const channel = searchParams.get('channel'); // whatsapp, instagram, email
    const status = searchParams.get('status'); // active, completed, paused

    // Get analytics data
    const analytics = await campaignService.getCampaignAnalytics({
      period: period as '7d' | '30d' | '90d' | '1y',
      campaignId: campaignId || undefined,
      channel: channel as 'whatsapp' | 'instagram' | 'email' | undefined,
      status: status as 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'paused' | undefined
    });

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error getting campaign analytics:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get campaign analytics' },
      { status: 500 }
    );
  }
}
