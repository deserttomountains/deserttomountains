"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import UniversalAddressForm from '@/components/UniversalAddressForm';
import { ShoppingCart, MapPin, CreditCard, ArrowLeft, ArrowRight, CheckCircle, Home, User, Phone, Mail, Map, Building, Hash, Navigation as NavigationIcon, Shield, Truck, Package, Clock, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import addressService from '@/services/addressService';

export default function AddressPage() {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    addressLine1: '',
    addressLine2: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    addressLine1: '',
    addressLine2: ''
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  // Form validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleShippingChange = (field: string, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (sameAsShipping) {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBillingChange = (field: string, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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

  const getCompletionPercentage = () => {
    const requiredFields = [
      'fullName',
      'phone',
      'email',
      'country',
      'state',
      'city',
      'postalCode',
      'addressLine1'
    ];
    const shippingFilled = requiredFields.filter(field => (shippingAddress[field as keyof typeof shippingAddress] || '').trim()).length;
    const billingFilled = sameAsShipping ? requiredFields.length : requiredFields.filter(field => (billingAddress[field as keyof typeof billingAddress] || '').trim()).length;
    return Math.round(((shippingFilled + billingFilled) / (requiredFields.length * 2)) * 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F2E8] via-[#F8F6F0] to-[#E6DCC0] font-sans relative overflow-hidden">
      {/* Enhanced Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-[#D4AF37]/15 to-[#8B7A1A]/15 rounded-full blur-2xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-[#E6C866]/20 to-[#B8A94A]/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-br from-[#F5F2E8]/30 to-[#E6DCC0]/30 rounded-full blur-lg animate-float-slow"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-to-br from-[#D4AF37]/20 to-[#8B7A1A]/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-[#E6C866]/25 to-[#B8A94A]/25 rounded-full blur-md animate-float-slow"></div>
      </div>

      <Navigation />
      
      {/* Enhanced Progress Bar */}
      <div className="w-full bg-white/95 backdrop-blur-sm border-b border-[#D4AF37] py-8 px-4 md:px-0 sticky top-0 z-20 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6 md:gap-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5E4E06] text-white flex items-center justify-center text-sm font-bold shadow-lg">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="font-semibold text-[#8B7A1A] text-base md:text-lg">Cart</span>
              </div>
              <div className="w-12 md:w-20 h-1.5 bg-[#8B7A1A] rounded-full shadow-sm"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5E4E06] text-white flex items-center justify-center text-sm font-bold shadow-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-bold text-[#5E4E06] text-base md:text-lg">Address</span>
              </div>
              <div className="w-12 md:w-20 h-1.5 bg-[#8B7A1A] rounded-full shadow-sm"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8B7A1A] text-white flex items-center justify-center text-sm font-bold shadow-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="font-semibold text-[#8B7A1A] text-base md:text-lg">Payment</span>
              </div>
            </div>
            <button 
              onClick={() => router.push('/cart')} 
              className="flex items-center gap-2 text-[#5E4E06] font-semibold hover:text-[#3D3204] transition-colors cursor-pointer text-base md:text-lg hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Cart
            </button>
          </div>
          
          {/* Enhanced Progress Indicator */}
          <div className="w-full bg-[#F5F2E8] rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] h-3 rounded-full transition-all duration-700 shadow-lg"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-[#8B7A1A] font-medium">
              {getCompletionPercentage()}% Complete
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5E4E06] animate-pulse"></div>
              <span className="text-sm text-[#8B7A1A] font-medium">Step 2 of 3</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 py-12 px-4 md:px-0 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 mb-6 shadow-xl">
              <MapPin className="w-7 h-7 text-[#5E4E06]" />
              <span className="text-[#5E4E06] font-bold text-lg">Delivery Information</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent mb-4">
              Where should we deliver?
            </h1>
            <p className="text-[#8B7A1A] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Help us deliver your natural wall plaster to the right place. We'll use this information for both shipping and billing.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Form Section */}
            <div className="xl:col-span-3 space-y-8">
              {/* Shipping Address Form */}
              <UniversalAddressForm
                address={shippingAddress}
                onChange={handleShippingChange}
                title="Shipping Address"
                subtitle="Where should we deliver your order?"
                required={true}
                errors={errors}
              />

              {/* Enhanced Billing Address Section */}
              <div className="bg-gradient-to-br from-white/95 to-[#F8F6F0]/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 md:p-10 animate-fade-in relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-[#D4AF37]/10 to-[#8B7A1A]/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-[#E6C866]/15 to-[#B8A94A]/15 rounded-full blur-lg"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] flex items-center justify-center shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#8B7A1A]/20 to-transparent"></div>
                        <CreditCard className="w-8 h-8 text-white relative z-10" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent">
                          Billing Address
                        </h2>
                        <p className="text-[#8B7A1A] text-lg font-medium">Where should we send your invoice?</p>
                      </div>
                    </div>
                    
                    {/* Enhanced Same as Shipping Toggle */}
                    <label className="flex items-center gap-4 text-base font-semibold text-[#8B7A1A] cursor-pointer bg-gradient-to-r from-[#F5F2E8] to-[#E6DCC0] rounded-2xl px-6 py-4 hover:from-[#E6DCC0] hover:to-[#D4AF37]/20 transition-all duration-300 group shadow-lg hover:shadow-xl border border-[#D4AF37]/30">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={sameAsShipping}
                          onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          sameAsShipping 
                            ? 'bg-[#5E4E06] border-[#5E4E06] shadow-lg' 
                            : 'bg-white border-[#D4AF37] group-hover:border-[#8B7A1A]'
                        }`}>
                          {sameAsShipping && (
                            <CheckCircle className="w-4 h-4 text-white animate-pulse" />
                          )}
                        </div>
                      </div>
                      <span className="font-semibold">Same as shipping address</span>
                    </label>
                  </div>

                  {/* Conditional Content */}
                  {!sameAsShipping ? (
                    <div className="animate-fade-in">
                      <UniversalAddressForm
                        address={billingAddress}
                        onChange={handleBillingChange}
                        title="Billing Address"
                        subtitle="Where should we send your invoice?"
                        required={true}
                        errors={errors}
                        showTitle={false}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-16 animate-fade-in">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-green-200">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent mb-3">
                        Billing Address Confirmed
                      </h3>
                      <p className="text-[#8B7A1A] text-lg font-medium max-w-md mx-auto">
                        Your billing address will be the same as your shipping address for a seamless checkout experience.
                      </p>
                      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#8B7A1A]/70">
                        <div className="w-2 h-2 bg-[#5E4E06] rounded-full"></div>
                        <span>Secure and convenient</span>
                        <div className="w-2 h-2 bg-[#5E4E06] rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-8">
              {/* Order Summary */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 animate-fade-in">
                <h3 className="text-xl font-bold text-[#5E4E06] mb-6 flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6" />
                  Order Summary
                </h3>
                
                <div className="space-y-4 text-base">
                  <div className="flex justify-between items-center py-3 border-b border-[#D4AF37]/30">
                    <span className="text-[#8B7A1A]">Items (2)</span>
                    <span className="font-bold text-[#5E4E06]">₹3,199</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#D4AF37]/30">
                    <span className="text-[#8B7A1A]">Shipping</span>
                    <span className="font-bold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#D4AF37]/30">
                    <span className="text-[#8B7A1A]">Tax (18%)</span>
                    <span className="font-bold text-[#5E4E06]">₹576</span>
                  </div>
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#5E4E06] text-lg">Total</span>
                      <span className="font-bold text-[#5E4E06] text-xl">₹3,775</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 animate-fade-in">
                <h3 className="text-xl font-bold text-[#5E4E06] mb-6 flex items-center gap-3">
                  <Truck className="w-6 h-6" />
                  Delivery Info
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#8B7A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#5E4E06]"></div>
                    <span className="text-base">Free shipping over ₹2,000</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#8B7A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#5E4E06]"></div>
                    <span className="text-base">3-5 business days</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#8B7A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#5E4E06]"></div>
                    <span className="text-base">Eco-friendly packaging</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#8B7A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#5E4E06]"></div>
                    <span className="text-base">Real-time tracking</span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 animate-fade-in">
                <h3 className="text-xl font-bold text-[#5E4E06] mb-6 flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  Secure Checkout
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[#8B7A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#5E4E06]"></div>
                    <span className="text-base">SSL encrypted</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#8B7A1A]">
                    <div className="w-3 h-3 rounded-full bg-[#5E4E06]"></div>
                    <span className="text-base">100% secure payment</span>
                  </div>
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

              {/* Trust Badges */}
              <div className="bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl shadow-2xl p-8 animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Star className="w-6 h-6" />
                  Why Choose Us?
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-white/90">
                    <Package className="w-5 h-5" />
                    <span className="text-base">Premium Quality Products</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <Clock className="w-5 h-5" />
                    <span className="text-base">Fast & Reliable Delivery</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/90">
                    <Shield className="w-5 h-5" />
                    <span className="text-base">100% Satisfaction Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Continue Button */}
          <div className="mt-12 flex justify-center animate-fade-in">
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className={`group px-12 md:px-16 py-5 md:py-6 font-bold rounded-2xl shadow-2xl transition-all duration-500 flex items-center gap-3 text-lg md:text-xl cursor-pointer relative overflow-hidden ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white hover:shadow-2xl hover:scale-105 hover:from-[#8B7A1A] hover:to-[#B8A94A]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span className="relative z-10">Continue to Payment</span>
                  <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B7A1A] to-[#B8A94A] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(90deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F5F2E8;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #D4AF37;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8B7A1A;
        }
      `}</style>
    </div>
  );
} 