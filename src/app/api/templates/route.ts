/**
 * Template Management API Route
 * Handles CRUD operations for custom templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/security/error-handler';
import { templateManagementService } from '@/lib/messaging/template-management';

// GET /api/templates - List templates
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 30,
      keyGenerator: (req) => `templates:list:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get templates
    const templates = await templateManagementService.listTemplates({
      status: status as any,
      category: category as any,
      language: language || undefined,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Error listing templates:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to list templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 10,
      keyGenerator: (req) => `templates:create:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.language || !body.category || !body.components) {
      throw AppError.validation('Missing required fields: name, language, category, components');
    }

    // Create template
    const templateData: any = {
      name: body.name,
      language: body.language,
      category: body.category,
      components: body.components,
      platforms: body.platforms || ['whatsapp', 'instagram'], // Default to both platforms
      meta: {
        description: body.description || '',
        useCase: body.useCase || '',
        exampleVariables: body.exampleVariables || {}
      }
    };

    // Only include version if it exists and is not empty
    if (body.version && body.version.trim()) {
      templateData.version = body.version;
    }

    const template = await templateManagementService.createTemplate(templateData);

    return NextResponse.json({
      success: true,
      data: template
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating template:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
