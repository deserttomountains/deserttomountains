/**
 * Template Submit to Meta API Route
 * Handles submitting templates to Meta Business API for approval
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/security/error-handler';
import { templateManagementService } from '@/lib/messaging/template-management';

// POST /api/templates/[id]/submit - Submit template to Meta for approval
export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const params = await context.params;
    const templateId = params?.id;
    
    if (!templateId) {
      throw AppError.validation('Template ID is required');
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 10,
      keyGenerator: (req) => `templates:submit:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get the template first
    const template = await templateManagementService.getTemplate(templateId);
    
    if (!template) {
      throw AppError.notFound('Template not found');
    }

    // Check if template is in draft status
    if (template.status !== 'DRAFT') {
      throw AppError.validation('Only draft templates can be submitted to Meta');
    }

    // Check if template already has a Meta template ID
    if (template.metaTemplateId) {
      throw AppError.validation('Template has already been submitted to Meta');
    }

    // Submit template for approval
    await templateManagementService.submitForApproval(templateId);

    return NextResponse.json({
      success: true,
      message: 'Template submitted to Meta for approval',
      data: {
        templateId,
        status: 'PENDING'
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
