import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/services/razorpayService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, receipt, notes } = body;
    
    // Validate required fields
    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ 
        error: 'Amount is required and must be a number' 
      }, { status: 400 });
    }
    
    if (!currency || typeof currency !== 'string') {
      return NextResponse.json({ 
        error: 'Currency is required and must be a string' 
      }, { status: 400 });
    }
    
    if (!receipt || typeof receipt !== 'string') {
      return NextResponse.json({ 
        error: 'Receipt is required and must be a string' 
      }, { status: 400 });
    }

    // Validate amount range
    if (amount < 100) { // 1 INR in paise
      return NextResponse.json({ 
        error: 'Amount must be at least 1 INR (100 paise)' 
      }, { status: 400 });
    }
    
    if (amount > 100000000) { // 10 Lakh INR in paise
      return NextResponse.json({ 
        error: 'Amount cannot exceed 10,00,000 INR' 
      }, { status: 400 });
    }

    // Validate currency
    if (currency !== 'INR') {
      return NextResponse.json({ 
        error: 'Only INR currency is supported' 
      }, { status: 400 });
    }

    // Validate receipt format
    if (receipt.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Receipt cannot be empty' 
      }, { status: 400 });
    }

    // Create order
    const order = await razorpayService.createOrder({ 
      amount, 
      currency, 
      receipt, 
      notes 
    });
    
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    
    // Return specific error messages
    if (error.message.includes('Razorpay API Error')) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }
    
    if (error.message.includes('Amount must be at least')) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }
    
    if (error.message.includes('Amount cannot exceed')) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }
    
    if (error.message.includes('Currency')) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }
    
    if (error.message.includes('Receipt')) {
      return NextResponse.json({ 
        error: error.message 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create Razorpay order. Please try again.' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 