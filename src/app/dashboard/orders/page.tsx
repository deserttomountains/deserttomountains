'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '../DashboardLayout';
import { ShoppingBag, Package, Calendar, DollarSign, Eye, Clock, CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { AuthService, auth, Order } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Utility function to safely convert Firestore dates
const convertFirestoreDate = (date: any): Date | null => {
  if (!date) return null;
  
  try {
    // If it's already a Date object
    if (date instanceof Date) return date;
    
    // If it's a Firestore Timestamp with toDate method
    if (date && typeof date === 'object' && typeof date.toDate === 'function') {
      return date.toDate();
    }
    
    // If it's a Firestore Timestamp object with seconds/nanoseconds
    if (date && typeof date === 'object' && (date.seconds !== undefined || date.nanoseconds !== undefined)) {
      const seconds = date.seconds || 0;
      const nanoseconds = date.nanoseconds || 0;
      return new Date(seconds * 1000 + nanoseconds / 1000000);
    }
    
    // If it's a string or number
    if (typeof date === 'string' || typeof date === 'number') {
      const converted = new Date(date);
      if (!isNaN(converted.getTime())) {
        return converted;
      }
    }
    
    // If it's an object with _seconds and _nanoseconds (Firestore v8 format)
    if (date && typeof date === 'object' && (date._seconds !== undefined || date._nanoseconds !== undefined)) {
      const seconds = date._seconds || 0;
      const nanoseconds = date._nanoseconds || 0;
      return new Date(seconds * 1000 + nanoseconds / 1000000);
    }
    
    // Handle empty objects or objects without date properties
    if (date && typeof date === 'object' && Object.keys(date).length === 0) {
      console.warn('Empty object passed to convertFirestoreDate, returning null');
      return null;
    }
    
    console.warn('Unable to convert date:', date, typeof date, 'Keys:', date && typeof date === 'object' ? Object.keys(date) : 'N/A');
    return null;
  } catch (error) {
    console.error('Error converting date:', error, date);
    return null;
  }
};

const statusColors: Record<string, string> = {
  'delivered': 'bg-green-100 text-green-700 border-green-200',
  'out_for_delivery': 'bg-blue-100 text-blue-700 border-blue-200',
  'shipped': 'bg-blue-100 text-blue-700 border-blue-200',
  'processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
  'pending': 'bg-orange-100 text-orange-700 border-orange-200',
  'cancelled': 'bg-red-100 text-red-700 border-red-200',
};

const statusIcons: Record<string, any> = {
  'delivered': CheckCircle,
  'out_for_delivery': Package,
  'shipped': Package,
  'processing': Clock,
  'confirmed': CheckCircle,
  'pending': AlertCircle,
  'cancelled': XCircle,
};

const statusLabels: Record<string, string> = {
  'pending': 'Payment Pending',
  'confirmed': 'Order Confirmed',
  'processing': 'Processing',
  'shipped': 'Shipped',
  'out_for_delivery': 'Out for Delivery',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const userOrders = await AuthService.getUserOrders(user.uid);
      
      // Convert dates and ensure orderDate is set
      const convertedOrders = userOrders.map(order => {
        // If orderDate is missing, use createdAt as fallback
        let orderDate = convertFirestoreDate(order.orderDate);
        if (!orderDate) {
          orderDate = convertFirestoreDate(order.createdAt) || new Date();
          // Update the order in database if orderDate was missing
          if (order.id && !order.orderDate) {
            AuthService.updateOrder(order.id, { orderDate }).catch(error => {
              console.error('Error updating missing orderDate:', error);
            });
          }
        }
        
        return {
          ...order,
          orderDate: orderDate,
          createdAt: convertFirestoreDate(order.createdAt) || new Date(),
          updatedAt: convertFirestoreDate(order.updatedAt) || new Date(),
          estimatedDelivery: order.estimatedDelivery ? convertFirestoreDate(order.estimatedDelivery) || undefined : undefined,
          actualDelivery: order.actualDelivery ? convertFirestoreDate(order.actualDelivery) || undefined : undefined
        };
      });
      
      setOrders(convertedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    }
  };

  useEffect(() => {
    if (user) {
      // Initial fetch
      fetchOrders();
      
      // Set up real-time listener with simplified query
      const ordersQuery = query(
        collection(db, 'orders'),
        where('customerId', '==', user.uid)
        // Removed orderBy to avoid index requirement temporarily
      );

      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        const userOrders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        

        
        // Sort locally to avoid index requirement
        userOrders.sort((a, b) => {
          const dateA = convertFirestoreDate(a.createdAt)?.getTime() || 0;
          const dateB = convertFirestoreDate(b.createdAt)?.getTime() || 0;
          return dateB - dateA; // Descending order (newest first)
        });
        
        setOrders(userOrders);
        setLoading(false);
      }, (error) => {
        console.error('Error listening to orders:', error);
        setError('Failed to load orders in real-time. Please refresh.');
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const formatDate = (date: any) => {
    const convertedDate = convertFirestoreDate(date);
    if (!convertedDate) return 'N/A';
    
    try {
      return convertedDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getOrderStatus = (order: Order) => {
    return order.status || 'pending';
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
      <div className="max-w-4xl mx-auto pt-24 sm:pt-32 md:pt-24 pb-20 sm:pb-12 px-4">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#5E4E06] flex items-center gap-2 sm:gap-3">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-[#8B7A1A]" /> My Orders
              {orders.length > 0 && (
                <span className="bg-[#D4AF37] text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full">
                  {orders.length}
                </span>
              )}
            </h1>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="self-start sm:self-auto flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer text-sm sm:text-base"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-2 text-red-600 underline hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Package className="w-16 h-16 sm:w-24 sm:h-24 text-[#8B7A1A] mx-auto mb-4 sm:mb-6 opacity-50" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06] mb-3 sm:mb-4">No Orders Yet</h2>
            <p className="text-[#8B7A1A] text-base sm:text-lg mb-6 sm:mb-8">Start shopping to see your order history here</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/aura'}
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                Shop Aura
              </button>
              <button 
                onClick={() => window.location.href = '/dhunee'}
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#8B7A1A] to-[#D4AF37] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                Shop Dhunee
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => {
              const status = getOrderStatus(order);
              const StatusIcon = statusIcons[status] || Clock;
              
              return (
                <div key={order.id} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-[#D4AF37] p-4 sm:p-6 hover:shadow-2xl transition-all">
                  {/* Mobile Layout - Vertical */}
                  <div className="flex flex-col gap-4 sm:hidden">
                    {/* Order Header - Icon, ID, Date */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center">
                        <StatusIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-base text-[#5E4E06]">
                          {order.orderId || `Order #${order.id?.slice(-8)}`}
                        </div>
                        <div className="text-[#8B7A1A] text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Order Details - Status, Items, Price */}
                    <div className="flex flex-col gap-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-bold border w-fit ${statusColors[status] || statusColors['pending']}`}>
                        {statusLabels[status] || status}
                      </div>
                      
                      <div className="text-[#5E4E06] font-medium text-sm">
                        {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                      </div>
                      
                      <div className="text-[#8B7A1A] font-bold text-base">
                        {formatCurrency(order.finalAmount || order.totalAmount || 0)}
                      </div>
                    </div>
                    
                    {/* View Details Button */}
                    <button 
                      onClick={() => handleViewDetails(order)}
                      className="self-start inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300 cursor-pointer text-sm"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>
                  </div>

                  {/* Desktop Layout - Horizontal */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between">
                    {/* Left Section - Order Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] rounded-xl flex items-center justify-center">
                        <StatusIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-[#5E4E06]">
                          {order.orderId || `Order #${order.id?.slice(-8)}`}
                        </div>
                        <div className="text-[#8B7A1A] text-sm flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Middle Section - Status, Items, Price */}
                    <div className="flex items-center gap-6">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status] || statusColors['pending']}`}>
                        {statusLabels[status] || status}
                      </div>
                      
                      <div className="text-[#5E4E06] font-medium text-base">
                        {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                      </div>
                      
                      <div className="text-[#8B7A1A] font-bold text-lg">
                        {formatCurrency(order.finalAmount || order.totalAmount || 0)}
                      </div>
                    </div>
                    
                    {/* Right Section - View Details Button */}
                    <button 
                      onClick={() => handleViewDetails(order)}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300 cursor-pointer text-base whitespace-nowrap"
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 pt-20">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-[#D4AF37] max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#5E4E06]">Order Details</h2>
                  <button 
                    onClick={closeOrderDetails}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
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
                        {formatDate(selectedOrder.orderDate || selectedOrder.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#8B7A1A] text-sm">Status</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[getOrderStatus(selectedOrder)]}`}>
                        {statusLabels[getOrderStatus(selectedOrder)] || getOrderStatus(selectedOrder)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[#8B7A1A] text-sm">Total Amount</p>
                      <p className="font-semibold text-[#5E4E06]">{formatCurrency(selectedOrder.finalAmount || selectedOrder.totalAmount || 0)}</p>
                    </div>
                    {selectedOrder.paymentStatus && (
                      <div>
                        <p className="text-[#8B7A1A] text-sm">Payment Status</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                          selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.paymentMethod && (
                      <div>
                        <p className="text-[#8B7A1A] text-sm">Payment Method</p>
                        <p className="font-semibold text-[#5E4E06]">{selectedOrder.paymentMethod}</p>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-[#5E4E06] mb-3">Items</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="font-semibold text-[#5E4E06]">{item.productName}</p>
                              {item.productType && <p className="text-[#8B7A1A] text-sm">Type: {item.productType}</p>}
                              {item.variant && <p className="text-[#8B7A1A] text-sm">Variant: {item.variant}</p>}
                              {item.shades && item.shades.length > 0 && (
                                <p className="text-[#8B7A1A] text-sm">Shades: {item.shades.join(', ')}</p>
                              )}
                              <p className="text-[#8B7A1A] text-sm">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-[#5E4E06]">{formatCurrency(item.totalPrice)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div>
                      <h3 className="text-lg font-bold text-[#5E4E06] mb-3">Shipping Address</h3>
                      <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                        {/* Customer Details */}
                        <div className="border-b border-gray-200 pb-2 mb-2">
                          <p className="font-medium text-[#5E4E06]">Full Name: <span className="font-normal">{selectedOrder.customerName}</span></p>
                          <p className="font-medium text-[#5E4E06]">Email: <span className="font-normal">{selectedOrder.customerEmail}</span></p>
                          <p className="font-medium text-[#5E4E06]">Phone: <span className="font-normal">{selectedOrder.customerPhone}</span></p>
                        </div>
                        
                        {/* Address Details */}
                        {selectedOrder.shippingAddress.addressLine1 && (
                          <p className="text-[#8B7A1A]"><span className="font-medium">Address Line 1:</span> {selectedOrder.shippingAddress.addressLine1}</p>
                        )}
                        {selectedOrder.shippingAddress.street && (
                          <p className="text-[#8B7A1A]"><span className="font-medium">Street:</span> {selectedOrder.shippingAddress.street}</p>
                        )}
                        {selectedOrder.shippingAddress.addressLine2 && (
                          <p className="text-[#8B7A1A]"><span className="font-medium">Address Line 2:</span> {selectedOrder.shippingAddress.addressLine2}</p>
                        )}
                        <p className="text-[#8B7A1A]">
                          <span className="font-medium">City:</span> {selectedOrder.shippingAddress.city}
                          {selectedOrder.shippingAddress.state && <span>, State: {selectedOrder.shippingAddress.state}</span>}
                          {selectedOrder.shippingAddress.pincode && <span>, Postal Code: {selectedOrder.shippingAddress.pincode}</span>}
                        </p>
                        {selectedOrder.shippingAddress.country && (
                          <p className="text-[#8B7A1A]"><span className="font-medium">Country:</span> {selectedOrder.shippingAddress.country}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Estimated Delivery */}
                  <div>
                    <h3 className="text-lg font-bold text-[#5E4E06] mb-3">Estimated Delivery</h3>
                    <div className="p-3 bg-gray-50 rounded-xl">
                      {selectedOrder.paymentStatus === 'completed' ? (
                        selectedOrder.estimatedDelivery ? (
                          <div className="space-y-2">
                            <p className="text-[#8B7A1A]">
                              <span className="font-medium">Expected Delivery Date:</span> {formatDate(selectedOrder.estimatedDelivery)}
                            </p>
                            {selectedOrder.actualDelivery && (
                              <p className="text-[#8B7A1A]">
                                <span className="font-medium">Actual Delivery Date:</span> {formatDate(selectedOrder.actualDelivery)}
                              </p>
                            )}
                            {selectedOrder.trackingNumber && (
                              <p className="text-[#8B7A1A]">
                                <span className="font-medium">Tracking Number:</span> {selectedOrder.trackingNumber}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[#8B7A1A]">
                            <span className="font-medium">Status:</span> Delivery date will be updated soon
                          </p>
                        )
                      ) : selectedOrder.paymentStatus === 'pending' ? (
                        <div className="space-y-2">
                          <p className="text-[#8B7A1A]">
                            <span className="font-medium">Status:</span> Payment Pending
                          </p>
                          <p className="text-[#8B7A1A] text-sm">
                            Estimated delivery will be set to 10 days from payment completion
                          </p>
                        </div>
                      ) : selectedOrder.paymentStatus === 'failed' ? (
                        <div className="space-y-2">
                          <p className="text-[#8B7A1A]">
                            <span className="font-medium">Status:</span> Payment Failed
                          </p>
                          <p className="text-[#8B7A1A] text-sm">
                            Please complete payment to get delivery estimate
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[#8B7A1A]">
                            <span className="font-medium">Status:</span> Payment {selectedOrder.paymentStatus}
                          </p>
                          <p className="text-[#8B7A1A] text-sm">
                            Complete payment to get delivery estimate
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="text-lg font-bold text-[#5E4E06] mb-3">Order Notes</h3>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[#8B7A1A]">{selectedOrder.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Pending Note - Full Width at Bottom */}
                  {selectedOrder.paymentStatus === 'pending' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg w-full">
                      <p className="text-blue-800 text-sm font-medium">
                        💡 Payment Note:
                      </p>
                      <p className="text-blue-700 text-sm mt-2 leading-relaxed">
                        If you have already paid and money is deducted from your account but the status shows as pending, please don't worry.{' '}
                        <a 
                          href="/contact" 
                          className="text-blue-800 font-medium underline hover:text-blue-900 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Contact us
                        </a>{' '}
                        and we will resolve your issue promptly.
                      </p>
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