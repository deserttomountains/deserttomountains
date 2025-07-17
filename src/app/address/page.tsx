"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import UniversalAddressForm from '@/components/UniversalAddressForm';
import { ShoppingCart, MapPin, CreditCard, ArrowLeft, ArrowRight, CheckCircle, Home, User, Phone, Mail, Map, Building, Hash, Navigation as NavigationIcon, Shield, Truck, Package, Clock, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import addressService from '@/services/addressService';
import { useToast } from '@/components/ToastContext';
import { AuthService } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useCart } from '@/components/CartContext';

export default function AddressPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, userProfile, loading } = useAuth();
  const emptyAddress = {
    fullName: '',
    phone: '',
    email: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    addressLine1: '',
    addressLine2: ''
  };
  const [shippingAddress, setShippingAddress] = useState(emptyAddress);
  const [billingAddress, setBillingAddress] = useState(emptyAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [saveAddress, setSaveAddress] = useState(true);
  
  // Form validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Require login and prefill address from profile
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?redirect=/address');
      return;
    }
    if (userProfile && userProfile.address) {
      // Map Firestore address fields to local form fields
      const profileAddr = userProfile.address;
      const safeAddress = {
        fullName: userProfile.firstName && userProfile.lastName ? `${userProfile.firstName} ${userProfile.lastName}` : userProfile.firstName || userProfile.lastName || '',
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        country: profileAddr.country || '',
        state: profileAddr.state || '',
        city: profileAddr.city || '',
        postalCode: profileAddr.pincode || '',
        addressLine1: profileAddr.street || '',
        addressLine2: profileAddr.addressLine2 || '',
      };
      setShippingAddress(safeAddress);
      setBillingAddress(safeAddress);
    }
  }, [user, userProfile, loading, router]);

  const { cart } = useCart();

  // Calculate order summary
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = '--'; // Placeholder, will be calculated after address
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + (typeof shipping === 'number' ? shipping : 0) + tax;

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
      // Require login before proceeding
      if (!user) {
        showToast('Please login to continue checkout.', 'error');
        router.push('/login?redirect=/address');
        return;
      }
      // Validate required fields
      // Map required fields to actual state keys
      const requiredFields = ['fullName', 'phone', 'email', 'addressLine1', 'city', 'state', 'postalCode'];
      const shippingValid = requiredFields.every(field => (shippingAddress[field as keyof typeof shippingAddress] || '').trim());
      const billingValid = sameAsShipping || requiredFields.every(field => (billingAddress[field as keyof typeof billingAddress] || '').trim());
      if (!shippingValid || !billingValid) {
        alert('Please fill in all required fields');
        return;
      }
      // Save address to profile if checked
      if (saveAddress) {
        await AuthService.saveUserAddress(user.uid, shippingAddress);
      }
      // Store addresses in localStorage
      const checkoutData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        sameAsShipping
      };
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      showToast('Address saved!', 'success');
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
      <Navigation />


      <main className="flex-1 py-12 px-4 md:px-0 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="text-center mb-12 animate-fade-in pt-32 md:pt-36">
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
              <div className="flex items-center gap-3 mt-4">
                <input
                  type="checkbox"
                  id="saveAddress"
                  checked={saveAddress}
                  onChange={e => setSaveAddress(e.target.checked)}
                  className="w-5 h-5 accent-[#D4AF37] border-2 border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#8B7A1A] transition-all duration-200 shadow-sm"
                  style={{ minWidth: 20, minHeight: 20 }}
                />
                <label htmlFor="saveAddress" className="text-[#5E4E06] text-base font-semibold cursor-pointer select-none">
                  Save this address for future orders
                </label>
              </div>

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
                  {cart.length === 0 ? (
                    <div className="text-[#8B7A1A] text-center py-8">Your cart is empty.</div>
                  ) : (
                    <>
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-[#D4AF37]/20">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-[#D4AF37]" />
                            <div>
                              <div className="font-semibold text-[#5E4E06] text-sm">{item.name}</div>
                              <div className="text-xs text-[#8B7A1A]">{item.subtitle}</div>
                              {item.quantity && <div className="text-xs text-[#8B7A1A]">Qty: {item.quantity}</div>}
                            </div>
                          </div>
                          <div className="font-bold text-[#5E4E06]">₹{(item.price * (item.quantity || 1)).toLocaleString()}</div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-3 border-b border-[#D4AF37]/30 mt-2">
                        <span className="text-[#8B7A1A]">Subtotal</span>
                        <span className="font-bold text-[#5E4E06]">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-[#D4AF37]/30">
                        <span className="text-[#8B7A1A]">Shipping</span>
                        <span className="font-bold text-[#5E4E06]">{shipping}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-[#D4AF37]/30">
                        <span className="text-[#8B7A1A]">Tax (18%)</span>
                        <span className="font-bold text-[#5E4E06]">₹{tax.toLocaleString()}</span>
                      </div>
                      <div className="pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#5E4E06] text-lg">Total</span>
                          <span className="font-bold text-[#5E4E06] text-xl">₹{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </>
                  )}
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
                    <span className="text-base">5-7 business days</span>
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
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4,0,0.2,1);
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