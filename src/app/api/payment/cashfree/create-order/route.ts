import { NextRequest, NextResponse } from 'next/server';
import { cashfreeService } from '@/services/cashfreeService';

// Helper function to sanitize logs (remove PII)
function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  const fieldsToMask = ['customerEmail', 'customerPhone', 'customerName', 'email', 'phone', 'name'];
  
  for (const field of fieldsToMask) {
    if (sanitized[field]) {
      const value = String(sanitized[field]);
      if (field.includes('Email')) {
        const [local, domain] = value.split('@');
        sanitized[field] = `${local.substring(0, 2)}***@${domain || '***'}`;
      } else if (field.includes('Phone')) {
        sanitized[field] = value.length > 4 ? `${value.substring(0, 2)}***${value.slice(-2)}` : '***';
      } else if (field.includes('Name')) {
        sanitized[field] = value.length > 2 ? `${value.substring(0, 1)}***` : '***';
      }
    }
  }
  
  return sanitized;
}

// Validation helpers
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  // Indian phone number: 10 digits, optionally prefixed with +91
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  const cleaned = phone.replace(/\s|-/g, '');
  return phoneRegex.test(cleaned);
}

function validateOrderId(orderId: string): boolean {
  // Alphanumeric, 3-50 characters
  const orderIdRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return orderIdRegex.test(orderId);
}

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (jsonError: any) {
      console.error('Invalid JSON in request body:', jsonError);
      return NextResponse.json({ 
        error: 'Invalid request format. Expected JSON.',
        code: 'INVALID_JSON'
      }, { status: 400 });
    }
    
    // Ensure we have a valid body
    if (!body || typeof body !== 'object') {
      console.error('Invalid request body:', body);
      return NextResponse.json({ 
        error: 'Invalid request body. Expected an object.',
        code: 'INVALID_BODY'
      }, { status: 400 });
    }
    
    // Log sanitized request (no PII)
    const sanitizedBody = sanitizeLogData(body);
    console.log('Cashfree create-order request:', {
      orderId: sanitizedBody.orderId,
      orderAmount: sanitizedBody.orderAmount,
      orderCurrency: sanitizedBody.orderCurrency
    });
    
    const { orderId, orderAmount, orderCurrency, customerName, customerEmail, customerPhone, orderNote, returnUrl, notifyUrl } = body;
    
    // Validate required fields
    if (!orderId || !orderAmount || !orderCurrency || !customerName || !customerEmail || !customerPhone) {
      console.error('Missing required fields for Cashfree order');
      return NextResponse.json({ 
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      }, { status: 400 });
    }
    
    // Validate amount range (min: 1 INR, max: 1 crore INR)
    const amountNum = typeof orderAmount === 'string' ? parseFloat(orderAmount) : orderAmount;
    if (isNaN(amountNum) || amountNum < 1) {
      return NextResponse.json({ 
        error: 'Amount must be at least 1 INR',
        code: 'INVALID_AMOUNT'
      }, { status: 400 });
    }
    if (amountNum > 10000000) {
      return NextResponse.json({ 
        error: 'Amount cannot exceed 1,00,00,000 INR',
        code: 'INVALID_AMOUNT'
      }, { status: 400 });
    }
    
    // Validate currency (INR only)
    if (orderCurrency !== 'INR') {
      return NextResponse.json({ 
        error: 'Only INR currency is supported',
        code: 'INVALID_CURRENCY'
      }, { status: 400 });
    }
    
    // Validate email format
    if (!validateEmail(customerEmail)) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      }, { status: 400 });
    }
    
    // Validate phone number format
    if (!validatePhone(customerPhone)) {
      return NextResponse.json({ 
        error: 'Invalid phone number format. Must be a valid Indian phone number (10 digits)',
        code: 'INVALID_PHONE'
      }, { status: 400 });
    }
    
    // Validate orderId format
    if (!validateOrderId(orderId)) {
      return NextResponse.json({ 
        error: 'Invalid order ID format. Must be 3-50 alphanumeric characters',
        code: 'INVALID_ORDER_ID'
      }, { status: 400 });
    }
    
    console.log('Creating Cashfree order with validated data:', {
      orderId,
      orderAmount: amountNum,
      orderCurrency,
      customerName: sanitizeLogData({ customerName }).customerName
    });
    
    const order = await cashfreeService.createOrder({
      orderId,
      orderAmount: amountNum,
      orderCurrency,
      customerName,
      customerEmail,
      customerPhone,
      orderNote,
      returnUrl,
      notifyUrl
    });
    
    console.log('Cashfree order created successfully:', {
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      orderAmount: order.orderAmount
    });
    
    // Return standardized success response
    return NextResponse.json({
      status: 'success',
      data: order
    });
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
    
    // Log full error details server-side only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        errorType: typeof error,
        errorString: String(error)
      });
    }
    
    // Extract error message - handle various error types
    let errorMessage = 'Failed to create Cashfree order';
    if (error) {
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (error?.message) {
        errorMessage = String(error.message);
      } else {
        errorMessage = String(error) || 'Unknown error occurred';
      }
    }
    
    // Standardized error response - always include error message
    const errorResponse: { error: string; code?: string; details?: string } = {
      error: errorMessage,
      code: 'ORDER_CREATION_FAILED'
    };
    
    // Only include stack trace in development
    if (process.env.NODE_ENV === 'development' && error?.stack) {
      errorResponse.details = String(error.stack);
    }
    
    console.log('Returning error response:', errorResponse);
    
    // Ensure error response is valid
    if (!errorResponse || !errorResponse.error) {
      console.error('Error response is invalid, creating fallback:', errorResponse);
      const fallbackResponse: { error: string; code?: string; details?: string } = {
        error: 'An unexpected error occurred while creating the order',
        code: 'UNEXPECTED_ERROR'
      };
      return NextResponse.json(fallbackResponse, { status: 500 });
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 