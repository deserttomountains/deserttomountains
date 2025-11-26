import { createHmac, timingSafeEqual } from 'crypto';

// Cashfree Payment Gateway Integration Service

export interface CashfreeOrderRequest {
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNote?: string;
  source?: string;
  returnUrl?: string;
}

export interface CashfreeOrderResponse {
  orderId: string;
  orderStatus: string;
  paymentUrl: string;
  orderAmount: number;
  orderCurrency: string;
  orderNote: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  orderMeta: {
    returnUrl: string;
    notifyUrl: string;
    paymentMethods: string;
  };
  paymentSessionId?: string; // For Drop-in JS
}

export interface CashfreePaymentStatus {
  orderId: string;
  orderAmount: number;
  referenceId: string;
  txStatus: string;
  paymentMode: string;
  txMsg: string;
  txTime: string;
  signature: string;
}

// TypeScript interfaces for Cashfree API responses
export interface CashfreeApiOrderResponse {
  order_id?: string;
  order_status?: string;
  payment_session_id?: string;
  payment_link?: string;
  order_amount?: number;
  order_currency?: string;
  order_note?: string;
  customer_details?: {
    customer_id?: string;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
  };
  order_meta?: {
    return_url?: string;
    notify_url?: string;
    payment_methods?: string;
  };
  payment?: {
    reference_id?: string;
    tx_status?: string;
    payment_mode?: string;
    tx_msg?: string;
    tx_time?: string;
    signature?: string;
  };
  reference_id?: string;
  tx_status?: string;
  payment_mode?: string;
  tx_msg?: string;
  tx_time?: string;
  signature?: string;
  message?: string;
  [key: string]: any; // Allow additional fields
}

export interface CashfreeApiError {
  message?: string;
  code?: string;
  type?: string;
  [key: string]: any;
}

class CashfreeService {
  private clientId: string;
  private clientSecret: string;
  private webhookSecret: string;
  private environment: 'TEST' | 'PROD';
  private baseUrl: string;
  private paymentMethods: string;

