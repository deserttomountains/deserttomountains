import { NextRequest, NextResponse } from 'next/server';
import { cashfreeService } from '@/services/cashfreeService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderAmount, orderCurrency, customerName, customerEmail, customerPhone, orderNote, returnUrl, notifyUrl } = body;
    if (!orderId || !orderAmount || !orderCurrency || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
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
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create Cashfree order' }, { status: 500 });
  }
} 