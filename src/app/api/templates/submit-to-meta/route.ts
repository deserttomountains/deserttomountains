/**
 * Submit Template to Meta API
 * Handles template submission to Meta for approval
 */

import { NextRequest, NextResponse } from 'next/server';
import { templateManagementService, MetaTemplateService, MarketingTemplate } from '@/lib/messaging/template-management';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/security/error-handler';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 5, // Limit to 5 submissions per minute
      keyGenerator: (req) => `template-submit:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      throw AppError.validation('Template ID is required');
    }

    // Get the template from database
    const template = await templateManagementService.getTemplate(templateId);
    if (!template) {
      throw AppError.notFound('Template not found');
    }

    // Only allow Marketing templates to be submitted to Meta
    if (template.category !== 'MARKETING') {
      throw AppError.validation('Only Marketing templates can be submitted to Meta');
    }

    // Check if template is in DRAFT status
    if (template.status !== 'DRAFT') {
      throw AppError.validation('Only DRAFT templates can be submitted to Meta');
    }

    // Initialize Meta service
    const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!wabaId || !accessToken) {
      throw AppError.internal('WhatsApp Business Account ID or Access Token not configured');
    }

    const metaService = new MetaTemplateService(wabaId, accessToken);

    // Submit to Meta API
    const metaResponse = await metaService.submitTemplateToMeta(template as MarketingTemplate);

    // Update template in database with Meta response
    await templateManagementService.updateTemplate(templateId, {
      status: 'PENDING',
      metaTemplateId: metaResponse.id,
      metaStatus: metaResponse.status
    });

    return NextResponse.json({
      success: true,
      data: {
        templateId: templateId,
        metaTemplateId: metaResponse.id,
        status: metaResponse.status,
        message: 'Template submitted to Meta for approval'
      }
    });

  } catch (error) {
    console.error('Error submitting template to Meta:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit template to Meta' },
      { status: 500 }
    );
  }
}
