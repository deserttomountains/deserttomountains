"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ShoppingCart, Trash2, ArrowRight, CheckCircle, Lock, Truck, Shield, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { useToast } from '@/components/ToastContext';

const ESTIMATED_DELIVERY = '3-5 business days';
const VALID_CODE = 'AURA10';
const DISCOUNT_AMOUNT = 500;

function EmptyCartSVG() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="160" rx="60" ry="12" fill="#D4A574" fillOpacity="0.3" />
      <rect x="50" y="60" width="80" height="60" rx="20" fill="#fff" stroke="#8B7355" strokeWidth="4" />
      <rect x="65" y="75" width="50" height="30" rx="10" fill="#D4A574" />
      <circle cx="70" cy="130" r="10" fill="#8B7355" />
      <circle cx="110" cy="130" r="10" fill="#8B7355" />
    </svg>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { showToast } = useToast();
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discountFeedback, setDiscountFeedback] = useState('');
  const quantityMap = Object.fromEntries(cart.map(item => [item.id, item.quantity]));

  const subtotal = cart.reduce((sum, item) => sum + item.price * quantityMap[item.id], 0);
  const discount = appliedCode === VALID_CODE ? DISCOUNT_AMOUNT : 0;
  const shipping = cart.length === 0 ? 0 : null; // Placeholder, will be calculated at next step
  const taxableAmount = cart.length === 0 ? 0 : subtotal - discount + shipping;
  const tax = cart.length === 0 ? 0 : Math.round(taxableAmount * 0.18);
  const total = taxableAmount + tax;

  const handleRemove = (id: number) => {
    removeFromCart(id);
    showToast('Removed from cart', 'info');
  };

  const handleQuantity = (id: number, delta: number) => {
    const current = quantityMap[id] || 1;
    const newQty = Math.max(1, current + delta);
    updateQuantity(id, newQty);
    showToast('Quantity updated', 'info');
  };

  const handleApplyCode = () => {
    if (discountCode.trim().toUpperCase() === VALID_CODE) {
      setAppliedCode(VALID_CODE);
      setDiscountFeedback('Discount applied!');
      showToast('Discount applied!', 'success');
    } else {
      setDiscountFeedback('Invalid code');
      showToast('Invalid code', 'error');
    }
  };

  const handleRemoveCode = () => {
    setAppliedCode('');
    setDiscountFeedback('');
    setDiscountCode('');
  };

  const handleClearCart = () => {
    clearCart();
    showToast('Cart cleared', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F5F2E8] via-[#F8F6F0] to-[#E6DCC0] font-sans relative overflow-hidden">
      


      <Navigation />
      


      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-0 relative z-10">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-[70vh]">
          {/* Cart Items Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent flex items-center gap-2">
                <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-[#5E4E06]" />
                Your Cart
              </h1>
              {cart.length > 0 && (
                <button 
                  onClick={handleClearCart} 
                  className="flex items-center gap-1 text-red-600 hover:text-white hover:bg-red-600 px-3 py-2 rounded-lg border border-red-200 shadow-md transition-all duration-200 text-sm font-semibold cursor-pointer w-fit"
                >
                  <Trash2 className="w-4 h-4" /> Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 animate-fade-in">
                <div className="relative">
                  <EmptyCartSVG />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-[#8B7A1A]/20 rounded-full blur-2xl animate-pulse"></div>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent mt-8 mb-3 text-center">
                  Your cart is empty
                </h2>
                <p className="text-base md:text-lg text-[#5E4E06] mb-8 text-center max-w-md">
                  Start your journey to a beautiful, natural home.
                </p>
                <a 
                  href="/aura" 
                  className="group inline-flex items-center gap-2 px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-lg md:text-xl cursor-pointer relative overflow-hidden"
                >
                  <span className="relative z-10">Shop Now</span>
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#8B7A1A] to-[#B8A94A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/95 backdrop-blur-sm border border-[#D4AF37] animate-fade-in">
                <table className="min-w-full divide-y divide-[#D4AF37]">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#F5F2E8] to-[#E6DCC0]">
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-[#5E4E06] uppercase">Product</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-[#5E4E06] uppercase">Qty</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-[#5E4E06] uppercase">Price</th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-bold text-[#5E4E06] uppercase">Total</th>
                      <th className="px-3 md:px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.id} className="hover:bg-[#F5F2E8]/50 transition-all duration-200">
                        <td className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-4">
                          <img src={item.image} alt={item.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-xl border border-[#D4AF37] shadow-md" />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-[#5E4E06] text-sm md:text-base truncate">{item.name}</div>
                            <div className="text-[#8B7A1A] text-xs md:text-sm">{item.subtitle}</div>
                            {item.shades && item.shades.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {item.shades.map((shade, idx) => (
                                  <div key={shade.shadeId} className="flex items-center gap-2 text-xs md:text-sm">
                                    <span className="inline-block w-4 h-4 rounded-full border border-[#D4AF37]" style={{ backgroundColor: shade.shadeHex }}></span>
                                    <span className="font-medium">{shade.shadeName}</span>
                                    <span className="text-[#5E4E06]">x{shade.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-4">
                          <div className="flex items-center gap-1 md:gap-2">
                            <button 
                              onClick={() => handleQuantity(item.id, -1)} 
                              className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#F5F2E8] text-[#5E4E06] font-bold flex items-center justify-center hover:bg-[#E6C866] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                              disabled={quantityMap[item.id] <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={1}
                              value={quantityMap[item.id]}
                              onChange={e => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                handleQuantity(item.id, val - (quantityMap[item.id] || 1));
                              }}
                              className="w-12 md:w-16 text-center font-bold text-[#5E4E06] bg-white border border-[#D4AF37] rounded-lg px-1 md:px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#8B7A1A] transition text-sm"
                            />
                            <button 
                              onClick={() => handleQuantity(item.id, 1)} 
                              className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#F5F2E8] text-[#5E4E06] font-bold flex items-center justify-center hover:bg-[#E6C866] transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-4 font-bold text-[#5E4E06] text-sm md:text-base">₹{item.price}</td>
                        <td className="px-3 md:px-4 py-4 font-bold text-[#5E4E06] text-sm md:text-base">₹{item.price * quantityMap[item.id]}</td>
                        <td className="px-3 md:px-4 py-4">
                          <button 
                            onClick={() => handleRemove(item.id)} 
                            className="text-red-500 hover:text-white hover:bg-red-500 p-1.5 md:p-2 rounded-full border border-red-200 shadow-md transition-all duration-200 cursor-pointer" 
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Discount Code Section */}
            {cart.length > 0 && (
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-in">
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={appliedCode ? appliedCode : discountCode}
                    onChange={e => { setDiscountCode(e.target.value); setDiscountFeedback(''); }}
                    disabled={!!appliedCode}
                    className="px-4 py-3 rounded-lg border border-[#D4AF37] bg-white/90 text-[#5E4E06] font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B7A1A] transition w-full sm:w-64 placeholder:text-[#8B7A1A] placeholder:font-medium"
                  />
                  {appliedCode ? (
                    <button 
                      onClick={handleRemoveCode} 
                      className="flex items-center gap-1 px-4 py-3 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-500 hover:text-white transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      <XCircle className="w-4 h-4" /> Remove
                    </button>
                  ) : (
                    <button 
                      onClick={handleApplyCode} 
                      className="px-4 py-3 rounded-lg bg-[#5E4E06] text-white font-bold hover:bg-[#3D3204] transition-colors cursor-pointer w-full sm:w-auto"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {discountFeedback && (
                  <span className={`text-sm font-semibold ${discountFeedback === 'Discount applied!' ? 'text-green-600' : 'text-red-500'}`}>
                    {discountFeedback}
                  </span>
                )}
                {appliedCode && (
                  <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Applied
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="w-full lg:w-96 flex-shrink-0 lg:sticky lg:top-32 h-fit bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-[#D4AF37] p-6 md:p-8 flex flex-col gap-6 md:gap-8 mt-8 lg:mt-0 mx-auto lg:mx-0 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-[#5E4E06]" /> Order Summary
            </h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#8B7A1A]">Subtotal</span>
                <span className="font-bold text-[#5E4E06]">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCode})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#8B7A1A]">Shipping</span>
                <span className="font-bold text-[#5E4E06]">--</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7A1A]">G.S.T (18%)</span>
                <span className="font-bold text-[#5E4E06]">₹{tax}</span>
              </div>
              <div className="flex justify-between border-t border-[#D4AF37] pt-3 mt-3">
                <span className="text-lg md:text-xl font-extrabold text-[#5E4E06]">Total</span>
                <span className="text-lg md:text-xl font-extrabold text-[#5E4E06]">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/address')}
              className="group mt-2 px-6 py-3 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-base md:text-lg flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden"
              disabled={cart.length === 0}
            >
              <span className="relative z-10">Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B7A1A] to-[#B8A94A] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-2 text-[#5E4E06] font-semibold text-sm md:text-base">
                <Shield className="w-4 h-4 md:w-5 md:h-5" /> Eco-Friendly Packaging
              </div>
              <div className="flex items-center gap-2 text-[#8B7A1A] font-semibold text-sm md:text-base">
                <Lock className="w-4 h-4 md:w-5 md:h-5" /> 100% Secure Payment
              </div>
              <div className="flex items-center gap-2 text-[#8B7A1A] font-semibold text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> Delivery: {ESTIMATED_DELIVERY}
              </div>
            </div>
            
            <p className="text-xs text-[#8B7A1A] text-center mt-2">Inclusive of all taxes</p>
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