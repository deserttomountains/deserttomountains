import { NextRequest, NextResponse } from 'next/server';
import { cashfreeService } from '@/services/cashfreeService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Cashfree create-order request body:', body);
    
    const { orderId, orderAmount, orderCurrency, customerName, customerEmail, customerPhone, orderNote, returnUrl, notifyUrl } = body;
    
    if (!orderId || !orderAmount || !orderCurrency || !customerName || !customerEmail || !customerPhone) {
      console.error('Missing required fields for Cashfree order:', { orderId, orderAmount, orderCurrency, customerName, customerEmail, customerPhone });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    console.log('Creating Cashfree order with data:', {
      orderId,
      orderAmount,
      orderCurrency,
      customerName,
      customerEmail,
      customerPhone,
      orderNote,
      returnUrl,
      notifyUrl
    });
    
    const order = await cashfreeService.createOrder({
      orderId,
      orderAmount,
      orderCurrency,
      customerName,
      customerEmail,
      customerPhone,
      orderNote,
      returnUrl,
      notifyUrl
    });
    
    console.log('Cashfree order created successfully:', order);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({ 
      error: error.message || 'Failed to create Cashfree order',
      details: error.stack
    }, { status: 500 });
  }
} 