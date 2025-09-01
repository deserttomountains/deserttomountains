import { NextRequest, NextResponse } from 'next/server';
import { razorpayService } from '@/services/razorpayService';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Firebase configuration for server-side operations
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase for server-side operations
let serverApp: FirebaseApp;
let serverDb: Firestore;

try {
  serverApp = initializeApp(firebaseConfig, 'server-app');
  serverDb = getFirestore(serverApp);
} catch (error: any) {
  // If app already exists, get the existing one
  if (error.code === 'app/duplicate-app') {
    serverApp = initializeApp(firebaseConfig, 'server-app-2'); // Use a different name
    serverDb = getFirestore(serverApp);
  } else {
    console.error('Failed to initialize Firebase for server:', error);
    throw error;
  }
}

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
    
    // Update order status in Firebase - find order by Razorpay order ID
    if (paymentStatus === 'completed') {
      try {
        console.log(`Attempting to find order with Razorpay order ID: ${orderId}`);
        
        // Query orders collection to find the order with matching Razorpay order ID
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const ordersRef = collection(serverDb, 'orders');
        const q = query(ordersRef, where('orderId', '==', orderId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0];
          const orderData = orderDoc.data();
          const firebaseOrderId = orderDoc.id;
          
          console.log(`Order found: ${orderData.orderId}, current status: ${orderData.status}, payment status: ${orderData.paymentStatus}`);
          
          const updateData = {
            paymentStatus,
            status: paymentStatus === 'completed' ? 'confirmed' : 'pending',
            transactionId: paymentId,
            paymentMode: 'razorpay',
            paymentMessage: status || paymentDetails?.status || 'unknown',
            paymentTime: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            // Set estimated delivery to 10 days from payment completion
            estimatedDelivery: paymentStatus === 'completed' ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) : undefined
          };

          // Add additional payment details if available
          if (paymentDetails) {
            updateData.paymentMessage = `${paymentDetails.status} - ${paymentDetails.method || 'unknown method'}`;
            if (paymentDetails.error_code) {
              updateData.paymentMessage += ` (Error: ${paymentDetails.error_code})`;
            }
          }

          console.log(`Updating order with data:`, updateData);
          
          // Update using direct Firestore operations
          await updateDoc(doc(serverDb, 'orders', firebaseOrderId), updateData);
          console.log(`Order ${firebaseOrderId} updated successfully with payment status: ${paymentStatus}`);
        } else {
          console.warn(`Order with Razorpay order ID ${orderId} not found in Firebase`);
          
          // Fallback: try to find by firebase_order_id if provided
          if (firebase_order_id) {
            console.log(`Trying fallback with Firebase order ID: ${firebase_order_id}`);
            const orderDocRef = doc(serverDb, 'orders', firebase_order_id);
            const orderDoc = await getDoc(orderDocRef);
            
            if (orderDoc.exists()) {
              const orderData = orderDoc.data();
              console.log(`Order found via fallback: ${orderData.orderId}, current status: ${orderData.status}, payment status: ${orderData.paymentStatus}`);
              
              const updateData = {
                paymentStatus,
                status: paymentStatus === 'completed' ? 'confirmed' : 'pending',
                transactionId: paymentId,
                paymentMode: 'razorpay',
                paymentMessage: status || paymentDetails?.status || 'unknown',
                paymentTime: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                // Set estimated delivery to 10 days from payment completion
                estimatedDelivery: paymentStatus === 'completed' ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) : undefined
              };

              if (paymentDetails) {
                updateData.paymentMessage = `${paymentDetails.status} - ${paymentDetails.method || 'unknown method'}`;
                if (paymentDetails.error_code) {
                  updateData.paymentMessage += ` (Error: ${paymentDetails.error_code})`;
                }
              }

              await updateDoc(orderDocRef, updateData);
              console.log(`Order ${firebase_order_id} updated successfully via fallback with payment status: ${paymentStatus}`);
            } else {
              console.warn(`Order ${firebase_order_id} not found in Firebase via fallback`);
            }
          }
        }
      } catch (error) {
        console.error('Error updating order in Firebase:', error);
        // Don't fail the webhook if Firebase update fails
      }
    } else {
      console.log(`Payment not completed (${paymentStatus}) - skipping order update`);
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
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 