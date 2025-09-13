/**
 * Individual Template API Route
 * Handles operations on specific templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/security/error-handler';
import { templateManagementService } from '@/lib/messaging/template-management';

// GET /api/templates/[id] - Get specific template
export async function GET(
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
      max: 30,
      keyGenerator: (req) => `templates:get:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const template = await templateManagementService.getTemplate(templateId);
    
    if (!template) {
      throw AppError.notFound('Template not found');
    }

    return NextResponse.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Error getting template:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get template' },
      { status: 500 }
    );
  }
}

// PATCH /api/templates/[id] - Update template
export async function PATCH(
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
      keyGenerator: (req) => `templates:update:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Only allow updates to certain fields
    const allowedUpdates = ['components', 'meta', 'status', 'platforms', 'version'];
    const updates: any = {};
    
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw AppError.validation('No valid fields to update');
    }

    const template = await templateManagementService.updateTemplate(templateId, updates);

    return NextResponse.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Error updating template:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(
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
      max: 5,
      keyGenerator: (req) => `templates:delete:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    await templateManagementService.deleteTemplate(templateId);

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting template:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

