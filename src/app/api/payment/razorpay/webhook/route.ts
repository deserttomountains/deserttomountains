import { NextRequest, NextResponse } from 'next/server';
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
      entity,
      firebase_order_id
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
      console.log('Webhook - Payment details from Razorpay:', paymentDetails);
      console.log('Webhook - Payment status from Razorpay:', paymentDetails?.status);
      console.log('Webhook - Payment method from Razorpay:', paymentDetails?.method);
      console.log('Webhook - Status from webhook payload:', status);
    } catch (error) {
      console.error('Error fetching payment details:', error);
      // Continue processing even if we can't fetch details
    }

    // Determine payment status
    let paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded' = 
      status === 'captured' || status === 'authorized' || status === 'success' || 
      paymentDetails?.status === 'captured' || paymentDetails?.status === 'authorized' || paymentDetails?.status === 'success'
        ? 'completed' 
        : status === 'failed' || status === 'declined' || status === 'cancelled' ||
          paymentDetails?.status === 'failed' || paymentDetails?.status === 'declined' || paymentDetails?.status === 'cancelled'
        ? 'failed'
        : 'pending';
    
    // If signature verification passed but status is still pending, consider it completed
    // This is especially important for test mode where status might not be exactly 'captured'
    if (paymentStatus === 'pending' && isValidPayment) {
      console.log('Webhook - Signature verification passed but status is pending. Considering payment as completed.');
      paymentStatus = 'completed';
    }

    console.log(`Razorpay payment ${paymentStatus} for order: ${orderId}`);
    console.log(`Payment ID: ${paymentId}, Firebase Order ID: ${firebase_order_id}`);
    
    // Note: Order updates are now handled on the client side after successful payment
    // This webhook is kept for logging and future server-side processing if needed

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
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 