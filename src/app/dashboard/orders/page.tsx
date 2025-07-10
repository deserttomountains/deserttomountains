'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { ShoppingBag, ArrowRight, Package, Calendar, DollarSign, Eye, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface Order {
  orderId?: string;
  orderDate?: string;
  status?: string;
  totalAmount?: number;
  items?: any[];
  shippingAddress?: any;
  paymentMethod?: string;
}

const statusColors: Record<string, string> = {
  Delivered: 'bg-green-100 text-green-700 border-green-200',
  Shipped: 'bg-blue-100 text-blue-700 border-blue-200',
  Processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
  'Payment Pending': 'bg-orange-100 text-orange-700 border-orange-200',
};

const statusIcons: Record<string, any> = {
  Delivered: CheckCircle,
  Shipped: Package,
  Processing: Clock,
  Cancelled: XCircle,
  'Payment Pending': AlertCircle,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Load orders from localStorage
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(storedOrders);
    setLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getOrderStatus = (order: Order) => {
    if (!order.status) {
      // Determine status based on order date
      const orderDate = new Date(order.orderDate || Date.now());
      const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceOrder < 1) return 'Processing';
      if (daysSinceOrder < 3) return 'Shipped';
      if (daysSinceOrder < 7) return 'Delivered';
      return 'Delivered';
    }
    return order.status;
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <DashboardLayout active="Orders">
        <div className="max-w-3xl mx-auto py-12 px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout active="Orders">
      <div className="max-w-4xl mx-auto pt-32 md:pt-24 pb-12 px-4">
        <h1 className="text-3xl md:text-4xl font-black text-[#5E4E06] mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-[#8B7A1A]" /> My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-[#8B7A1A] mx-auto mb-6 opacity-50" />
            <h2 className="text-2xl font-bold text-[#5E4E06] mb-4">No Orders Yet</h2>
            <p className="text-[#8B7A1A] text-lg mb-8">Start shopping to see your order history here</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/aura'}
                className="px-8 py-3 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300"
              >
                Shop Aura
              </button>
              <button 
                onClick={() => window.location.href = '/dhunee'}
                className="px-8 py-3 bg-gradient-to-r from-[#8B7A1A] to-[#D4AF37] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300"
              >
                Shop Dhunee
              </button>
            </div>
          </div>
        ) : (
        <div className="space-y-6">
            {orders.map((order, index) => {
              const status = getOrderStatus(order);
              const StatusIcon = statusIcons[status] || Clock;
              
              return (
                <div key={index} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-[#D4AF37] p-6 hover:shadow-2xl transition-all">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center">
                          <StatusIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-lg text-[#5E4E06]">
                            {order.orderId || `Order #${index + 1}`}
                          </div>
                          <div className="text-[#8B7A1A] text-sm flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.orderDate || new Date().toISOString())}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status] || statusColors['Processing']}`}>
                        {status}
                      </div>
                      
                      <div className="text-[#5E4E06] font-medium text-base">
                        {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                      </div>
                      
                      <div className="text-[#8B7A1A] font-bold text-lg flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(order.totalAmount || 0)}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleViewDetails(order)}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#D4AF37] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#5E4E06]">Order Details</h2>
                  <button 
                    onClick={closeOrderDetails}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#8B7A1A] text-sm">Order ID</p>
                      <p className="font-semibold text-[#5E4E06]">{selectedOrder.orderId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[#8B7A1A] text-sm">Order Date</p>
                      <p className="font-semibold text-[#5E4E06]">
                        {formatDate(selectedOrder.orderDate || new Date().toISOString())}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#8B7A1A] text-sm">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[getOrderStatus(selectedOrder)]}`}>
                        {getOrderStatus(selectedOrder)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[#8B7A1A] text-sm">Total Amount</p>
                      <p className="font-semibold text-[#5E4E06]">{formatCurrency(selectedOrder.totalAmount || 0)}</p>
                    </div>
                  </div>

                  {/* Items */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[#5E4E06] mb-3">Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-semibold text-[#5E4E06]">{item.name}</p>
                              {item.shade && <p className="text-[#8B7A1A] text-sm">Shade: {item.shade}</p>}
                              <p className="text-[#8B7A1A] text-sm">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-[#5E4E06]">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                <div>
                      <h3 className="text-lg font-bold text-[#5E4E06] mb-3">Shipping Address</h3>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[#5E4E06]">{selectedOrder.shippingAddress.name}</p>
                        <p className="text-[#8B7A1A]">{selectedOrder.shippingAddress.address}</p>
                        <p className="text-[#8B7A1A]">
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}
                        </p>
                        <p className="text-[#8B7A1A]">Phone: {selectedOrder.shippingAddress.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
        )}
      </div>
    </DashboardLayout>
  );
} 