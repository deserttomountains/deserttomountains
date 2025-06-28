"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { CheckCircle, Package, Truck, Clock, MapPin, Phone, Mail, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface OrderDetails {
  orderId: string;
  orderDate: string;
  estimatedDelivery: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: any;
  items: any[];
}

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get order details from localStorage or URL params
    const orderId = searchParams.get('orderId') || generateOrderId();
    const checkoutData = localStorage.getItem('checkoutData');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (checkoutData && cart.length > 0) {
      const parsedCheckoutData = JSON.parse(checkoutData);
      const totalAmount = cart.reduce((sum: number, item: any) => sum + item.price, 0);
      const tax = totalAmount * 0.18;
      const shipping = totalAmount > 2000 ? 0 : 200;
      const finalTotal = totalAmount + tax + shipping;

      setOrderDetails({
        orderId,
        orderDate: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        totalAmount: finalTotal,
        paymentMethod: searchParams.get('paymentMethod') || 'Online Payment',
        shippingAddress: parsedCheckoutData.shippingAddress,
        items: cart
      });

      // Clear cart and checkout data after successful order
      localStorage.removeItem('cart');
      localStorage.removeItem('checkoutData');
    } else {
      // If no order data, redirect to home
      router.push('/');
    }
    
    setIsLoading(false);
  }, [searchParams, router]);

  const generateOrderId = () => {
    return 'DTM' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-100 via-white to-orange-100">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-amber-700 font-semibold">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-100 via-white to-orange-100">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-amber-700 font-semibold">Order not found</p>
            <Link href="/" className="text-amber-600 hover:underline">Return to home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-100 via-white to-orange-100 font-sans">
      <Navigation />
      
      <main className="flex-1 flex flex-col items-center py-12 px-4 md:px-0">
        <div className="w-full max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-amber-900 mb-4">
              Order Confirmed!
            </h1>
            <p className="text-xl text-amber-600 mb-2">
              Thank you for your order. We're excited to bring natural beauty to your space.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
              <span>Order ID: {orderDetails.orderId}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <div className="bg-white/90 rounded-3xl shadow-2xl border border-amber-200 p-8">
                <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  Order Summary
                </h2>
                
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
                      <div className="w-12 h-12 bg-amber-200 rounded-lg flex items-center justify-center">
                        <span className="text-amber-700 font-bold text-sm">
                          {item.type === 'wallputty' ? 'WP' : 'SP'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-gray-600 text-sm">
                          {item.type === 'wallputty' && item.variant === 'pigmented' && item.shades
                            ? `${item.totalQuantity} × 25kg`
                            : item.type === 'sample'
                            ? `${item.packSize} colors`
                            : '25kg pack'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-700">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-amber-200">
                  <div className="flex justify-between text-lg font-bold text-amber-900">
                    <span>Total Amount</span>
                    <span>₹{orderDetails.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white/90 rounded-3xl shadow-2xl border border-amber-200 p-8">
                <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
                  <Truck className="w-6 h-6" />
                  Delivery Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Order Date</p>
                        <p className="text-gray-600">{orderDetails.orderDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Estimated Delivery</p>
                        <p className="text-gray-600">{orderDetails.estimatedDelivery}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Payment Method</p>
                        <p className="text-gray-600">{orderDetails.paymentMethod}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-amber-600 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Shipping Address</p>
                        <div className="text-gray-600 text-sm space-y-1">
                          <p>{orderDetails.shippingAddress.fullName}</p>
                          <p>{orderDetails.shippingAddress.address}</p>
                          <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.pincode}</p>
                          <p>Phone: {orderDetails.shippingAddress.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 rounded-3xl shadow-2xl border border-amber-200 p-8 sticky top-32">
                <h2 className="text-2xl font-bold text-amber-900 mb-6">What's Next?</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-amber-700 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Order Processing</h4>
                      <p className="text-gray-600 text-sm">We'll process your order within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-amber-700 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Shipping Confirmation</h4>
                      <p className="text-gray-600 text-sm">You'll receive tracking details via email</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-amber-700 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Delivery</h4>
                      <p className="text-gray-600 text-sm">Your order will be delivered within 5-7 days</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <Link 
                    href="/"
                    className="w-full px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Continue Shopping
                  </Link>
                  
                  <Link 
                    href="/aura"
                    className="w-full px-6 py-3 bg-white border-2 border-amber-300 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Shop More Products
                  </Link>
                </div>

                {/* Contact Support */}
                <div className="mt-8 p-4 bg-amber-50 rounded-xl">
                  <h4 className="font-semibold text-amber-900 mb-3">Need Help?</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-amber-600" />
                      <span className="text-gray-700">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-amber-600" />
                      <span className="text-gray-700">support@deserttomountains.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-100 via-white to-orange-100">
      <Navigation />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700 font-semibold">Loading order details...</p>
        </div>
      </main>
      <Footer />
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