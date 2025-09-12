/**
 * Campaign Statistics API Route
 * Returns campaign performance statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/lib/messaging/campaign-service';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/security/error-handler';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const campaignId = context?.params?.id;
    
    if (!campaignId) {
      throw AppError.validation('Campaign ID is required');
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 50,
      keyGenerator: (req) => `campaigns:stats:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get campaign statistics
    const stats = await campaignService.getCampaignStats(campaignId);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in GET /api/campaigns/[id]/stats:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
