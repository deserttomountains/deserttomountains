import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/firebase';
import { razorpayService } from '@/services/razorpayService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Razorpay sends payload with: order_id, payment_id, signature, etc.
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, status } = body;

    // Signature verification using razorpayService.verifyPaymentSignature
    const isValid = razorpayService.verifyPaymentSignature(
      razorpay_order_id || order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (!isValid) {
      return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 400 });
    }

    // Update order status in Firebase
    if (razorpay_order_id || order_id) {
      try {
        const orderRef = await AuthService.getOrderById(razorpay_order_id || order_id);
        if (orderRef) {
          await AuthService.updateOrder(razorpay_order_id || order_id, {
            paymentStatus: status === 'captured' ? 'completed' : 'failed',
            transactionId: razorpay_payment_id,
            paymentMode: 'razorpay',
            paymentMessage: status,
            paymentTime: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error updating order in Firebase:', error);
      }
    }

    return NextResponse.json({ status: 'success', message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to process webhook' }, { status: 500 });
  }
} 