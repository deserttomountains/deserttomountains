import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

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
        // Get order from Firebase using Admin SDK
        const orderDoc = await getAdminDb().collection('orders').doc(orderId).get();
        
        if (orderDoc.exists) {
          const orderData = orderDoc.data();
          console.log(`Order found: ${orderData?.orderId}, current status: ${orderData?.status}`);
          
          // Update order using Admin SDK
          await getAdminDb().collection('orders').doc(orderId).update({
            paymentStatus: txStatus === 'SUCCESS' ? 'completed' : 'failed',
            status: txStatus === 'SUCCESS' ? 'confirmed' : 'pending',
            transactionId: referenceId,
            paymentMode: paymentMode,
            paymentMessage: txMsg,
            paymentTime: txTime,
            lastUpdated: new Date().toISOString()
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