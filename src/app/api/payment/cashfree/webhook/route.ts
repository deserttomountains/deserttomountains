import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';

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
      try {
        const orderRef = await AuthService.getOrderById(orderId);
        if (orderRef) {
          await AuthService.updateOrder(orderId, {
            paymentStatus: txStatus === 'SUCCESS' ? 'completed' : 'failed',
            transactionId: referenceId,
            paymentMode: paymentMode,
            paymentMessage: txMsg,
            paymentTime: txTime,
            lastUpdated: new Date()
          });
          console.log(`Order ${orderId} updated with payment status: ${txStatus}`);
        } else {
          console.warn(`Order ${orderId} not found in Firestore.`);
        }
      } catch (error) {
        console.error('Error updating order in Firebase:', error);
      }
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