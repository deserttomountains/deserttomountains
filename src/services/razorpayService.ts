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

export interface RazorpayPaymentVerification {
  orderId: string;
  paymentId: string;
  signature: string;
}

class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private baseUrl: string;
  private readonly MIN_AMOUNT = 100; // 1 INR in paise
  private readonly MAX_AMOUNT = 100000000; // 10 Lakh INR in paise
  private readonly SUPPORTED_CURRENCIES = ['INR'];

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

  private validateOrderRequest(orderData: RazorpayOrderRequest): void {
    if (!orderData.amount || orderData.amount < this.MIN_AMOUNT) {
      throw new Error(`Amount must be at least ${this.MIN_AMOUNT / 100} INR`);
    }
    if (orderData.amount > this.MAX_AMOUNT) {
      throw new Error(`Amount cannot exceed ${this.MAX_AMOUNT / 100} INR`);
    }
    if (!this.SUPPORTED_CURRENCIES.includes(orderData.currency)) {
      throw new Error(`Currency ${orderData.currency} is not supported. Supported currencies: ${this.SUPPORTED_CURRENCIES.join(', ')}`);
    }
    if (!orderData.receipt || orderData.receipt.trim().length === 0) {
      throw new Error('Receipt is required');
    }
  }

  async createOrder(orderData: RazorpayOrderRequest): Promise<RazorpayOrderResponse> {
    try {
      // Validate input
      this.validateOrderRequest(orderData);

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
        const errorMessage = errorData.error?.description || errorData.error?.code || response.statusText;
        throw new Error(`Razorpay API Error: ${errorMessage}`);
      }

      const order = await response.json();
      
      // Validate response
      if (!order.id) {
        throw new Error('Invalid response from Razorpay: Missing order ID');
      }

      return order;
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      
      // Provide specific error messages for common issues
      if (error.message.includes('Razorpay API Error')) {
        throw error;
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to Razorpay. Please check your internet connection.');
      }
      
      throw new Error('Failed to create Razorpay order. Please try again.');
    }
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    try {
      // Validate inputs
      if (!orderId || !paymentId || !signature) {
        console.error('Missing required parameters for signature verification');
        return false;
      }

      // Validate format
      if (!orderId.startsWith('order_') || !paymentId.startsWith('pay_')) {
        console.error('Invalid order ID or payment ID format');
        return false;
      }

      // Generate expected signature
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      // Compare signatures
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );

      if (!isValid) {
        console.error('Signature verification failed');
        console.error('Expected:', expectedSignature);
        console.error('Received:', signature);
      }

      return isValid;
    } catch (error) {
      console.error('Error during signature verification:', error);
      return false;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!payload || !signature) {
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
    } catch (error) {
      console.error('Error during webhook signature verification:', error);
      return false;
    }
  }

  // Get payment details
  async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Razorpay API Error: ${errorData.error?.description || response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  // List available payment methods for UI
  getAvailablePaymentMethods() {
    return [
      {
        id: 'razorpay',
        name: 'Razorpay',
        icon: 'CreditCard',
        description: 'Pay via UPI, Cards, Netbanking, Wallets, EMI',
        popular: true,
        color: 'from-blue-600 to-indigo-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        minAmount: this.MIN_AMOUNT / 100,
        maxAmount: this.MAX_AMOUNT / 100,
        supportedCurrencies: this.SUPPORTED_CURRENCIES,
      },
    ];
  }
}

export const razorpayService = new RazorpayService();
export default razorpayService; 