  constructor() {
    this.environment = (process.env.NEXT_PUBLIC_CASHFREE_ENV as 'TEST' | 'PROD') || 'TEST';
    const isProduction = this.environment === 'PROD';
    
    // Validate environment variables - fail fast in production
    this.clientId = process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID || '';
    this.clientSecret = process.env.CASHFREE_CLIENT_SECRET || '';
    this.webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET || '';
    
    if (isProduction) {
      const missingVars: string[] = [];
      if (!this.clientId) missingVars.push('NEXT_PUBLIC_CASHFREE_CLIENT_ID');
      if (!this.clientSecret) missingVars.push('CASHFREE_CLIENT_SECRET');
      if (!this.webhookSecret) missingVars.push('CASHFREE_WEBHOOK_SECRET');
      
      if (missingVars.length > 0) {
        throw new Error(
          `Cashfree service initialization failed: Missing required environment variables in production: ${missingVars.join(', ')}`
        );
      }
    } else {
      // Use test defaults only in development/test
      this.clientId = this.clientId || 'test_1234567890';
      this.clientSecret = this.clientSecret || 'test_secret_1234567890';
      this.webhookSecret = this.webhookSecret || 'test_webhook_secret_1234567890';
    }
    
    this.baseUrl = this.environment === 'PROD' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';
    
    // Payment methods from environment variable or default
    this.paymentMethods = process.env.CASHFREE_PAYMENT_METHODS || 'cc,dc,nb,upi,paylater,emi';
    
    // Log configuration for debugging (sanitized)
    console.log('Cashfree Service Configuration:', {
      environment: this.environment,
      baseUrl: this.baseUrl,
      clientId: this.clientId.substring(0, 10) + '...', // Log partial for security
      hasClientSecret: !!this.clientSecret,
      hasWebhookSecret: !!this.webhookSecret,
      paymentMethods: this.paymentMethods
    });
  }

  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-client-id': this.clientId,
      'x-client-secret': this.clientSecret,
      'x-api-version': '2023-08-01'
    };
  }

  async createOrder(orderData: CashfreeOrderRequest & { notifyUrl?: string }): Promise<CashfreeOrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          order_id: orderData.orderId,
          order_amount: orderData.orderAmount,
          order_currency: orderData.orderCurrency,
          customer_details: {
            customer_id: `CUST_${Date.now()}`,
            customer_name: orderData.customerName,
            customer_email: orderData.customerEmail,
            customer_phone: orderData.customerPhone
          },
          order_meta: {
            return_url: orderData.returnUrl,
            notify_url: orderData.notifyUrl,
            payment_methods: this.paymentMethods
          },
          order_note: orderData.orderNote || "Desert to Mountains - Wall Putty Order"
        })
      });

      if (!response.ok) {
        let errorData: CashfreeApiError = {};
        const responseText = await response.text();
        
        try {
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch (parseError) {
          console.error('Failed to parse Cashfree API error response:', parseError);
          // Keep errorData as empty object, we'll use status text
        }
        
        console.error('Cashfree API Error:', {
          status: response.status,
          statusText: response.statusText,
          message: errorData.message,
          code: errorData.code,
          responseText: responseText.substring(0, 200) // Log first 200 chars
        });
        
        const errorMessage = errorData.message || errorData.code || response.statusText || 'Unknown error';
        throw new Error(`Cashfree API Error (${response.status}): ${errorMessage}`);
      }

      const responseText = await response.text();
      let data: CashfreeApiOrderResponse;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Cashfree API success response:', parseError);
        throw new Error('Invalid response format from Cashfree API');
      }
      
      // Log only essential fields (no PII)
      console.log('Cashfree API order response:', {
        orderId: data.order_id,
        orderStatus: data.order_status,
        hasPaymentSessionId: !!data.payment_session_id
      });
      return this.transformOrderResponse(data);
    } catch (error: any) {
      console.error('Error creating Cashfree order:', error);
      // Preserve the original error message if it exists
      if (error instanceof Error && error.message) {
        throw error; // Re-throw with original message
      }
      throw new Error('Failed to create payment order. Please try again.');
    }
  }

  async getOrderStatus(orderId: string): Promise<CashfreePaymentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData: CashfreeApiError = await response.json().catch(() => ({}));
        throw new Error(`Cashfree API Error: ${errorData.message || response.statusText}`);
      }

      const data: CashfreeApiOrderResponse = await response.json();
      return this.transformPaymentStatus(data);
    } catch (error) {
      console.error('Error fetching order status:', error);
      throw new Error('Failed to fetch payment status. Please try again.');
    }
    }

  async verifyPaymentSignature(orderId: string, orderAmount: number, referenceId: string, signature: string): Promise<boolean> {
    try {
      // Create the message string as per Cashfree's signature verification method
      const message = `${orderId}${orderAmount}${referenceId}`;
      
      // Create HMAC SHA256 hash using the webhook secret
      const expectedSignature = createHmac('sha256', this.webhookSecret)
        .update(message)
        .digest('hex');
      
      // Compare the expected signature with the received signature
      const isValid = timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
      
      console.log('Cashfree signature verification:', {
        orderId,
        orderAmount,
        referenceId,
        message,
        expectedSignature,
        receivedSignature: signature,
        isValid
      });
      
      return isValid;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  // Alternative method for webhook signature verification (when we have the raw body)
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    try {
      // Create HMAC SHA256 hash using the webhook secret
      const expectedSignature = createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');
      
      // Compare the expected signature with the received signature
      const isValid = timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(signature, 'hex')
      );
      
      console.log('Cashfree webhook signature verification:', {
        rawBodyLength: rawBody.length,
        expectedSignature,
        receivedSignature: signature,
        isValid
      });
      
      return isValid;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  private transformOrderResponse(data: CashfreeApiOrderResponse): CashfreeOrderResponse {
    try {
      // Add null checks and default values
      const customerDetails = data.customer_details || {};
      const orderMeta = data.order_meta || {};
      
      return {
        orderId: data.order_id || '',
        orderStatus: data.order_status || 'UNKNOWN',
        paymentSessionId: data.payment_session_id, // For Drop-in JS
        paymentUrl: data.payment_link || '',
        orderAmount: data.order_amount || 0,
        orderCurrency: data.order_currency || 'INR',
        orderNote: data.order_note || '',
        customerDetails: {
          customerId: customerDetails.customer_id || '',
          customerName: customerDetails.customer_name || '',
          customerEmail: customerDetails.customer_email || '',
          customerPhone: customerDetails.customer_phone || ''
        },
        orderMeta: {
          returnUrl: orderMeta.return_url || '',
          notifyUrl: orderMeta.notify_url || '',
          paymentMethods: orderMeta.payment_methods || this.paymentMethods
        }
      };
    } catch (error) {
      console.error('Error transforming order response:', error);
      console.warn('Cashfree API response structure may have changed:', {
        hasOrderId: !!data.order_id,
        hasCustomerDetails: !!data.customer_details,
        hasOrderMeta: !!data.order_meta
      });
      // Return minimal valid response
      return {
        orderId: data.order_id || '',
        orderStatus: data.order_status || 'UNKNOWN',
        paymentSessionId: data.payment_session_id,
        paymentUrl: data.payment_link || '',
        orderAmount: data.order_amount || 0,
        orderCurrency: data.order_currency || 'INR',
        orderNote: data.order_note || '',
        customerDetails: {
          customerId: '',
          customerName: '',
          customerEmail: '',
          customerPhone: ''
        },
        orderMeta: {
          returnUrl: '',
          notifyUrl: '',
          paymentMethods: this.paymentMethods
        }
      };
    }
  }

  private transformPaymentStatus(data: CashfreeApiOrderResponse): CashfreePaymentStatus {
    try {
      // Cashfree API might return tx_status in the payment object or order_status at root level
      // Check both locations for transaction status with null checks
      const payment = data.payment || {};
      const txStatus = data.tx_status || payment.tx_status || data.order_status || '';
      
      return {
        orderId: data.order_id || '',
        orderAmount: data.order_amount || 0,
        referenceId: data.reference_id || payment.reference_id || '',
        txStatus: txStatus,
        paymentMode: data.payment_mode || payment.payment_mode || '',
        txMsg: data.tx_msg || payment.tx_msg || '',
        txTime: data.tx_time || payment.tx_time || '',
        signature: data.signature || payment.signature || ''
      };
    } catch (error) {
      console.error('Error transforming payment status:', error);
      console.warn('Cashfree API response structure may have changed:', {
        hasOrderId: !!data.order_id,
        hasPayment: !!data.payment,
        hasTxStatus: !!data.tx_status
      });
      // Return minimal valid response
      return {
        orderId: data.order_id || '',
        orderAmount: data.order_amount || 0,
        referenceId: data.reference_id || '',
        txStatus: data.tx_status || data.order_status || '',
        paymentMode: '',
        txMsg: '',
        txTime: '',
        signature: ''
      };
    }
  }

  // Get payment methods available
  getAvailablePaymentMethods() {
    return [
      {
        id: 'upi',
        name: 'UPI Payment',
        icon: 'Smartphone',
        description: 'Fast & secure payments via UPI',
        popular: true,
        color: 'from-blue-500 to-purple-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: 'CreditCard',
        description: 'Visa, MasterCard, RuPay accepted',
        popular: false,
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        icon: 'Building2',
        description: 'Direct bank transfer',
        popular: false,
        color: 'from-orange-500 to-red-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      },
      {
        id: 'paylater',
        name: 'Pay Later',
        icon: 'CreditCard',
        description: 'Buy now, pay later options',
        popular: false,
        color: 'from-purple-500 to-pink-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      },
      {
        id: 'emi',
        name: 'EMI',
        icon: 'CreditCard',
        description: 'Easy monthly installments',
        popular: false,
        color: 'from-indigo-500 to-blue-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200'
      }
    ];
  }
}

export const cashfreeService = new CashfreeService();
export default cashfreeService; 