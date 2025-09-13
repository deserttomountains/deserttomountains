/**
 * Campaign Execution API Route
 * Handles campaign execution (sending messages)
 */

import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/lib/messaging/campaign-service';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/security/error-handler';

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const campaignId = params?.id;
    
    if (!campaignId) {
      throw AppError.validation('Campaign ID is required');
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 5,
      keyGenerator: (req) => `campaigns:execute:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Execute campaign
    await campaignService.executeCampaign(campaignId);

    return NextResponse.json({
      success: true,
      message: 'Campaign execution started successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/campaigns/[id]/execute:', error);
    
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
