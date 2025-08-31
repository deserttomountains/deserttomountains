"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  ShoppingCart, 
  Truck, 
  Shield, 
  Star, 
  Package, 
  Clock, 
  ArrowRight,
  Info,
  AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';
import { AuthService } from '@/lib/firebase';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/lib/hooks/useAuth';
import UniversalAddressForm from '@/components/UniversalAddressForm';

const emptyAddress = {
  fullName: '',
  phone: '',
  email: '',
  country: 'India',
  state: '',
  city: '',
  postalCode: '',
  addressLine1: '',
  addressLine2: '',
};

export default function AddressPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(emptyAddress);
  const [billingAddress, setBillingAddress] = useState(emptyAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [saveAddress, setSaveAddress] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Require login and prefill address from profile
  useEffect(() => {
    if (loading) return;
    if (!user) {
      // Check if we're in checkout flow
      const isCheckoutFlow = localStorage.getItem('checkoutFlow') === 'true';
      if (isCheckoutFlow) {
        router.replace('/login?redirect=/address&checkout=true');
      } else {
        router.replace('/login?redirect=/address');
      }
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
  const shipping = 0; // Shipping fee will be calculated separately after order confirmation
  const total = subtotal + shipping; // 5% GST already included in product prices

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
        try {
          await AuthService.saveUserAddress(user.uid, shippingAddress);
          showToast('Address and profile information saved successfully!', 'success');
        } catch (error) {
          console.error('Error saving address:', error);
          showToast('Failed to save address. Please try again.', 'error');
          return;
        }
      }
      // Store addresses in localStorage
      const checkoutData = {
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        sameAsShipping
      };
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      if (saveAddress) {
        showToast('Address and profile information saved successfully!', 'success');
      } else {
        showToast('Address saved!', 'success');
      }
      // Navigate to payment page
      router.push('/payment');
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCompletionPercentage = () => {
    const requiredFields = ['fullName', 'phone', 'email', 'addressLine1', 'city', 'state', 'postalCode'];
    const shippingFilled = requiredFields.filter(field => (shippingAddress[field as keyof typeof shippingAddress] || '').trim()).length;
    const billingFilled = sameAsShipping ? requiredFields.length : requiredFields.filter(field => (billingAddress[field as keyof typeof billingAddress] || '').trim()).length;
    return Math.round(((shippingFilled + billingFilled) / (requiredFields.length * 2)) * 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F2E8] via-[#F8F6F0] to-[#E6DCC0] font-sans">
      <Navigation />

      <main className="flex-1 py-8 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          {/* Simple Header */}
          <div className="text-center mb-8 pt-20">
            <h1 className="text-3xl md:text-4xl font-bold text-[#5E4E06] mb-2">
              Delivery Address
            </h1>
            <p className="text-[#8B7A1A] text-base">
              Where should we deliver your order?
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

          {/* Shipping Address Form */}
          <div className="bg-white rounded-lg shadow-sm border border-[#D4AF37]/30 p-6 mb-6">
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
                className="w-4 h-4 accent-[#D4AF37] border-2 border-[#D4AF37] rounded focus:ring-2 focus:ring-[#8B7A1A] transition-all duration-200"
              />
              <label htmlFor="saveAddress" className="text-[#5E4E06] text-sm font-medium cursor-pointer select-none">
                Save this address for future orders
              </label>
            </div>
          </div>

          {/* Billing Address Section */}
          <div className="bg-white rounded-lg shadow-sm border border-[#D4AF37]/30 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#5E4E06]" />
                <div>
                  <h2 className="text-lg font-semibold text-[#5E4E06]">Billing Address</h2>
                  <p className="text-[#8B7A1A] text-sm">Where should we send your invoice?</p>
                </div>
              </div>
              
              {/* Same as Shipping Toggle */}
              <label className="flex items-center gap-2 text-sm font-medium text-[#8B7A1A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                  className="w-4 h-4 accent-[#D4AF37] border-2 border-[#D4AF37] rounded focus:ring-2 focus:ring-[#8B7A1A] transition-all duration-200"
                />
                <span>Same as shipping address</span>
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
              <div className="text-center py-6 animate-fade-in">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-[#8B7A1A] text-sm">
                  Billing address will be the same as shipping address
                </p>
              </div>
            )}
          </div>

          {/* Simple Shipping Info */}
          <div className="bg-gradient-to-r from-[#FFF8DC] to-[#F0E68C] rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-[#5E4E06]" />
              <h3 className="font-semibold text-[#5E4E06]">Shipping Information</h3>
            </div>
            <div className="text-sm text-[#8B7A1A] space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-[#5E4E06]">Transport fee not included</span> - Will be collected separately via COD after order confirmation
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-[#5E4E06]">Delivery time</span> - 7-10 business days
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-[#5E4E06]">Best rates</span> - We negotiate with multiple transport companies for optimal pricing
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className={`px-8 py-3 font-semibold rounded-lg shadow-sm transition-all duration-300 flex items-center gap-2 text-base ${
                isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#5E4E06] text-white hover:bg-[#8B7A1A] hover:shadow-md'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
      
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