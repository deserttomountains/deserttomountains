/**
 * Individual Campaign API Routes
 * Handles single campaign operations
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
    const params = await context.params;
    const campaignId = params?.id;
    
    if (!campaignId) {
      throw AppError.validation('Campaign ID is required');
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 100,
      keyGenerator: (req) => `campaigns:read:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get campaign
    const campaign = await campaignService.getCampaign(campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error('Error in GET /api/campaigns/[id]:', error);
    
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

export async function PATCH(
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
      max: 20,
      keyGenerator: (req) => `campaigns:update:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    if (!status) {
      throw AppError.validation('Status is required');
    }

    // Validate status
    const validStatuses = ['draft', 'scheduled', 'sending', 'sent', 'failed', 'paused'];
    if (!validStatuses.includes(status)) {
      throw AppError.validation('Invalid status');
    }

    // Update campaign status
    await campaignService.updateCampaignStatus(campaignId, status);

    return NextResponse.json({
      success: true,
      message: 'Campaign status updated successfully'
    });

  } catch (error) {
    console.error('Error in PATCH /api/campaigns/[id]:', error);
    
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

export async function DELETE(
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
      keyGenerator: (req) => `campaigns:delete:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Delete campaign
    await campaignService.deleteCampaign(campaignId);

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/campaigns/[id]:', error);
    
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
