import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { razorpayService } from '@/services/razorpayService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      firebase_order_id 
    } = body;

    console.log('Received update request:', {
      razorpay_order_id,
      razorpay_payment_id,
      firebase_order_id,
      has_signature: !!razorpay_signature
    });

    // Validate required fields
    if (!razorpay_order_id) {
      return NextResponse.json({ status: 'error', message: 'Missing Razorpay order ID' }, { status: 400 });
    }

    if (!razorpay_payment_id) {
      return NextResponse.json({ status: 'error', message: 'Missing payment ID' }, { status: 400 });
    }

    if (!firebase_order_id) {
      return NextResponse.json({ status: 'error', message: 'Missing Firebase order ID' }, { status: 400 });
    }

    // Verify payment signature
    const isValidPayment = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature || ''
    );

    if (!isValidPayment) {
      console.error('Invalid payment signature');
      return NextResponse.json({ status: 'error', message: 'Invalid payment signature' }, { status: 400 });
    }

    // Get additional payment details from Razorpay API
    let paymentDetails = null;
    try {
      paymentDetails = await razorpayService.getPaymentDetails(razorpay_payment_id);
      console.log('Payment details from Razorpay:', paymentDetails);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      // Continue processing even if we can't fetch details
    }

    // Determine payment status
    const paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' = 
      paymentDetails?.status === 'captured' 
        ? 'completed' 
        : paymentDetails?.status === 'failed'
        ? 'failed'
        : 'pending';

    console.log('Determined payment status:', paymentStatus);

    // Update order status in Firebase using Admin SDK
    try {
      console.log(`Attempting to find order with Firebase ID: ${firebase_order_id}`);
      
      // Use Admin SDK to get order (bypasses security rules)
      const orderDoc = await getAdminDb().collection('orders').doc(firebase_order_id).get();
      
      if (orderDoc.exists) {
        const orderData = orderDoc.data();
        console.log(`Order found: ${orderData?.orderId}, current status: ${orderData?.status}, payment status: ${orderData?.paymentStatus}`);
        
        const updateData = {
          paymentStatus,
          status: paymentStatus === 'completed' ? 'confirmed' : 'pending',
          transactionId: razorpay_payment_id,
          paymentMode: 'razorpay',
          paymentMessage: paymentDetails?.status || 'unknown',
          paymentTime: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };

        // Add additional payment details if available
        if (paymentDetails) {
          updateData.paymentMessage = `${paymentDetails.status} - ${paymentDetails.method || 'unknown method'}`;
          if (paymentDetails.error_code) {
            updateData.paymentMessage += ` (Error: ${paymentDetails.error_code})`;
          }
        }

        console.log(`Updating order with data:`, updateData);
        console.log(`Firebase order ID: ${firebase_order_id}`);
        
        try {
          // Update using Admin SDK (bypasses security rules)
          await getAdminDb().collection('orders').doc(firebase_order_id).update(updateData);
          console.log(`Order ${firebase_order_id} updated successfully with payment status: ${paymentStatus}`);
        } catch (updateError) {
          console.error('Error updating order with Admin SDK:', updateError);
          console.error('Update error details:', {
            message: updateError instanceof Error ? updateError.message : 'Unknown error',
            stack: updateError instanceof Error ? updateError.stack : 'No stack trace',
            firebaseOrderId: firebase_order_id,
            updateData
          });
          throw updateError;
        }
        
        return NextResponse.json({ 
          status: 'success', 
          message: 'Order updated successfully',
          orderId: firebase_order_id,
          paymentId: razorpay_payment_id,
          paymentStatus
        });
      } else {
        console.warn(`Order ${firebase_order_id} not found in Firebase`);
        return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 });
      }
    } catch (error) {
      console.error('Error updating order in Firebase:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        firebaseOrderId: firebase_order_id,
        paymentStatus,
        razorpay_payment_id
      });
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error processing payment update:', error);
    console.error('Top level error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to process payment update',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
