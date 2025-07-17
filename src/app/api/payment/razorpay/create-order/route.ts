import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/services/razorpayService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, receipt, notes } = body;
    if (!amount || !currency || !receipt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const order = await razorpayService.createOrder({ amount, currency, receipt, notes });
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create Razorpay order' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 