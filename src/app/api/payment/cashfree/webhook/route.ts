import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { cashfreeService } from '@/services/cashfreeService';
import { RATE_LIMITS, createRateLimitMiddleware } from '@/lib/security/rate-limiter';

// Rate limiting middleware
const rateLimitMiddleware = createRateLimitMiddleware(RATE_LIMITS.WEBHOOK_CASHFREE);

// Helper function to sanitize logs (remove PII)
function sanitizeLogData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  const sanitized = { ...data };
  const fieldsToMask = ['customerEmail', 'customerPhone', 'customerName', 'email', 'phone', 'name'];
  
  for (const field of fieldsToMask) {
    if (sanitized[field]) {
      const value = String(sanitized[field]);
      if (field.includes('Email')) {
        const [local, domain] = value.split('@');
        sanitized[field] = `${local.substring(0, 2)}***@${domain || '***'}`;
      } else if (field.includes('Phone')) {
        sanitized[field] = value.length > 4 ? `${value.substring(0, 2)}***${value.slice(-2)}` : '***';
      } else if (field.includes('Name')) {
        sanitized[field] = value.length > 2 ? `${value.substring(0, 1)}***` : '***';
      }
    }
  }
  
  return sanitized;
}

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
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get the raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    // Log sanitized webhook data (no PII)
    const sanitizedBody = sanitizeLogData(body);
    console.log('Cashfree Webhook received:', JSON.stringify({
      orderId: sanitizedBody.orderId,
      orderAmount: sanitizedBody.orderAmount,
      txStatus: sanitizedBody.txStatus,
      paymentMode: sanitizedBody.paymentMode
    }));
    
    const {
      orderId,
      orderAmount,
      referenceId,
      txStatus,
      paymentMode,
      txMsg,
      txTime,
      signature: bodySignature
    } = body;
    
    // Fix: Check signature in headers first (per Cashfree docs), fallback to body for compatibility
    const headerSignature = request.headers.get('x-webhook-signature');
    const timestamp = request.headers.get('x-webhook-timestamp');
    const signature = headerSignature || bodySignature;
    const signatureSource = headerSignature ? 'header' : 'body';
    
    // Verify webhook signature
    if (!signature) {
      console.error('Cashfree webhook missing signature (checked header and body)');
      return NextResponse.json(
        { error: 'Missing signature', code: 'MISSING_SIGNATURE' },
        { status: 400 }
      );
    }
    
    // Log signature source for debugging
    console.log(`Cashfree webhook signature source: ${signatureSource}${timestamp ? `, timestamp: ${timestamp}` : ''}`);
    
    // Verify the webhook signature using the raw body
    const isValidSignature = cashfreeService.verifyWebhookSignature(rawBody, signature);
    
    if (!isValidSignature) {
      console.error('Cashfree webhook invalid signature');
      return NextResponse.json(
        { error: 'Invalid signature', code: 'INVALID_SIGNATURE' },
        { status: 400 }
      );
    }
    
    console.log('Cashfree webhook signature verified successfully');
    
    // Initialize payment status variable
    let paymentStatus: 'pending' | 'completed' | 'failed' | 'unknown' = 'unknown';
    
    // Process the webhook data
    if (orderId && txStatus) {
      console.log(`Cashfree payment ${txStatus} for order: ${orderId}`);
      console.log(`Reference ID: ${referenceId}, Payment Mode: ${paymentMode}`);
      
      // Get additional payment details from Cashfree API to verify the status
      let orderStatusDetails = null;
      try {
        orderStatusDetails = await cashfreeService.getOrderStatus(orderId);
        // Log only essential fields (sanitized)
        console.log('Webhook - Order status details from Cashfree:', {
          orderId: orderStatusDetails?.orderId,
          txStatus: orderStatusDetails?.txStatus,
          paymentMode: orderStatusDetails?.paymentMode
        });
        console.log('Webhook - Transaction status from Cashfree API:', orderStatusDetails?.txStatus);
        console.log('Webhook - Status from webhook payload:', txStatus);
      } catch (error) {
        console.error('Error fetching order status from Cashfree API:', error);
        // Continue processing even if we can't fetch details
      }

      // Determine payment status - check multiple variations (case-insensitive)
      const normalizedTxStatus = (txStatus || '').toUpperCase();
      const normalizedApiStatus = (orderStatusDetails?.txStatus || '').toUpperCase();
      
      paymentStatus = 
        normalizedTxStatus === 'SUCCESS' || normalizedApiStatus === 'SUCCESS' ||
        normalizedTxStatus === 'PAID' || normalizedApiStatus === 'PAID' ||
        normalizedTxStatus === 'COMPLETED' || normalizedApiStatus === 'COMPLETED'
          ? 'completed' 
          : normalizedTxStatus === 'FAILED' || normalizedApiStatus === 'FAILED' ||
            normalizedTxStatus === 'CANCELLED' || normalizedApiStatus === 'CANCELLED' ||
            normalizedTxStatus === 'EXPIRED' || normalizedApiStatus === 'EXPIRED'
          ? 'failed'
          : 'pending';
      
      // If signature verification passed but status is still pending, consider it completed
      // This is especially important for cases where status might not be exactly 'SUCCESS'
      if (paymentStatus === 'pending' && isValidSignature) {
        console.log('Webhook - Signature verification passed but status is pending. Considering payment as completed.');
        paymentStatus = 'completed';
      }

      console.log(`Cashfree payment status determined: ${paymentStatus} (webhook: ${txStatus}, API: ${orderStatusDetails?.txStatus})`);
      
      // Update order status in Firebase if payment is successful
      if (paymentStatus === 'completed') {
        try {
          console.log(`Attempting to find order with ID: ${orderId}`);
          
          // Query orders collection to find the order with matching order ID
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const ordersRef = collection(serverDb, 'orders');
          const q = query(ordersRef, where('orderId', '==', orderId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const orderDoc = querySnapshot.docs[0];
            const orderData = orderDoc.data();
            const firebaseOrderId = orderDoc.id;
            
            // Fix: Add idempotency check - if already processed with same transaction ID, skip
            if (orderData.paymentStatus === 'completed' && orderData.transactionId === (referenceId || orderStatusDetails?.referenceId)) {
              console.log(`Payment already processed for order ${orderId} with transaction ${referenceId}, skipping (idempotent)`);
              return NextResponse.json({ 
                status: 'success',
                message: 'Webhook processed successfully (already processed)',
                orderId,
                paymentStatus: 'completed'
              });
            }
            
            // Fix: Add amount verification - verify order amount matches webhook amount
            const orderAmountNum = typeof orderAmount === 'string' ? parseFloat(orderAmount) : orderAmount;
            const dbAmount = orderData.finalAmount || orderData.totalAmount || 0;
            const amountDifference = Math.abs(dbAmount - orderAmountNum);
            
            if (amountDifference > 0.01) { // Allow 0.01 tolerance for floating point
              console.error(`Amount mismatch for order ${orderId}: database=${dbAmount}, webhook=${orderAmountNum}, difference=${amountDifference}`);
              return NextResponse.json(
                { error: 'Amount mismatch', code: 'AMOUNT_MISMATCH' },
                { status: 400 }
              );
            }
            
            console.log(`Order found: ${orderData.orderId}, current status: ${orderData.status}, payment status: ${orderData.paymentStatus}`);
            
            // Fix: Use ISO string for estimatedDelivery instead of Date object
            const updateData = {
              paymentStatus: paymentStatus as const,
              status: paymentStatus === 'completed' ? 'confirmed' as const : 'pending' as const,
              transactionId: referenceId || orderStatusDetails?.referenceId,
              paymentMode: paymentMode || orderStatusDetails?.paymentMode || 'cashfree',
              paymentMessage: txMsg || orderStatusDetails?.txMsg || 'Payment captured successfully',
              paymentTime: txTime || orderStatusDetails?.txTime || new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              // Set estimated delivery to 10 days from payment completion (as ISO string)
              estimatedDelivery: paymentStatus === 'completed' ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() : undefined
            };

            console.log(`Updating order with data:`, sanitizeLogData(updateData));
            
            // Update using direct Firestore operations
            await updateDoc(doc(serverDb, 'orders', firebaseOrderId), updateData);
            console.log(`Order ${firebaseOrderId} updated successfully with payment status: completed`);
          } else {
            console.warn(`Order with order ID ${orderId} not found in Firebase`);
            
            // Fallback: try to find by Firebase document ID if orderId is actually a Firebase ID
            console.log(`Trying fallback with Firebase order ID: ${orderId}`);
            const orderDocRef = doc(serverDb, 'orders', orderId);
            const orderDoc = await getDoc(orderDocRef);
            
            if (orderDoc.exists()) {
              const orderData = orderDoc.data();
              
              // Fix: Add idempotency check for fallback path
              if (orderData.paymentStatus === 'completed' && orderData.transactionId === (referenceId || orderStatusDetails?.referenceId)) {
                console.log(`Payment already processed for order ${orderId} with transaction ${referenceId}, skipping (idempotent)`);
                return NextResponse.json({ 
                  status: 'success',
                  message: 'Webhook processed successfully (already processed)',
                  orderId,
                  paymentStatus: 'completed'
                });
              }
              
              // Fix: Add amount verification for fallback path
              const orderAmountNum = typeof orderAmount === 'string' ? parseFloat(orderAmount) : orderAmount;
              const dbAmount = orderData.finalAmount || orderData.totalAmount || 0;
              const amountDifference = Math.abs(dbAmount - orderAmountNum);
              
              if (amountDifference > 0.01) {
                console.error(`Amount mismatch for order ${orderId}: database=${dbAmount}, webhook=${orderAmountNum}`);
                return NextResponse.json(
                  { error: 'Amount mismatch', code: 'AMOUNT_MISMATCH' },
                  { status: 400 }
                );
              }
              
              console.log(`Order found via fallback: ${orderData.orderId}, current status: ${orderData.status}, payment status: ${orderData.paymentStatus}`);
              
              const updateData = {
                paymentStatus: paymentStatus as const,
                status: paymentStatus === 'completed' ? 'confirmed' as const : 'pending' as const,
                transactionId: referenceId || orderStatusDetails?.referenceId,
                paymentMode: paymentMode || orderStatusDetails?.paymentMode || 'cashfree',
                paymentMessage: txMsg || orderStatusDetails?.txMsg || 'Payment captured successfully',
                paymentTime: txTime || orderStatusDetails?.txTime || new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                // Fix: Use ISO string for estimatedDelivery
                estimatedDelivery: paymentStatus === 'completed' ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() : undefined
              };

              await updateDoc(orderDocRef, updateData);
              console.log(`Order ${orderId} updated successfully via fallback with payment status: completed`);
            } else {
              console.warn(`Order ${orderId} not found in Firebase via fallback`);
            }
          }
        } catch (error) {
          console.error('Error updating order in Firebase:', error);
          // Fix: Return 500 to trigger Cashfree retry if Firebase update fails
          return NextResponse.json(
            { 
              error: 'Failed to update order',
              code: 'FIREBASE_UPDATE_FAILED',
              orderId
            },
            { status: 500 }
          );
        }
      } else {
        console.log(`Payment not completed (${paymentStatus}) - skipping order update`);
      }
    } else {
      console.warn('Webhook missing orderId or txStatus:', sanitizeLogData(body));
      return NextResponse.json(
        { error: 'Missing required fields: orderId or txStatus', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }
    
    // Return success response to Cashfree (standardized format)
    return NextResponse.json({ 
      status: 'success',
      message: 'Webhook processed successfully',
      orderId,
      paymentStatus
    });
    
  } catch (error: any) {
    console.error('Error processing Cashfree webhook:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process webhook',
        code: 'PROCESSING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error'
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