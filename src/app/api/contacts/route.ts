/**
 * Contacts API Routes
 * Handles contact CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/lib/messaging/campaign-service';
import { ContactListRequest, Contact } from '@/lib/messaging/types';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limiter';
import { AppError, ErrorType } from '@/lib/security/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 100,
      keyGenerator: (req) => `contacts:read:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const contactRequest: ContactListRequest = {
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      groups: searchParams.get('groups')?.split(',').filter(Boolean),
      status: searchParams.get('status') || undefined,
      channels: searchParams.get('channels')?.split(',').filter(Boolean),
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Validate request
    if (contactRequest.limit && (contactRequest.limit < 1 || contactRequest.limit > 100)) {
      throw AppError.validation('Invalid limit parameter');
    }

    if (contactRequest.offset && contactRequest.offset < 0) {
      throw AppError.validation('Invalid offset parameter');
    }

    // Get contacts
    const result = await campaignService.getContacts(contactRequest);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error in GET /api/contacts:', error);
    
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
      max: 20,
      keyGenerator: (req) => `contacts:create:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> = body;

    // Validate required fields
    if (!contactData.name) {
      throw AppError.validation('Contact name is required');
    }

    if (!contactData.channels || Object.keys(contactData.channels).length === 0) {
      throw AppError.validation('At least one channel is required');
    }

    // Validate channels
    const validChannels = ['whatsapp', 'instagram', 'email'];
    const providedChannels = Object.keys(contactData.channels);
    const invalidChannels = providedChannels.filter(channel => !validChannels.includes(channel));
    
    if (invalidChannels.length > 0) {
      throw AppError.validation(`Invalid channels: ${invalidChannels.join(', ')}`);
    }

    // Set default values
    if (!contactData.tags) contactData.tags = [];
    if (!contactData.groups) contactData.groups = [];
    if (!contactData.status) contactData.status = 'active';
    if (!contactData.source) contactData.source = 'manual';
    if (!contactData.metadata) contactData.metadata = {};

    // Create contact
    const contact = await campaignService.createContact(contactData);

    return NextResponse.json({
      success: true,
      data: contact
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/contacts:', error);
    
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
