// Test script to debug Razorpay payment flow
const crypto = require('crypto');

// Mock Razorpay payment details for testing
const mockPaymentDetails = {
  id: 'pay_test123',
  entity: 'payment',
  amount: 10000, // 100 INR in paise
  currency: 'INR',
  status: 'captured', // This is what we expect in production
  method: 'card',
  captured: true,
  description: 'Test payment',
  card_id: null,
  bank: null,
  wallet: null,
  vpa: null,
  email: 'test@example.com',
  contact: '+919999999999',
  notes: {},
  fee: 0,
  tax: 0,
  error_code: null,
  error_description: null,
  created_at: Date.now()
};

// Test different status values
const testStatuses = ['captured', 'authorized', 'success', 'pending', 'failed', 'declined', 'cancelled'];

console.log('Testing Razorpay payment status determination:');
console.log('==============================================');

testStatuses.forEach(status => {
  const paymentDetails = { ...mockPaymentDetails, status };
  
  // Simulate the status determination logic
  let paymentStatus = 
    paymentDetails?.status === 'captured' || paymentDetails?.status === 'authorized' || paymentDetails?.status === 'success'
      ? 'completed' 
      : paymentDetails?.status === 'failed' || paymentDetails?.status === 'declined' || paymentDetails?.status === 'cancelled'
      ? 'failed'
      : 'pending';
  
  console.log(`Status: "${status}" -> Payment Status: "${paymentStatus}"`);
});

console.log('\nTest with signature verification fallback:');
console.log('===========================================');

testStatuses.forEach(status => {
  const paymentDetails = { ...mockPaymentDetails, status };
  const isValidPayment = true; // Assume signature verification passed
  
  let paymentStatus = 
    paymentDetails?.status === 'captured' || paymentDetails?.status === 'authorized' || paymentDetails?.status === 'success'
      ? 'completed' 
      : paymentDetails?.status === 'failed' || paymentDetails?.status === 'declined' || paymentDetails?.status === 'cancelled'
      ? 'failed'
      : 'pending';
  
  // If signature verification passed but status is still pending, consider it completed
  if (paymentStatus === 'pending' && isValidPayment) {
    console.log(`Status: "${status}" -> Payment Status: "pending" -> Final Status: "completed" (signature verified)`);
  } else {
    console.log(`Status: "${status}" -> Payment Status: "${paymentStatus}"`);
  }
});

console.log('\nExpected behavior:');
console.log('- "captured", "authorized", "success" -> "completed"');
console.log('- "failed", "declined", "cancelled" -> "failed"');
console.log('- "pending" + valid signature -> "completed"');
console.log('- "pending" + invalid signature -> "pending"');

