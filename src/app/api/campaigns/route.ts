/**
 * Campaign API Routes
 * Handles campaign CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/lib/messaging/campaign-service';
import { CreateCampaignRequest, CampaignListRequest } from '@/lib/messaging/types';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/security/error-handler';

export async function GET(request: NextRequest) {
  try {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const campaignRequest: CampaignListRequest = {
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      channel: searchParams.get('channel') || undefined,
      createdBy: searchParams.get('createdBy') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Validate request
    if (campaignRequest.limit && (campaignRequest.limit < 1 || campaignRequest.limit > 100)) {
      throw AppError.validation('Invalid limit parameter');
    }

    if (campaignRequest.offset && campaignRequest.offset < 0) {
      throw AppError.validation('Invalid offset parameter');
    }

    // Get campaigns
    const result = await campaignService.getCampaigns(campaignRequest);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in GET /api/campaigns:', error);
    
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

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 10,
      keyGenerator: (req) => `campaigns:create:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const campaignRequest: CreateCampaignRequest = body;

    // Validate required fields
    if (!campaignRequest.name) {
      throw AppError.validation('Campaign name is required');
    }

    if (!campaignRequest.type) {
      throw AppError.validation('Campaign type is required');
    }

    if (!campaignRequest.channel) {
      throw AppError.validation('Campaign channel is required');
    }

    if (!campaignRequest.template) {
      throw AppError.validation('Campaign template is required');
    }

    if (!campaignRequest.recipients) {
      throw AppError.validation('Campaign recipients are required');
    }

    // Validate template
    if (!campaignRequest.template.name || !campaignRequest.template.content) {
      throw AppError.validation('Template name and content are required');
    }

    // Validate recipients
    if (!campaignRequest.recipients.contactIds && !campaignRequest.recipients.filters) {
      throw AppError.validation('Either contact IDs or filters must be provided');
    }

    // TODO: Get user ID from authentication
    const userId = 'temp-user-id'; // This should come from auth middleware

    // Create campaign
    const campaign = await campaignService.createCampaign(campaignRequest, userId);

    return NextResponse.json({
      success: true,
      data: campaign
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/campaigns:', error);
    
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
