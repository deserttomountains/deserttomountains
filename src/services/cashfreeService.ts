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

class CashfreeService {
  private clientId: string;
  private clientSecret: string;
  private environment: 'TEST' | 'PROD';
  private baseUrl: string;

  constructor() {
    // These should be moved to environment variables
    this.clientId = process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID || 'test_1234567890';
    this.clientSecret = process.env.CASHFREE_CLIENT_SECRET || 'test_secret_1234567890';
    this.environment = (process.env.NEXT_PUBLIC_CASHFREE_ENV as 'TEST' | 'PROD') || 'TEST';
    this.baseUrl = this.environment === 'PROD' 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';
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
            payment_methods: "cc,dc,nb,upi,paylater,emi"
          },
          order_note: orderData.orderNote || "Desert to Mountains - Wall Putty Order"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cashfree API Error:', errorData);
        throw new Error(`Cashfree API Error: ${errorData.message || JSON.stringify(errorData) || response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw Cashfree API response:', data);
      return this.transformOrderResponse(data);
    } catch (error) {
      console.error('Error creating Cashfree order:', error);
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
        const errorData = await response.json();
        throw new Error(`Cashfree API Error: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return this.transformPaymentStatus(data);
    } catch (error) {
      console.error('Error fetching order status:', error);
      throw new Error('Failed to fetch payment status. Please try again.');
    }
    }

  async verifyPaymentSignature(orderId: string, orderAmount: number, referenceId: string, signature: string): Promise<boolean> {
    try {
      // In a real implementation, you would verify the signature using Cashfree's verification method
      // For now, we'll return true as a placeholder
      // TODO: Implement proper signature verification
      return true;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      return false;
    }
  }

  private transformOrderResponse(data: any): CashfreeOrderResponse {
    return {
      orderId: data.order_id,
      orderStatus: data.order_status,
      paymentSessionId: data.payment_session_id, // For Drop-in JS
      orderAmount: data.order_amount,
      orderCurrency: data.order_currency,
      orderNote: data.order_note,
      customerDetails: {
        customerId: data.customer_details.customer_id,
        customerName: data.customer_details.customer_name,
        customerEmail: data.customer_details.customer_email,
        customerPhone: data.customer_details.customer_phone
      },
      orderMeta: {
        returnUrl: data.order_meta.return_url,
        notifyUrl: data.order_meta.notify_url,
        paymentMethods: data.order_meta.payment_methods
      }
    };
  }

  private transformPaymentStatus(data: any): CashfreePaymentStatus {
    return {
      orderId: data.order_id,
      orderAmount: data.order_amount,
      referenceId: data.reference_id,
      txStatus: data.tx_status,
      paymentMode: data.payment_mode,
      txMsg: data.tx_msg,
      txTime: data.tx_time,
      signature: data.signature
    };
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