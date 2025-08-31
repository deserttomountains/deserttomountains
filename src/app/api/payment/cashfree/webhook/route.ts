import { NextRequest, NextResponse } from 'next/server';
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
      
      // Update order status in Firebase if payment is successful
      if (txStatus === 'SUCCESS') {
        try {
          console.log(`Attempting to find order with ID: ${orderId}`);
          
          // Use direct Firestore operations
          const orderDocRef = doc(serverDb, 'orders', orderId);
          const orderDoc = await getDoc(orderDocRef);
          
          if (orderDoc.exists()) {
            const orderData = orderDoc.data();
            console.log(`Order found: ${orderData.orderId}, current status: ${orderData.status}, payment status: ${orderData.paymentStatus}`);
            
            const updateData = {
              paymentStatus: 'completed' as const,
              status: 'confirmed' as const,
              transactionId: referenceId,
              paymentMode: paymentMode,
              paymentMessage: txMsg,
              paymentTime: txTime,
              lastUpdated: new Date().toISOString(),
            };

            console.log(`Updating order with data:`, updateData);
            
            // Update using direct Firestore operations
            await updateDoc(orderDocRef, updateData);
            console.log(`Order ${orderId} updated successfully with payment status: completed`);
          } else {
            console.warn(`Order ${orderId} not found in Firebase`);
          }
        } catch (error) {
          console.error('Error updating order in Firebase:', error);
          // Don't fail the webhook if Firebase update fails
        }
      } else {
        console.log(`Payment not successful (${txStatus}) - skipping order update`);
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