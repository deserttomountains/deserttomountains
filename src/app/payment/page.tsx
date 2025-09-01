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
    icon: <CreditCard className="w-6 h-6 text-[#D4AF37]" />,
    accent: '#D4AF37',
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'Pay via UPI, Card, Netbanking, Wallets, EMI, and more.',
    icon: <CreditCard className="w-6 h-6 text-[#5E4E06]" />,
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
      // Check if we're in checkout flow
      const isCheckoutFlow = localStorage.getItem('checkoutFlow') === 'true';
      if (isCheckoutFlow) {
        router.replace('/login?redirect=/payment&checkout=true');
      } else {
        router.replace('/login?redirect=/payment');
      }
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
  const shipping = 0; // Shipping fee will be calculated and paid separately after order confirmation
  const total = subtotal + shipping; // 5% GST already included in product prices

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
        tax: 0, // 5% GST already included in product prices
        shipping: 0, // Shipping fee will be calculated separately after order confirmation
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
      const firebaseOrderId = await AuthService.createOrder(orderData);
      
      console.log('Order created in Firebase with ID:', firebaseOrderId);
      
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
            showToast('Payment successful! Verifying payment...', 'success');
            
            // Clear cart from localStorage and context
            localStorage.removeItem('cart');
            if (typeof clearCart === 'function') clearCart();
            
            // Store order details for confirmation page
            const orderDetails = {
              orderId: orderId,
              paymentMethod: 'Razorpay',
              transactionId: response.razorpay_payment_id,
              amount: total,
              items: cart
            };
            localStorage.setItem('orderConfirmationData', JSON.stringify(orderDetails));
            
            // Client-side fallback: Update order status immediately (webhook will also update)
            try {
              const updateData = {
                paymentStatus: 'completed' as const,
                status: 'confirmed' as const,
                transactionId: response.razorpay_payment_id,
                paymentMode: 'razorpay',
                paymentMessage: 'Payment captured successfully',
                paymentTime: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                // Set estimated delivery to 10 days from payment completion
                estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
              };

              // Update the order using AuthService (client-side with auth context)
              await AuthService.updateOrder(firebaseOrderId, updateData);
              console.log('Order updated successfully on client side (fallback)');
            } catch (error) {
              console.error('Error updating order on client side (fallback):', error);
              // Don't show error to user - webhook will handle it
            }
            
            // Clear checkout flow flag and redirect to order confirmation
            localStorage.removeItem('checkoutFlow');
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
        console.log('Cashfree order response:', cashfreeOrder);
        
        if (!cashfreeOrder.paymentSessionId) {
          console.error('Cashfree order creation failed:', cashfreeOrder);
          
          // Check if it's a configuration issue
          if (cashfreeOrder.error?.includes('payment_session_id') || cashfreeOrder.code === 'payment_session_id_invalid') {
            throw new Error('Cashfree payment gateway is not properly configured. Please contact support or try Razorpay instead.');
          }
          
          throw new Error(cashfreeOrder.error || cashfreeOrder.message || 'Failed to create Cashfree order');
        }
        // 3. Load Cashfree Drop-in JS and open payment modal
        await loadCashfreeScript();
        // @ts-ignore
        const cf = window.Cashfree && window.Cashfree({ 
          mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'PROD' ? 'production' : 'sandbox' 
        });
        if (cf && typeof cf.checkout === 'function') {
          cf.checkout({
            paymentSessionId: cashfreeOrder.paymentSessionId,
            redirectTarget: '_self',
            onSuccess: async function(data: any) {
              showToast('Payment successful! Verifying payment...', 'success');
              localStorage.removeItem('cart');
              if (typeof clearCart === 'function') clearCart();
              
              // Store order details for confirmation page
              const orderDetails = {
                orderId: orderId,
                paymentMethod: 'Cashfree',
                transactionId: data.referenceId || 'CF' + Date.now(),
                amount: total,
                items: cart
              };
              localStorage.setItem('orderConfirmationData', JSON.stringify(orderDetails));
              
              // Client-side fallback: Update order status immediately (webhook will also update)
              try {
                const updateData = {
                  paymentStatus: 'completed' as const,
                  status: 'confirmed' as const,
                  transactionId: data.referenceId || 'CF' + Date.now(),
                  paymentMode: 'cashfree',
                  paymentMessage: 'Payment captured successfully',
                  paymentTime: new Date().toISOString(),
                  lastUpdated: new Date().toISOString(),
                };

                // Update the order using AuthService (client-side with auth context)
                await AuthService.updateOrder(firebaseOrderId, updateData);
                console.log('Order updated successfully on client side (fallback)');
              } catch (error) {
                console.error('Error updating order on client side (fallback):', error);
                // Don't show error to user - webhook will handle it
              }
              
              // Clear checkout flow flag and redirect to order confirmation
              localStorage.removeItem('checkoutFlow');
              setTimeout(() => router.push('/order-confirmation'), 1200);
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
      // Clear checkout flow flag and redirect to order confirmation
      localStorage.removeItem('checkoutFlow');
      setTimeout(() => router.push('/order-confirmation'), 1200);
    } catch (error: any) {
      showToast(error.message || 'Failed to create payment order. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F2E8] via-[#F8F6F0] to-[#E6DCC0] font-sans">
      <Navigation />

      {/* Simple Progress Bar */}
      <div className="w-full bg-white/90 backdrop-blur-sm border-b border-[#D4AF37] py-3 px-4 md:px-0 flex items-center justify-center gap-4 md:gap-8 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2 text-sm md:text-base">
          <span className="font-semibold text-[#8B7A1A] flex items-center gap-1"><ShoppingCart className="w-4 h-4 md:w-5 md:h-5" /> Cart</span>
          <span className="w-6 md:w-8 h-1 bg-[#8B7A1A] rounded-full mx-1 md:mx-2" />
          <span className="font-semibold text-[#8B7A1A]">Address</span>
          <span className="w-6 md:w-8 h-1 bg-[#8B7A1A] rounded-full mx-1 md:mx-2" />
          <span className="font-bold text-[#5E4E06] flex items-center gap-1"><CreditCard className="w-4 h-4 md:w-5 md:h-5" /> Payment</span>
        </div>
        <button 
          onClick={() => router.push('/address')} 
          className="flex items-center gap-2 text-[#5E4E06] font-semibold hover:text-[#3D3204] transition-colors cursor-pointer text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Address
        </button>
      </div>

      <main className="flex-1 py-8 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          {/* Simple Header */}
          <div className="text-center mb-8 pt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5E4E06] mb-2">
              Complete Payment
            </h1>
            <p className="text-[#8B7A1A] text-base">
              Choose your preferred payment method to complete your order
            </p>
          </div>

          {/* Order Summary - Simple */}
          <div className="bg-white rounded-lg shadow-sm border border-[#D4AF37]/30 p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#5E4E06]" />
                <span className="font-semibold text-[#5E4E06]">Order Total</span>
              </div>
              <span className="text-xl font-bold text-[#5E4E06]">₹{total.toLocaleString()}</span>
            </div>
            <div className="text-sm text-[#8B7A1A] mt-2">
              <span>Shipping: Pending • GST: Included</span>
            </div>
          </div>

          {/* Payment Gateway Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-[#D4AF37]/30 p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#5E4E06] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#5E4E06]" />
              Choose Payment Method
            </h2>
            
            <div className="space-y-4 mb-6">
              {gateways.map((gateway) => (
                <button
                  type="button"
                  key={gateway.id}
                  onClick={() => setSelectedGateway(gateway.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-300 focus:outline-none text-left cursor-pointer ${
                    selectedGateway === gateway.id
                      ? 'border-[#D4AF37] bg-[#FFF8DC]'
                      : 'border-[#E5E5E5] bg-white hover:border-[#D4AF37]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{gateway.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#5E4E06] mb-1">{gateway.name}</h3>
                      <p className="text-[#8B7A1A] text-sm">{gateway.description}</p>
                    </div>
                    {selectedGateway === gateway.id && (
                      <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Action */}
            {selectedGateway && (
              <div className="border-t border-[#E5E5E5] pt-6">
                <div className="text-center mb-4">
                  <p className="text-[#8B7A1A] text-sm">
                    You will be redirected to {selectedGateway === 'cashfree' ? 'Cashfree' : 'Razorpay'}'s secure payment gateway.
                  </p>
                </div>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || cart.length === 0}
                  className={`w-full px-6 py-3 font-semibold rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center gap-2 text-base ${
                    isProcessing || cart.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#5E4E06] text-white hover:bg-[#8B7A1A] hover:shadow-md cursor-pointer'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Payment Order...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Pay ₹{total.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Simple Shipping Info */}
          <div className="bg-gradient-to-r from-[#FFF8DC] to-[#F0E68C] rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-[#5E4E06]" />
              <h3 className="font-semibold text-[#5E4E06]">Shipping Information</h3>
            </div>
            <div className="text-sm text-[#8B7A1A] space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5E4E06] mt-1.5 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-[#5E4E06]">Transport fee not included</span> - Will be collected separately via COD after order confirmation
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5E4E06] mt-1.5 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-[#5E4E06]">Best rates negotiated</span> - We contact multiple transport companies for optimal pricing
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5E4E06] mt-1.5 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-[#5E4E06]">Transparent pricing</span> - Exact cost informed before delivery
                </div>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-white rounded-lg shadow-sm border border-[#D4AF37]/30 p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-[#5E4E06]" />
              <h3 className="font-semibold text-[#5E4E06]">Secure Payment</h3>
            </div>
            <div className="text-sm text-[#8B7A1A] space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5E4E06]"></div>
                <span>SSL encrypted checkout</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5E4E06]"></div>
                <span>100% secure payment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#5E4E06]"></div>
                <span>PCI DSS compliant</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
} 