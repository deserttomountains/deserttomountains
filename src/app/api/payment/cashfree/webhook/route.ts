import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook data for debugging
    console.log('Cashfree Webhook received:', JSON.stringify(body));
    
    const {
      orderId,
      orderAmount,
      referenceId,
      txStatus,
      paymentMode,
      txMsg,
      txTime,
      signature
    } = body;
    
    // TODO: Implement signature verification using Cashfree's method for production
    if (orderId && txStatus) {
      console.log(`Cashfree payment ${txStatus} for order: ${orderId}`);
      console.log(`Reference ID: ${referenceId}, Payment Mode: ${paymentMode}`);
      
      // Note: Order updates are now handled on the client side after successful payment
      // This webhook is kept for logging and future server-side processing if needed
    } else {
      console.warn('Webhook missing orderId or txStatus:', body);
    }
    
    // Return success response to Cashfree
    return NextResponse.json({ 
      status: 'success',
      message: 'Webhook processed successfully'
    });
    
  } catch (error) {
    console.error('Error processing Cashfree webhook:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to process webhook'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'success',
    message: 'Cashfree webhook endpoint is active'
  });
} 