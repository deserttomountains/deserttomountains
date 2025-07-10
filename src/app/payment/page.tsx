"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ShoppingCart, MapPin, CreditCard, ArrowLeft, Lock, Shield, CheckCircle, Smartphone, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

interface CartItem {
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
}

export default function PaymentPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  // Payment form states
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  useEffect(() => {
    // Load cart data from localStorage
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      setCart(JSON.parse(cartData));
    }
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const shipping = subtotal > 2000 ? 0 : 199;
  const tax = Math.round((subtotal + shipping) * 0.18);
  const total = subtotal + shipping + tax;

  const banks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank',
    'Union Bank of India',
    'Bank of India',
    'Central Bank of India'
  ];

  const paymentMethods = [
    {
      id: 'upi' as PaymentMethod,
      name: 'UPI',
      icon: Smartphone,
      description: 'Pay using UPI apps like Google Pay, PhonePe, Paytm',
      popular: true
    },
    {
      id: 'card' as PaymentMethod,
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Pay using Visa, MasterCard, RuPay cards',
      popular: false
    },
    {
      id: 'netbanking' as PaymentMethod,
      name: 'Net Banking',
      icon: Building2,
      description: 'Pay using your bank account',
      popular: false
    },
    {
      id: 'cod' as PaymentMethod,
      name: 'Cash on Delivery',
      icon: CreditCard,
      description: 'Pay when you receive your order',
      popular: false
    }
  ];

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Validate payment details based on selected method
      if (selectedPaymentMethod === 'card') {
        if (!cardDetails.cardNumber || !cardDetails.cardHolder || !cardDetails.expiry || !cardDetails.cvv) {
          alert('Please fill in all card details');
          setIsProcessing(false);
          return;
        }
      } else if (selectedPaymentMethod === 'upi') {
        if (!upiId) {
          alert('Please enter your UPI ID');
          setIsProcessing(false);
          return;
        }
      } else if (selectedPaymentMethod === 'netbanking') {
        if (!selectedBank) {
          alert('Please select your bank');
          setIsProcessing(false);
          return;
        }
      }
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order data
      const orderData = {
        orderId: `DTM${Date.now()}`,
        items: cart,
        total,
        paymentMethod: selectedPaymentMethod,
        paymentDetails: selectedPaymentMethod === 'card' ? cardDetails : 
                       selectedPaymentMethod === 'upi' ? { upiId } :
                       selectedPaymentMethod === 'netbanking' ? { bank: selectedBank } : {},
        timestamp: new Date().toISOString(),
        status: 'confirmed'
      };
      
      // Store order in localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      // Get payment method name for display
      const paymentMethodName = paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Online Payment';
      
      // Redirect to order confirmation with parameters
      router.push(`/order-confirmation?orderId=${orderData.orderId}&paymentMethod=${encodeURIComponent(paymentMethodName)}`);
      
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-100 via-white to-orange-100 font-sans">
      <Navigation />
      
      {/* Progress Bar */}
      <div className="w-full bg-white/80 border-b border-amber-100 py-4 px-2 md:px-0 flex items-center justify-center gap-8 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400 flex items-center gap-1"><ShoppingCart className="w-5 h-5" /> Cart</span>
          <span className="w-8 h-1 bg-amber-200 rounded-full mx-2" />
          <span className="font-semibold text-amber-400 flex items-center gap-1"><MapPin className="w-5 h-5" /> Address</span>
          <span className="w-8 h-1 bg-amber-200 rounded-full mx-2" />
          <span className="font-bold text-amber-700 flex items-center gap-1"><CreditCard className="w-5 h-5" /> Payment</span>
        </div>
        <button 
          onClick={() => router.push('/address')} 
          className="ml-auto text-amber-500 font-semibold hover:underline hidden md:inline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Address
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-0">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-amber-900 mb-2">Payment Method</h1>
            <p className="text-amber-600 text-lg">Choose your preferred payment option</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 rounded-3xl shadow-2xl border border-amber-200 p-8">
                <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Secure Payment Options
                </h2>
                
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedPaymentMethod === method.id
                          ? 'border-amber-500 bg-amber-50 shadow-lg'
                          : 'border-gray-200 hover:border-amber-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            selectedPaymentMethod === method.id
                              ? 'bg-amber-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <method.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-gray-900">{method.name}</h3>
                              {method.popular && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">{method.description}</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedPaymentMethod === method.id
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedPaymentMethod === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Form Fields */}
                {selectedPaymentMethod === 'card' && (
                  <div className="mt-8 p-6 bg-white rounded-2xl border border-amber-200">
                    <h3 className="text-xl font-bold text-amber-900 mb-4">Card Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-amber-700 mb-2">Card Number *</label>
                        <input
                          type="text"
                          value={cardDetails.cardNumber}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-amber-700 mb-2">Card Holder Name *</label>
                        <input
                          type="text"
                          value={cardDetails.cardHolder}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, cardHolder: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                          placeholder="JOHN DOE"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-amber-700 mb-2">Expiry Date *</label>
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-amber-700 mb-2">CVV *</label>
                          <input
                            type="text"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === 'upi' && (
                  <div className="mt-8 p-6 bg-white rounded-2xl border border-amber-200">
                    <h3 className="text-xl font-bold text-amber-900 mb-4">UPI Payment</h3>
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">UPI ID *</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                        placeholder="username@upi"
                      />
                      <p className="text-sm text-gray-600 mt-2">Enter your UPI ID (e.g., username@okicici, username@paytm)</p>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === 'netbanking' && (
                  <div className="mt-8 p-6 bg-white rounded-2xl border border-amber-200">
                    <h3 className="text-xl font-bold text-amber-900 mb-4">Net Banking</h3>
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">Select Bank *</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition text-amber-900 font-medium"
                      >
                        <option value="" className="text-amber-600 font-medium bg-white">Choose your bank</option>
                        {banks.map((bank) => (
                          <option key={bank} value={bank} className="text-amber-900 font-medium bg-white hover:bg-amber-50">{bank}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === 'cod' && (
                  <div className="mt-8 p-6 bg-white rounded-2xl border border-amber-200">
                    <h3 className="text-xl font-bold text-amber-900 mb-4">Cash on Delivery</h3>
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-amber-900">Pay when you receive</p>
                        <p className="text-sm text-amber-600">You can pay with cash or card when your order is delivered</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-800">Secure Payment</h4>
                      <p className="text-green-700 text-sm">Your payment information is encrypted and secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/90 rounded-3xl shadow-2xl border border-amber-200 p-8 sticky top-32">
                <h2 className="text-2xl font-bold text-amber-900 mb-6">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                      <div className="w-12 h-12 bg-amber-200 rounded-lg flex items-center justify-center">
                        <span className="text-amber-700 font-bold text-sm">
                          {item.type === 'wallputty' ? 'WP' : 'SP'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-gray-600 text-xs">
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

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-amber-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-semibold">₹{tax}</span>
                  </div>
                  <div className="border-t border-amber-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-amber-900">Total</span>
                      <span className="text-lg font-bold text-amber-700">₹{total}</span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || cart.length === 0}
                  className={`w-full mt-6 px-6 py-4 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    isProcessing || cart.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Place Order - ₹{total}
                    </>
                  )}
                </button>

                {/* Payment Method Info */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    You will be charged ₹{total} via {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                  </p>
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