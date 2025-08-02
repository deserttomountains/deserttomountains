import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';
import { razorpayService } from '@/services/razorpayService';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    // Extract webhook signature from headers
    const signature = request.headers.get('x-razorpay-signature');
    
    if (!signature) {
      console.error('Missing Razorpay signature in webhook');
      return NextResponse.json({ status: 'error', message: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const isValidSignature = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 400 });
    }

    // Extract payment details
    const { 
      order_id, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      status,
      payment_id,
      entity
    } = body.payload?.payment?.entity || body;

    // Validate required fields
    if (!razorpay_order_id && !order_id) {
      console.error('Missing order ID in webhook payload');
      return NextResponse.json({ status: 'error', message: 'Missing order ID' }, { status: 400 });
    }

    if (!razorpay_payment_id && !payment_id) {
      console.error('Missing payment ID in webhook payload');
      return NextResponse.json({ status: 'error', message: 'Missing payment ID' }, { status: 400 });
    }

    const orderId = razorpay_order_id || order_id;
    const paymentId = razorpay_payment_id || payment_id;

    // Verify payment signature
    const isValidPayment = razorpayService.verifyPaymentSignature(
      orderId,
      paymentId,
      razorpay_signature || ''
    );

    if (!isValidPayment) {
      console.error('Invalid payment signature');
      return NextResponse.json({ status: 'error', message: 'Invalid payment signature' }, { status: 400 });
    }

    // Get additional payment details from Razorpay API
    let paymentDetails = null;
    try {
      paymentDetails = await razorpayService.getPaymentDetails(paymentId);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      // Continue processing even if we can't fetch details
    }

    // Determine payment status
    const paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' = 
      status === 'captured' || (paymentDetails?.status === 'captured') 
        ? 'completed' 
        : status === 'failed' || (paymentDetails?.status === 'failed')
        ? 'failed'
        : 'pending';

    // Update order status in Firebase
    if (orderId) {
      try {
        const orderRef = await AuthService.getOrderById(orderId);
        if (orderRef) {
          const updateData = {
            paymentStatus,
            transactionId: paymentId,
            paymentMode: 'razorpay',
            paymentMessage: status || paymentDetails?.status || 'unknown',
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

          await AuthService.updateOrder(orderId, updateData);
          console.log(`Order ${orderId} updated with payment status: ${paymentStatus}`);
        } else {
          console.warn(`Order ${orderId} not found in Firebase`);
        }
      } catch (error) {
        console.error('Error updating order in Firebase:', error);
        // Don't fail the webhook if Firebase update fails
      }
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Webhook processed successfully',
      orderId,
      paymentId,
      paymentStatus
    });
  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to process webhook',
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 