import { AuthService, Order, OrderItem, Address } from '@/lib/firebase';

export interface CreateOrderRequest {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    productType: 'aura' | 'dhunee';
    quantity: number;
    unitPrice: number;
    variant?: string;
    shades?: string[];
  }[];
  totalAmount: number;
  tax: number;
  shipping: number;
  finalAmount: number;
  paymentMethod: string;
  shippingAddress: Address;
  orderNotes?: string;
  transactionId?: string;
}

export class OrderService {
  /**
   * Create a new order after successful payment
   */
  static async createOrder(orderData: CreateOrderRequest): Promise<string> {
    try {
      // Calculate item totals
      const items: OrderItem[] = orderData.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productType: item.productType,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
        variant: item.variant,
        shades: item.shades
      }));

      // Create the order object
      const order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        orderId: this.generateOrderId(),
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        items,
        totalAmount: orderData.totalAmount,
        tax: orderData.tax,
        shipping: orderData.shipping,
        finalAmount: orderData.finalAmount,
        status: 'confirmed', // Order is confirmed after successful payment
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'completed', // Payment is completed
        shippingAddress: orderData.shippingAddress,
        orderDate: new Date(),
        notes: orderData.orderNotes,
        transactionId: orderData.transactionId,
        paymentTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Save to Firestore
      const orderId = await AuthService.createOrder(order);
      
      console.log('Order created successfully:', orderId);
      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  /**
   * Generate a unique order ID
   */
  private static generateOrderId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `DTM-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Get orders for a specific user
   */
  static async getUserOrders(userId: string): Promise<Order[]> {
    try {
      return await AuthService.getUserOrders(userId);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch user orders');
    }
  }

  /**
   * Get a specific order by ID
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      return await AuthService.getOrderById(orderId);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: Order['status'], notes?: string): Promise<void> {
    try {
      await AuthService.updateOrderStatus(orderId, status, notes);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }
}
