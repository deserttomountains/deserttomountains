"use client";

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ShoppingCart, Trash2, ArrowRight, CheckCircle, Lock, Truck, Shield, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const placeholderCart = [
  {
    id: 1,
    name: 'Aura Wall Putty 25kg',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    price: 400,
    quantity: 2,
    subtitle: 'Natural Gypsum & Cow Dung',
  },
  {
    id: 2,
    name: 'Sample Pack (6 Colors)',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    price: 2799,
    quantity: 1,
    subtitle: 'Choose your favorite shades',
  },
];

const ESTIMATED_DELIVERY = '3-5 business days';
const VALID_CODE = 'AURA10';
const DISCOUNT_AMOUNT = 500;

function EmptyCartSVG() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="160" rx="60" ry="12" fill="#A7F3D0" fillOpacity="0.3" />
      <rect x="50" y="60" width="80" height="60" rx="20" fill="#fff" stroke="#38BDF8" strokeWidth="4" />
      <rect x="65" y="75" width="50" height="30" rx="10" fill="#A7F3D0" />
      <circle cx="70" cy="130" r="10" fill="#38BDF8" />
      <circle cx="110" cy="130" r="10" fill="#38BDF8" />
    </svg>
  );
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState(placeholderCart);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [discountFeedback, setDiscountFeedback] = useState('');
  const [quantityMap, setQuantityMap] = useState(() => Object.fromEntries(cart.map(item => [item.id, item.quantity])));

  const subtotal = cart.reduce((sum, item) => sum + item.price * quantityMap[item.id], 0);
  const discount = appliedCode === VALID_CODE ? DISCOUNT_AMOUNT : 0;
  const shipping = subtotal - discount > 2000 ? 0 : 199;
  const taxableAmount = subtotal - discount + shipping;
  const tax = Math.round(taxableAmount * 0.18);
  const total = taxableAmount + tax;

  const handleRemove = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
    setQuantityMap(q => { const copy = { ...q }; delete copy[id]; return copy; });
  };

  const handleQuantity = (id: number, delta: number) => {
    setQuantityMap(q => {
      const newQty = Math.max(1, (q[id] || 1) + delta);
      return { ...q, [id]: newQty };
    });
  };

  const handleApplyCode = () => {
    if (discountCode.trim().toUpperCase() === VALID_CODE) {
      setAppliedCode(VALID_CODE);
      setDiscountFeedback('Discount applied!');
    } else {
      setDiscountFeedback('Invalid code');
    }
  };

  const handleRemoveCode = () => {
    setAppliedCode('');
    setDiscountFeedback('');
    setDiscountCode('');
  };

  const handleClearCart = () => {
    setCart([]);
    setQuantityMap({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-100 via-white to-orange-100 font-sans">
      <Navigation />
      {/* Progress Bar */}
      <div className="w-full bg-white/80 border-b border-amber-100 py-4 px-2 md:px-0 flex items-center justify-center gap-8 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-700 flex items-center gap-1"><ShoppingCart className="w-5 h-5" /> Cart</span>
          <span className="w-8 h-1 bg-amber-200 rounded-full mx-2" />
          <span className="font-semibold text-amber-400">Address</span>
          <span className="w-8 h-1 bg-amber-200 rounded-full mx-2" />
          <span className="font-semibold text-amber-400">Payment</span>
        </div>
        <a href="/aura" className="ml-auto text-amber-500 font-semibold hover:underline hidden md:inline">Continue Shopping</a>
      </div>
      <main className="flex-1 flex flex-col items-center py-8 px-2 md:px-0">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 min-h-[70vh]">
          {/* Cart Items Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-amber-900 flex items-center gap-2">Your Cart</h1>
              {cart.length > 0 && (
                <button onClick={handleClearCart} className="flex items-center gap-1 text-red-500 hover:text-white hover:bg-red-500 px-3 py-1 rounded-lg border border-red-100 shadow transition-all duration-200 text-sm font-semibold">
                  <Trash2 className="w-4 h-4" /> Clear Cart
                </button>
              )}
            </div>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16">
                <EmptyCartSVG />
                <h2 className="text-4xl md:text-5xl font-extrabold text-amber-700 mt-8 mb-3 text-center">Your cart is empty</h2>
                <p className="text-lg text-amber-400 mb-8 text-center">Start your journey to a beautiful, natural home.</p>
                <a href="/aura" className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-bold rounded-full shadow-xl hover:scale-105 transition-all duration-300 text-xl">
                  <ArrowRight className="w-6 h-6" /> Shop Now
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl shadow-xl bg-white/90 border border-amber-100">
                <table className="min-w-full divide-y divide-amber-100">
                  <thead>
                    <tr className="bg-amber-50">
                      <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-amber-700 uppercase">Total</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.id} className="hover:bg-amber-50 transition-all">
                        <td className="flex items-center gap-4 px-4 py-4">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-amber-100 shadow" />
                          <div>
                            <div className="font-bold text-amber-900 text-base">{item.name}</div>
                            <div className="text-amber-400 text-xs">{item.subtitle}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleQuantity(item.id, -1)} className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center hover:bg-amber-200 transition" disabled={quantityMap[item.id] <= 1}>-</button>
                            <input
                              type="number"
                              min={1}
                              value={quantityMap[item.id]}
                              onChange={e => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                setQuantityMap(q => ({ ...q, [item.id]: val }));
                              }}
                              className="w-16 text-center font-bold text-amber-900 bg-white border border-amber-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                            />
                            <button onClick={() => handleQuantity(item.id, 1)} className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center hover:bg-amber-200 transition">+</button>
                          </div>
                        </td>
                        <td className="px-4 py-4 font-bold text-amber-900">₹{item.price}</td>
                        <td className="px-4 py-4 font-bold text-orange-700">₹{item.price * quantityMap[item.id]}</td>
                        <td className="px-4 py-4">
                          <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-full border border-red-100 shadow transition-all duration-200" aria-label="Remove item"><Trash2 className="w-5 h-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Discount Code Section */}
            {cart.length > 0 && (
              <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={appliedCode ? appliedCode : discountCode}
                    onChange={e => { setDiscountCode(e.target.value); setDiscountFeedback(''); }}
                    disabled={!!appliedCode}
                    className="px-4 py-3 rounded-lg border border-amber-200 bg-white/80 text-amber-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition w-full md:w-64 placeholder:text-amber-600 placeholder:font-medium"
                  />
                  {appliedCode ? (
                    <button onClick={handleRemoveCode} className="flex items-center gap-1 px-4 py-3 rounded-lg bg-red-100 text-red-600 font-bold hover:bg-red-500 hover:text-white transition"><XCircle className="w-4 h-4" /> Remove</button>
                  ) : (
                    <button onClick={handleApplyCode} className="px-4 py-3 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition">Apply</button>
                  )}
                </div>
                {discountFeedback && (
                  <span className={`text-sm font-semibold ${discountFeedback === 'Discount applied!' ? 'text-green-600' : 'text-red-500'}`}>{discountFeedback}</span>
                )}
                {appliedCode && <span className="text-green-600 text-sm font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Applied</span>}
              </div>
            )}
          </div>
          {/* Order Summary Section */}
          <div className="w-full md:w-96 flex-shrink-0 md:sticky md:top-32 h-fit bg-white/90 rounded-3xl shadow-2xl border border-amber-200 p-8 flex flex-col gap-8 mt-12 md:mt-0 mx-auto md:mx-0 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-amber-900 mb-2 flex items-center gap-3">
              <ShoppingCart className="w-7 h-7 text-amber-500" /> Order Summary
            </h2>
            <div className="flex flex-col gap-3 text-lg">
              <div className="flex justify-between">
                <span className="text-amber-700">Subtotal</span>
                <span className="font-bold text-amber-900">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({appliedCode})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-amber-700">Shipping</span>
                <span className="font-bold text-amber-900">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">G.S.T (18%)</span>
                <span className="font-bold text-amber-900">₹{tax}</span>
              </div>
              <div className="flex justify-between border-t pt-3 mt-3">
                <span className="text-xl font-extrabold text-orange-700">Total</span>
                <span className="text-xl font-extrabold text-orange-700">₹{total}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/address')}
              className="mt-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all duration-300 text-lg flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={cart.length === 0}
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex items-center gap-2 text-amber-500 font-semibold">
                <Truck className="w-5 h-5" /> Free Shipping over ₹2000
              </div>
              <div className="flex items-center gap-2 text-orange-500 font-semibold">
                <Shield className="w-5 h-5" /> Eco-Friendly Packaging
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Lock className="w-5 h-5" /> 100% Secure Payment
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <CheckCircle className="w-5 h-5" /> Delivery: {ESTIMATED_DELIVERY}
              </div>
            </div>
            <p className="text-xs text-amber-400 text-center mt-2">Inclusive of all taxes</p>
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
      `}</style>
    </div>
  );
} 