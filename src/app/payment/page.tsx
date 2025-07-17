"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  ShoppingCart, 
  CreditCard, 
  CheckCircle,
  Lock, 
  Shield, 
  ExternalLink,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import { AuthService } from '@/lib/firebase';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/lib/hooks/useAuth';

const gateways = [
  {
    id: 'cashfree',
    name: 'Cashfree',
    description: 'Pay securely via UPI, Card, Netbanking, EMI, and more.',
    icon: <CreditCard className="w-8 h-8 text-[#D4AF37]" />,
    accent: '#D4AF37',
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'Pay via UPI, Card, Netbanking, Wallets, EMI, and more.',
    icon: <CreditCard className="w-8 h-8 text-[#5E4E06]" />,
    accent: '#5E4E06',
  },
];

type CartItem = {
  id: string;
  name: string;
  type: string;
  price: number;
  quantity?: number;
  variant?: string;
  shades?: any[];
  totalQuantity?: number;
  packSize?: number;
  selectedColors?: string[];
};

// Utility to load Razorpay script
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (document.getElementById('razorpay-sdk')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject('Razorpay SDK failed to load');
    document.body.appendChild(script);
  });
}

// Utility to load Cashfree Drop-in JS
function loadCashfreeScript() {
  return new Promise((resolve, reject) => {
    if (document.getElementById('cashfree-dropin-js')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'cashfree-dropin-js';
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject('Cashfree SDK failed to load');
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();
  const { user, userProfile, loading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/payment');
      return;
    }
    const checkoutData = localStorage.getItem('checkoutData');
    if (!checkoutData) {
      router.replace('/address');
      return;
    }
    try {
      const parsed = JSON.parse(checkoutData);
      if (!parsed.shippingAddress || !parsed.shippingAddress.fullName) {
        router.replace('/address');
      }
    } catch {
      router.replace('/address');
    }
  }, [router, user, loading]);

  // Use cart from context for all calculations and rendering
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal > 2000 ? 0 : 199;
  const tax = Math.round((subtotal + shipping) * 0.18);
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!user || !user.uid) {
      showToast('You must be logged in to place an order.', 'error');
      router.replace('/login?redirect=/payment');
      return;
    }
    setIsProcessing(true);
    try {
      const checkoutData = JSON.parse(localStorage.getItem('checkoutData') || '{}');
      const orderId = `DTM${Date.now()}`;
      const orderData = {
        orderId,
        customerId: user.uid,
        customerName: checkoutData.shippingAddress?.name || user.displayName || 'Guest User',
        customerEmail: checkoutData.shippingAddress?.email || user.email || 'guest@example.com',
        customerPhone: checkoutData.shippingAddress?.phone || userProfile?.phone || '',
        items: cart.map(item => ({
          productId: String(item.id),
          productName: item.name,
          productType: 'aura' as 'aura', // Explicitly type as 'aura' to match OrderItem
          quantity: item.quantity || 1,
          unitPrice: item.price,
          totalPrice: (item.quantity || 1) * item.price,
          shades: item.shades?.map((s: any) => s.shadeName) || []
        })),
        totalAmount: subtotal,
        tax: subtotal * 0.18,
        shipping: subtotal > 2000 ? 0 : 200,
        finalAmount: total,
        status: 'pending' as const,
        paymentMethod: selectedGateway,
        paymentStatus: 'pending' as const,
        shippingAddress: checkoutData.shippingAddress || {},
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notes: `Payment method: ${selectedGateway}`
      };
      
      // 1. Save order in Firestore
      await AuthService.createOrder(orderData);
      
      if (selectedGateway === 'razorpay') {
        // 2. Create Razorpay order via API
        const res = await fetch('/api/payment/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total * 100, // Razorpay expects paise
            currency: 'INR',
            receipt: orderId,
            notes: {
              customerName: orderData.customerName,
              customerEmail: orderData.customerEmail,
              customerPhone: orderData.customerPhone
            }
          })
        });
        const razorpayOrder = await res.json();
        if (!razorpayOrder.id) throw new Error(razorpayOrder.error || 'Failed to create Razorpay order');

        // 3. Load Razorpay script
        await loadRazorpayScript();

        // 4. Open Razorpay Checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'Desert to Mountains',
          description: 'Order Payment',
          image: '/desert-to-mountains-logo.webp',
          order_id: razorpayOrder.id,
          handler: async function (response: any) {
            // Payment success
            showToast('Payment successful! Updating order...', 'success');
            // Optionally, call backend to verify payment and update order status
            await fetch('/api/payment/razorpay/webhook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: razorpayOrder.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                status: 'captured'
              })
            });
            setTimeout(() => router.push('/order-confirmation'), 1200);
          },
          prefill: {
            name: orderData.customerName,
            email: orderData.customerEmail,
            contact: orderData.customerPhone
          },
          notes: razorpayOrder.notes,
          theme: {
            color: '#D4AF37'
          },
          modal: {
            ondismiss: function () {
              showToast('Payment cancelled.', 'error');
            }
          }
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
        setIsProcessing(false);
        return;
      }

      if (selectedGateway === 'cashfree') {
        // 2. Create Cashfree order via API
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const res = await fetch('/api/payment/cashfree/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderId,
        orderAmount: total,
        orderCurrency: 'INR',
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
            orderNote: orderData.notes,
            returnUrl: `${origin}/order-confirmation?orderId=${orderId}`,
            notifyUrl: `${origin}/api/payment/cashfree/webhook`
          })
        });
        const cashfreeOrder = await res.json();
        if (!cashfreeOrder.paymentSessionId) throw new Error(cashfreeOrder.error || 'Failed to create Cashfree order');
        // 3. Load Cashfree Drop-in JS and open payment modal
        await loadCashfreeScript();
        // @ts-ignore
        const cf = window.Cashfree && window.Cashfree({ mode: 'sandbox' });
        if (cf && typeof cf.checkout === 'function') {
          cf.checkout({
            paymentSessionId: cashfreeOrder.paymentSessionId,
            redirectTarget: '_self',
            onSuccess: function(data: any) {
              // Clear cart from localStorage and context
              localStorage.removeItem('cart');
              if (typeof clearCart === 'function') clearCart();
              showToast('Payment successful! Redirecting to your orders...', 'success');
              setTimeout(() => router.push('/dashboard/orders'), 1200);
            },
            onFailure: function(data: any) {
              showToast('Payment failed or cancelled.', 'error');
            },
            onError: function(error: any) {
              showToast('Payment error: ' + (error.message || 'Unknown error'), 'error');
            }
          });
        } else {
          showToast('Cashfree SDK not loaded. Please try again.', 'error');
        }
        setIsProcessing(false);
        return;
      }

      // Default: Other gateways or fallback
      showToast('Redirecting to payment gateway...', 'success');
      setTimeout(() => router.push('/order-confirmation'), 1200);
    } catch (error: any) {
      showToast(error.message || 'Failed to create payment order. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F2E8] via-[#F8F6F0] to-[#E6DCC0] font-sans relative overflow-hidden">


      <Navigation />
      
      {/* Progress Bar - Matching cart/address pages */}
      <div className="w-full bg-white/90 backdrop-blur-sm border-b border-[#D4AF37] py-4 px-2 md:px-0 flex items-center justify-center gap-4 md:gap-8 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2 text-sm md:text-base">
          <span className="font-semibold text-[#8B7A1A] flex items-center gap-1"><ShoppingCart className="w-4 h-4 md:w-5 md:h-5" /> Cart</span>
          <span className="w-6 md:w-8 h-1 bg-[#8B7A1A] rounded-full mx-1 md:mx-2" />
          <span className="font-semibold text-[#8B7A1A]">Address</span>
          <span className="w-6 md:w-8 h-1 bg-[#8B7A1A] rounded-full mx-1 md:mx-2" />
          <span className="font-bold text-[#5E4E06] flex items-center gap-1"><CreditCard className="w-4 h-4 md:w-5 md:h-5" /> Payment</span>
        </div>
        <button 
          onClick={() => router.push('/address')} 
          className="flex items-center gap-2 text-[#5E4E06] font-semibold hover:text-[#3D3204] transition-colors cursor-pointer text-base md:text-lg hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Address
        </button>
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="text-center mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 mb-6 shadow-xl">
                <CreditCard className="w-7 h-7 text-[#5E4E06]" />
                <span className="text-[#5E4E06] font-bold text-lg">Payment Information</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent mb-4">
                Complete Your Payment
              </h1>
              <p className="text-[#8B7A1A] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Choose your preferred payment gateway and complete your order securely. Your payment is encrypted and protected.
            </p>
          </div>

            {/* Payment Gateway Selection */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 md:p-10 animate-fade-in">
              <h2 className="text-2xl font-bold text-[#5E4E06] mb-6 flex items-center gap-3">
                <CreditCard className="w-7 h-7 text-[#D4AF37]" />
                Choose Payment Gateway
                </h2>
                
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {gateways.map((gateway) => (
                  <button
                    type="button"
                    key={gateway.id}
                    onClick={() => setSelectedGateway(gateway.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-300 focus:outline-none text-left ${
                      selectedGateway === gateway.id
                        ? 'border-[#D4AF37] bg-gradient-to-br from-[#FFFBEA] to-[#F9F6ED] shadow-lg'
                        : 'border-[#E5E5E5] bg-white hover:border-[#D4AF37]/50 hover:shadow-md'
                    }`}
                  >
                      <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">{gateway.icon}</div>
                        <div className="flex-1">
                        <h3 className="font-bold text-lg text-[#5E4E06] mb-1">{gateway.name}</h3>
                        <p className="text-[#8B7A1A] text-sm">{gateway.description}</p>
                      </div>
                      {selectedGateway === gateway.id && (
                        <CheckCircle className="w-6 h-6 text-[#D4AF37] flex-shrink-0" />
                      )}
                    </div>
                  </button>
                  ))}
              </div>

              {/* Payment Action */}
              {selectedGateway && (
                <div className="border-t border-[#E5E5E5] pt-8 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-[#5E4E06] mb-2">
                      Pay with {selectedGateway === 'cashfree' ? 'Cashfree' : 'Razorpay'}
                  </h3>
                    <p className="text-[#8B7A1A] text-base">
                      You will be redirected to {selectedGateway === 'cashfree' ? 'Cashfree' : 'Razorpay'}'s secure payment gateway to complete your payment.
                    </p>
                  </div>
                  
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || cart.length === 0}
                    className={`w-full px-8 py-4 font-bold rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3 text-lg ${
                      isProcessing || cart.length === 0
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white hover:shadow-xl hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Creating Payment Order...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-6 h-6" />
                        Proceed to Payment - ₹{total.toLocaleString()}
                      </>
                    )}
                  </button>
                      </div>
              )}
                    </div>
                    
            {/* Security Info */}
            <div className="bg-gradient-to-br from-white/95 to-[#F8F6F0]/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 mt-8 animate-fade-in">
              <h3 className="text-xl font-bold text-[#5E4E06] mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6" />
                Secure Checkout
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#8B7A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#5E4E06]"></div>
                    <span className="text-base">SSL encrypted</span>
                      </div>
                  <div className="flex items-center gap-3 text-[#8B7A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#5E4E06]"></div>
                    <span className="text-base">100% secure payment</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#8B7A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#5E4E06]"></div>
                    <span className="text-base">Data protection</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#8B7A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#5E4E06]"></div>
                    <span className="text-base">PCI compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0 lg:sticky lg:top-32 h-fit">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 animate-fade-in">
              <h2 className="text-xl font-bold text-[#5E4E06] mb-6 flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-[#D4AF37]" />
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#FFFBEA] to-[#F9F6ED] rounded-xl">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to a colored div if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center hidden">
                        <span className="text-white font-bold text-lg">
                          {item.name.includes('Aura') ? 'A' : 'D'}
                        </span>
                      </div>
                      </div>
                      <div className="flex-1">
                      <h4 className="font-semibold text-[#5E4E06] text-base">{item.name}</h4>
                      <p className="text-[#8B7A1A] text-xs">
                        {item.subtitle || 'Natural product'}
                        </p>
                      </div>
                      <div className="text-right">
                      <p className="font-bold text-[#D4AF37]">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
              <div className="space-y-3 border-t border-[#E5E5E5] pt-4">
                <div className="flex justify-between text-[#8B7A1A]">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                <div className="flex justify-between text-[#8B7A1A]">
                    <span>Shipping</span>
                    <span className="font-semibold">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                <div className="flex justify-between text-[#8B7A1A]">
                    <span>Tax (18% GST)</span>
                    <span className="font-semibold">₹{tax.toLocaleString()}</span>
                  </div>
                <div className="border-t border-[#E5E5E5] pt-3">
                    <div className="flex justify-between">
                    <span className="text-lg font-bold text-[#5E4E06]">Total</span>
                    <span className="text-lg font-bold text-[#D4AF37]">₹{total.toLocaleString()}</span>
                  </div>
                </div>
                </div>

                {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-[#E5E5E5]">
                <span className="flex items-center gap-2 text-[#8B7A1A] text-sm font-semibold">
                  <Shield className="w-4 h-4" /> Secure
                    </span>
                <span className="flex items-center gap-2 text-[#8B7A1A] text-sm font-semibold">
                  <Lock className="w-4 h-4" /> Encrypted
                    </span>
                <span className="flex items-center gap-2 text-[#8B7A1A] text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" /> PCI DSS
                    </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
} 