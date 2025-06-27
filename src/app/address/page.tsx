"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ShoppingCart, MapPin, CreditCard, ArrowLeft, ArrowRight, CheckCircle, Home } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddressPage() {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShippingChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (sameAsShipping) {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBillingChange = (field: string, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked);
    if (checked) {
      setBillingAddress(shippingAddress);
    }
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'state', 'pincode'];
      const shippingValid = requiredFields.every(field => shippingAddress[field as keyof typeof shippingAddress].trim());
      const billingValid = sameAsShipping || requiredFields.every(field => billingAddress[field as keyof typeof billingAddress].trim());
      
      if (!shippingValid || !billingValid) {
        alert('Please fill in all required fields');
        return;
      }

      // Store addresses in localStorage
      const checkoutData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        sameAsShipping
      };
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      // Navigate to payment page
      router.push('/payment');
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsSubmitting(false);
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
          <span className="font-bold text-amber-700 flex items-center gap-1"><MapPin className="w-5 h-5" /> Address</span>
          <span className="w-8 h-1 bg-amber-200 rounded-full mx-2" />
          <span className="font-semibold text-amber-400">Payment</span>
        </div>
        <button 
          onClick={() => router.push('/cart')} 
          className="ml-auto text-amber-500 font-semibold hover:underline hidden md:inline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>
      </div>

      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-0">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-amber-900 mb-2">Shipping & Billing Address</h1>
            <p className="text-amber-600 text-lg">Please provide your delivery and billing information</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Address */}
            <div className="bg-white/90 rounded-3xl shadow-2xl border border-amber-200 p-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-2">
                <Home className="w-6 h-6" />
                Shipping Address
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleShippingChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleShippingChange('phone', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) => handleShippingChange('email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Address *</label>
                  <textarea
                    value={shippingAddress.address}
                    onChange={(e) => handleShippingChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition resize-none placeholder:text-amber-600 placeholder:font-medium"
                    placeholder="Enter your complete address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleShippingChange('city', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">State *</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleShippingChange('state', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => handleShippingChange('pincode', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                      placeholder="Pincode"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-amber-700 mb-2">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={shippingAddress.landmark}
                    onChange={(e) => handleShippingChange('landmark', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white/90 rounded-3xl shadow-2xl border border-amber-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Billing Address
                </h2>
                <label className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                    className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                  />
                  Same as shipping
                </label>
              </div>

              {!sameAsShipping && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={billingAddress.fullName}
                        onChange={(e) => handleBillingChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={billingAddress.phone}
                        onChange={(e) => handleBillingChange('phone', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={billingAddress.email}
                      onChange={(e) => handleBillingChange('email', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">Address *</label>
                    <textarea
                      value={billingAddress.address}
                      onChange={(e) => handleBillingChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition resize-none placeholder:text-amber-600 placeholder:font-medium"
                      placeholder="Enter your complete address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={billingAddress.city}
                        onChange={(e) => handleBillingChange('city', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">State *</label>
                      <input
                        type="text"
                        value={billingAddress.state}
                        onChange={(e) => handleBillingChange('state', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-amber-700 mb-2">Pincode *</label>
                      <input
                        type="text"
                        value={billingAddress.pincode}
                        onChange={(e) => handleBillingChange('pincode', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                        placeholder="Pincode"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-amber-700 mb-2">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={billingAddress.landmark}
                      onChange={(e) => handleBillingChange('landmark', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition placeholder:text-amber-600 placeholder:font-medium"
                      placeholder="Nearby landmark"
                    />
                  </div>
                </div>
              )}

              {sameAsShipping && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-amber-600 font-semibold">Billing address will be same as shipping address</p>
                </div>
              )}
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className={`px-12 py-4 font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 text-lg ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-xl hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  Continue to Payment
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 