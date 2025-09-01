"use client";

import { CheckCircle, Package, Truck, Clock, MapPin, Phone, Mail, ArrowRight, Home, ShoppingBag, Star, Shield, Leaf, Heart } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ToastContext';
import { AuthService } from '@/lib/firebase';

interface OrderDetails {
  orderId: string;
  orderDate: string;
  estimatedDelivery: string;
  totalAmount: number;
  paymentMethod: string;
  transactionId?: string;
  shippingAddress: any;
  items: any[];
}

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Get order details from localStorage or URL params
    const orderId = searchParams.get('orderId') || generateOrderId();
    const orderConfirmationData = localStorage.getItem('orderConfirmationData');
    const checkoutData = localStorage.getItem('checkoutData');
    
    console.log('Order Confirmation Debug:', {
      orderId,
      hasOrderConfirmationData: !!orderConfirmationData,
      hasCheckoutData: !!checkoutData,
      orderConfirmationData: orderConfirmationData ? JSON.parse(orderConfirmationData) : null
    });
    
    if (orderConfirmationData) {
      // Use stored order confirmation data from successful payment
      const parsedOrderData = JSON.parse(orderConfirmationData);
      const parsedCheckoutData = checkoutData ? JSON.parse(checkoutData) : {};
      
      // Process cart items to match the expected format
      const processedItems = parsedOrderData.items.map((item: any) => ({
        ...item,
        type: item.type || 'sample', // Default to sample if type is not specified
        variant: item.variant || 'sample', // Default to sample if variant is not specified
        // Ensure shades are properly formatted
        shades: item.shades ? item.shades.map((shade: any) => 
          typeof shade === 'string' ? shade : shade.shadeName || shade
        ) : []
      }));
      
      setOrderDetails({
        orderId: parsedOrderData.orderId,
        orderDate: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        totalAmount: parsedOrderData.amount,
        paymentMethod: parsedOrderData.paymentMethod,
        transactionId: parsedOrderData.transactionId,
        shippingAddress: parsedCheckoutData.shippingAddress || {},
        items: processedItems
      });

      // Show order placed toast
      showToast('Order placed successfully! Payment verification in progress...', 'success');
    } else if (checkoutData) {
      // Fallback to checkout data (for cases where order confirmation data is not available)
      const parsedCheckoutData = JSON.parse(checkoutData);
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      if (cart.length > 0) {
        // Process cart items to match the expected format
        const processedCartItems = cart.map((item: any) => ({
          ...item,
          type: item.type || 'sample', // Default to sample if type is not specified
          variant: item.variant || 'sample', // Default to sample if variant is not specified
          // Ensure shades are properly formatted
          shades: item.shades ? item.shades.map((shade: any) => 
            typeof shade === 'string' ? shade : shade.shadeName || shade
          ) : []
        }));
        
        const totalAmount = cart.reduce((sum: number, item: any) => sum + item.price, 0);
        const shipping = 0; // Shipping fee will be calculated separately after order confirmation
        const finalTotal = totalAmount + shipping; // 5% GST already included in product prices

        setOrderDetails({
          orderId,
          orderDate: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          totalAmount: finalTotal,
          paymentMethod: searchParams.get('paymentMethod') || 'Online Payment',
          shippingAddress: parsedCheckoutData.shippingAddress,
          items: processedCartItems
        });

        // Show order placed toast
        showToast('Order placed successfully!', 'success');
      } else {
        // If no cart data, show message instead of redirecting
        setOrderDetails(null);
        showToast('No order data found. Please check your order history.', 'info');
      }
    } else {
      // If no order data, try to fetch from database as last resort
      const orderIdFromUrl = searchParams.get('orderId');
      if (orderIdFromUrl) {
        console.log('Attempting to fetch order from database:', orderIdFromUrl);
        // Try to fetch order from database
        AuthService.getOrders().then(orders => {
          const order = orders.find(o => o.orderId === orderIdFromUrl);
          if (order) {
            console.log('Found order in database:', order);
            setOrderDetails({
              orderId: order.orderId,
              orderDate: order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : new Date().toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              totalAmount: order.totalAmount || 0,
              paymentMethod: order.paymentMode || 'Online Payment',
              transactionId: order.transactionId,
              shippingAddress: order.shippingAddress || {},
              items: order.items || []
            });
            showToast('Order details retrieved successfully!', 'success');
          } else {
            console.log('Order not found in database');
            setOrderDetails(null);
            showToast('No order data found. Please check your order history.', 'info');
          }
        }).catch(error => {
          console.error('Error fetching order from database:', error);
          setOrderDetails(null);
          showToast('No order data found. Please check your order history.', 'info');
        });
      } else {
        // If no order data, show message instead of redirecting
        setOrderDetails(null);
        showToast('No order data found. Please check your order history.', 'info');
      }
    }
    
    setIsLoading(false);
  }, [searchParams, router, showToast]);

  // Clear localStorage data after component has mounted and order details are set
  useEffect(() => {
    if (orderDetails && !isLoading) {
      // Clear order confirmation data after a short delay to ensure the page has rendered
      const clearDataTimeout = setTimeout(() => {
        localStorage.removeItem('orderConfirmationData');
        localStorage.removeItem('checkoutData');
        localStorage.removeItem('cart');
      }, 2000); // 2 second delay

      return () => clearTimeout(clearDataTimeout);
    }
  }, [orderDetails, isLoading]);

  const generateOrderId = () => {
    return 'DTM' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F6F0] via-white to-[#F0EDE4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5E4E06] mx-auto mb-6"></div>
          <p className="text-[#5E4E06] font-semibold text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F6F0] via-white to-[#F0EDE4]">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-8">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-[#5E4E06] mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We couldn't find the order details you're looking for. This might be because the order data has been cleared or the page was accessed directly.
          </p>
          <div className="space-y-4">
            <Link 
              href="/dashboard/orders" 
              className="block w-full px-6 py-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 text-center"
            >
              View My Orders
            </Link>
            <Link 
              href="/" 
              className="block w-full px-6 py-4 bg-white border-2 border-[#8B7A1A] text-[#5E4E06] font-bold rounded-2xl hover:bg-[#F8F6F0] transition-all duration-300 text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-white to-[#F0EDE4] font-sans">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/images/deserttomountains-4-scaled-1.webp')] bg-cover bg-center opacity-20"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Order Confirmed!
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Thank you for choosing Desert to Mountains! We're excited to bring natural beauty and sustainability to your space.
          </p>
          
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg font-bold border border-white/30">
              <span>Order ID: {orderDetails.orderId}</span>
            </div>
            {orderDetails.transactionId && (
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg font-bold border border-white/30">
                <span>Transaction ID: {orderDetails.transactionId}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 -mt-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details - Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Summary Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-2xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">Order Summary</h2>
                </div>
                
                                 <div className="space-y-4">
                   {orderDetails.items.map((item, index) => (
                     <div key={index} className="flex items-center gap-4 p-6 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#E8E4D8]">
                       <div className="w-16 h-16 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-2xl flex items-center justify-center">
                         <span className="text-white font-bold text-lg">
                           {item.type === 'wallputty' ? 'WP' : 'SP'}
                         </span>
                       </div>
                       <div className="flex-1">
                         <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                         <div className="space-y-1">
                                                       <p className="text-gray-600">
                              {item.type === 'wallputty' && item.variant === 'pigmented' && item.shades
                                ? `${item.totalQuantity} × 25kg`
                                : item.type === 'sample'
                                ? `${item.shades?.length || 0} colors`
                                : '25kg pack'
                              }
                            </p>
                                                       {/* Color Details */}
                            {item.type === 'wallputty' && item.variant === 'pigmented' && item.shades && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-sm font-medium text-[#5E4E06]">Colors:</span>
                                {item.shades.map((shade: any, shadeIndex: number) => (
                                  <span key={shadeIndex} className="px-2 py-1 bg-[#5E4E06]/10 text-[#5E4E06] text-xs font-medium rounded-full border border-[#5E4E06]/20">
                                    {typeof shade === 'string' ? shade : shade.shadeName || shade}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.type === 'wallputty' && item.variant === 'sample' && item.shades && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-sm font-medium text-[#5E4E06]">Sample Colors:</span>
                                {item.shades.map((shade: any, shadeIndex: number) => (
                                  <span key={shadeIndex} className="px-2 py-1 bg-[#5E4E06]/10 text-[#5E4E06] text-xs font-medium rounded-full border border-[#5E4E06]/20">
                                    {typeof shade === 'string' ? shade : shade.shadeName || shade}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.type === 'sample' && item.shades && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-sm font-medium text-[#5E4E06]">Sample Colors:</span>
                                {item.shades.map((shade: any, shadeIndex: number) => (
                                  <span key={shadeIndex} className="px-2 py-1 bg-[#5E4E06]/10 text-[#5E4E06] text-xs font-medium rounded-full border border-[#5E4E06]/20">
                                    {typeof shade === 'string' ? shade : shade.shadeName || shade}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.type === 'wallputty' && item.variant === 'natural' && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-medium text-[#5E4E06]">Natural White</span>
                                <div className="w-4 h-4 bg-white border border-gray-300 rounded-full"></div>
                              </div>
                            )}
                           {/* Variant Type */}
                           <p className="text-sm text-[#8B7A1A] font-medium capitalize">
                             {item.type === 'wallputty' && item.variant === 'pigmented' && 'Pigmented Wall Putty'}
                             {item.type === 'wallputty' && item.variant === 'sample' && 'Sample Pack'}
                             {item.type === 'wallputty' && item.variant === 'natural' && 'Natural White'}
                             {item.type === 'sample' && 'Sample Pack'}
                           </p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-black text-2xl text-[#5E4E06]">₹{item.price}</p>
                       </div>
                     </div>
                   ))}
                 </div>

                <div className="mt-8 pt-8 border-t-2 border-[#E8E4D8]">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">Total Amount</span>
                    <span className="text-3xl font-black text-[#5E4E06]">₹{orderDetails.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-2xl flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">Delivery Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-2xl">
                      <Clock className="w-6 h-6 text-[#5E4E06]" />
                      <div>
                        <p className="font-bold text-gray-900">Order Date</p>
                        <p className="text-gray-600">{orderDetails.orderDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-2xl">
                      <Truck className="w-6 h-6 text-[#5E4E06]" />
                      <div>
                        <p className="font-bold text-gray-900">Estimated Delivery</p>
                        <p className="text-gray-600">{orderDetails.estimatedDelivery}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-2xl">
                      <Package className="w-6 h-6 text-[#5E4E06]" />
                      <div>
                        <p className="font-bold text-gray-900">Payment Method</p>
                        <p className="text-gray-600">{orderDetails.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                  
                                     <div className="p-6 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#E8E4D8]">
                     <div className="flex items-start gap-4">
                       <MapPin className="w-6 h-6 text-[#5E4E06] mt-1 flex-shrink-0" />
                       <div>
                         <p className="font-bold text-gray-900 mb-3">Shipping Address</p>
                         <div className="text-gray-600 space-y-2">
                           <p className="font-medium">{orderDetails.shippingAddress.fullName || orderDetails.shippingAddress.customerName}</p>
                           {orderDetails.shippingAddress.customerEmail && (
                             <p className="text-sm">Email: {orderDetails.shippingAddress.customerEmail}</p>
                           )}
                           {orderDetails.shippingAddress.customerPhone && (
                             <p className="text-sm">Phone: {orderDetails.shippingAddress.customerPhone}</p>
                           )}
                           {orderDetails.shippingAddress.addressLine1 && (
                             <p>{orderDetails.shippingAddress.addressLine1}</p>
                           )}
                           {orderDetails.shippingAddress.street && (
                             <p>{orderDetails.shippingAddress.street}</p>
                           )}
                           {orderDetails.shippingAddress.addressLine2 && (
                             <p>{orderDetails.shippingAddress.addressLine2}</p>
                           )}
                           <p>
                             {orderDetails.shippingAddress.city && `${orderDetails.shippingAddress.city}, `}
                             {orderDetails.shippingAddress.state && `${orderDetails.shippingAddress.state} `}
                             {orderDetails.shippingAddress.pincode && orderDetails.shippingAddress.pincode}
                           </p>
                           {orderDetails.shippingAddress.country && (
                             <p>{orderDetails.shippingAddress.country}</p>
                           )}
                           {/* Fallback for old address format */}
                           {!orderDetails.shippingAddress.addressLine1 && orderDetails.shippingAddress.address && (
                             <p>{orderDetails.shippingAddress.address}</p>
                           )}
                           {!orderDetails.shippingAddress.customerPhone && orderDetails.shippingAddress.phone && (
                             <p className="text-sm">Phone: {orderDetails.shippingAddress.phone}</p>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                </div>
              </div>

              {/* Shipping Information Card */}
              <div className="bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-3xl border-2 border-[#E8E4D8] p-8">
                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <Truck className="w-6 h-6 text-[#5E4E06]" />
                  Shipping Information
                </h3>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#5E4E06] rounded-full mt-2 flex-shrink-0"></div>
                    <p>Shipping charges will be calculated separately and collected as cash on delivery</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#5E4E06] rounded-full mt-2 flex-shrink-0"></div>
                    <p>We negotiate with multiple transport companies to provide you the best rates</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-[#5E4E06] rounded-full mt-2 flex-shrink-0"></div>
                    <p>You will be informed of the exact shipping cost before delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-8">
                {/* Next Steps Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
                  <h2 className="text-2xl font-black text-gray-900 mb-8">What's Next?</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Order Processing</h4>
                        <p className="text-gray-600 text-sm">We'll process your order within 24 hours</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Shipping Calculation</h4>
                        <p className="text-gray-600 text-sm">We'll calculate shipping costs and inform you before delivery</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Delivery</h4>
                        <p className="text-gray-600 text-sm">Your order will be delivered within 7-10 days with shipping charges collected as cash on delivery</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
                  <div className="space-y-4">
                    <Link 
                      href="/dashboard/orders"
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                    >
                      <ShoppingBag className="w-6 h-6" />
                      View My Orders
                    </Link>
                    
                    <Link 
                      href="/"
                      className="w-full px-6 py-4 bg-white border-2 border-[#8B7A1A] text-[#5E4E06] font-bold rounded-2xl hover:bg-[#F8F6F0] transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                    >
                      <Home className="w-6 h-6" />
                      Continue Shopping
                    </Link>
                    
                    <Link 
                      href="/aura"
                      className="w-full px-6 py-4 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] border-2 border-[#E8E4D8] text-[#5E4E06] font-bold rounded-2xl hover:bg-[#E8E4D8] transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                    >
                      <ShoppingBag className="w-6 h-6" />
                      Shop More Products
                    </Link>
                  </div>
                </div>

                {/* Contact Support */}
                <div className="bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-3xl border-2 border-[#E8E4D8] p-8">
                  <h4 className="font-bold text-gray-900 mb-6 text-lg">Need Help?</h4>
                                     <div className="space-y-4">
                     <div className="flex items-center gap-3">
                       <Phone className="w-5 h-5 text-[#5E4E06]" />
                       <span className="text-gray-700 font-medium">+91 8171189456</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <Mail className="w-5 h-5 text-[#5E4E06]" />
                       <span className="text-gray-700 font-medium">contact@deserttomountains.com</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-12 text-center">Why Choose Desert to Mountains?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
              <Leaf className="w-16 h-16 text-[#5E4E06] mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">100% Natural</h3>
              <p className="text-gray-600">Pure, eco-friendly materials from nature's bounty</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
              <Shield className="w-16 h-16 text-[#5E4E06] mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Guaranteed</h3>
              <p className="text-gray-600">Premium materials with rigorous quality control</p>
            </div>
            <div className="text-center p-8 bg-white rounded-3xl shadow-lg border border-gray-100">
              <Heart className="w-16 h-16 text-[#5E4E06] mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Health First</h3>
              <p className="text-gray-600">Toxin-free solutions for healthier living spaces</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Transform Your Space Today!</h2>
          <p className="text-xl text-gray-100 mb-8">
            Join thousands of happy customers who have already experienced the natural beauty and health benefits of our products.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/aura" className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              Shop Aura Plaster
            </Link>
            <Link href="/contact" className="px-8 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-gray-900 transition-all duration-300">
              Get Consultation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F6F0] via-white to-[#F0EDE4]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#5E4E06] mx-auto mb-6"></div>
        <p className="text-[#5E4E06] font-semibold text-lg">Loading order details...</p>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderConfirmationContent />
    </Suspense>
  );
} 