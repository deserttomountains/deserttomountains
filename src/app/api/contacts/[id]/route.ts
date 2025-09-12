/**
 * Individual Contact API Routes
 * Handles GET, PATCH, and DELETE operations for specific contacts
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { AppError } from '@/lib/security/error-handler';
import { Contact } from '@/lib/messaging/types';
import { campaignService } from '@/lib/messaging/campaign-service';

// GET /api/contacts/[id] - Get a specific contact
export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const contactId = context?.params?.id;

    if (!contactId) {
      throw AppError.validation('Contact ID is required');
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 100,
      keyGenerator: (req) => `contacts:get:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Get contact
    const contact = await campaignService.getContact(contactId);

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: contact
    });

  } catch (error) {
    console.error('Error getting contact:', error);
    
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

// PATCH /api/contacts/[id] - Update a specific contact
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    const contactId = context?.params?.id;

    if (!contactId) {
      throw AppError.validation('Contact ID is required');
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 20,
      keyGenerator: (req) => `contacts:update:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const contactData: Partial<Contact> = body;

    // Validate required fields if provided
    if (contactData.name !== undefined && !contactData.name.trim()) {
      throw AppError.validation('Contact name cannot be empty');
    }

    if (contactData.channels !== undefined) {
      const hasValidChannel = Object.values(contactData.channels).some(value => value?.trim());
      if (!hasValidChannel) {
        throw AppError.validation('At least one channel is required');
      }
    }

    // Validate email format if provided
    if (contactData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      throw AppError.validation('Please enter a valid email address');
    }

    // Validate phone format if provided
    if (contactData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(contactData.phone.replace(/\s/g, ''))) {
      throw AppError.validation('Please enter a valid phone number');
    }

    // Update contact
    const updatedContact = await campaignService.updateContact(contactId, contactData);

    return NextResponse.json({
      success: true,
      data: updatedContact
    });

  } catch (error) {
    console.error('Error updating contact:', error);
    
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

// DELETE /api/contacts/[id] - Delete a specific contact
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    const contactId = context?.params?.id;

    if (!contactId) {
      throw AppError.validation('Contact ID is required');
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, {
      windowMs: 60 * 1000,
      max: 10,
      keyGenerator: (req) => `contacts:delete:${req.headers.get('x-forwarded-for') || 'unknown'}`
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Delete contact
    await campaignService.deleteContact(contactId);

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact:', error);
    
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
