// Razorpay Payment Gateway Integration Service

import crypto from 'crypto';

export interface RazorpayOrderRequest {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private baseUrl: string;

  constructor() {
    this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret_xxxxxxxx';
    this.baseUrl = 'https://api.razorpay.com/v1';
  }

  private getAuthHeader(): string {
    // Basic Auth: base64(key_id:key_secret)
    const creds = `${this.keyId}:${this.keySecret}`;
    return 'Basic ' + Buffer.from(creds).toString('base64');
  }

  async createOrder(orderData: RazorpayOrderRequest): Promise<RazorpayOrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Razorpay API Error: ${errorData.error?.description || response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create Razorpay order. Please try again.');
    }
  }

  // TODO: Implement signature verification using Razorpay's HMAC SHA256 method
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    // See: https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/#step-4-verify-the-payment-signature
    if (!orderId || !paymentId || !signature) return false;
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return generatedSignature === signature;
  }

  // List available payment methods for UI
  getAvailablePaymentMethods() {
    return [
      {
        id: 'razorpay',
        name: 'Razorpay',
        icon: 'CreditCard', // Replace with actual icon if available
        description: 'Pay via UPI, Cards, Netbanking, Wallets, EMI',
        popular: true,
        color: 'from-blue-600 to-indigo-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
    ];
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService; 