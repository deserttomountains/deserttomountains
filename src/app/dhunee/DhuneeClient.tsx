'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Sparkles, CheckCircle, ShoppingCart, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { useToast } from '@/components/ToastContext';

export default function DhuneeClient() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const PRICE = 599;

  const features = [
    {
      icon: <CheckCircle className="w-6 h-6 text-white" />, 
      title: 'Himalayan Herbs',
      desc: 'Pure herbs from pristine mountains'
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-white" />, 
      title: 'Purifying Properties',
      desc: 'Naturally cleanses your space'
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-white" />, 
      title: 'Peaceful Ambiance',
      desc: 'Creates a calming atmosphere'
    }
  ];

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    try {
      addToCart({
        id: 4,
        name: 'Dhunee Organic Incense',
        image: '/images/dhunee_1.webp',
        price: PRICE,
        quantity: quantity,
        subtitle: 'Traditional Vedic Incense',
        type: 'dhunee',
      });
      showToast('Added Dhunee to cart!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    try {
      addToCart({
        id: 4,
        name: 'Dhunee Organic Incense',
        image: '/images/dhunee_1.webp',
        price: PRICE,
        quantity: quantity,
        subtitle: 'Traditional Vedic Incense',
        type: 'dhunee',
      });
      router.push('/cart');
    } catch (error) {
      console.error('Error proceeding to buy:', error);
      showToast('Failed to proceed to checkout', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4]">
      <Navigation />
      
      {/* Hero/Product Section */}
      <section className="relative pt-24 md:pt-28 pb-12 md:pb-16 bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-white overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Product Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
              <img
                src="/images/dhunee_1.webp"
                alt="Dhunee Organic Incense"
                className="w-full h-72 sm:h-80 md:h-[390px] object-cover rounded-3xl"
              />
            </div>
          </div>
          
          {/* Product Details */}
          <div className="animate-fade-in-up">
            <div className="mb-3 inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] border border-[#B8A94A] text-[#5E4E06] rounded-full text-xs sm:text-sm font-semibold animate-fade-in-up">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" style={{animationDuration: '3s'}} />
              <span>Organic Incense • Vedic Tradition</span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" style={{animationDuration: '3s', animationDirection: 'reverse'}} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2A2418] mb-1 animate-fade-in-up">Dhunee</h1>
            <p className="text-[#5E4E06] font-bold text-lg sm:text-xl mb-2 animate-fade-in-up">Organic Incense</p>
            <p className="text-[#2A2418]/70 text-sm sm:text-base mb-4 animate-fade-in-up leading-relaxed">
              Premium incense crafted from Himalayan herbs, desi cow dung, and pure ghee, based on traditional Vedic practices for purification and peaceful ambiance.
            </p>

            {/* Product Highlights */}
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-[#B8A94A]/40 rounded-full text-xs sm:text-sm font-semibold text-[#5E4E06] shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 text-[#8B7A1A]" />
                100% Organic Vedic Blend
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 border border-[#B8A94A]/40 rounded-full text-xs sm:text-sm font-semibold text-[#5E4E06] shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 text-[#8B7A1A]" />
                45-60 Mins Burn Time
              </span>
            </div>

            {/* Price & Purchase Box */}
            <div className="bg-white/85 backdrop-blur-sm rounded-2xl border border-[#B8A94A]/40 p-4 sm:p-5 shadow-sm space-y-4">
              {/* Price & Stock Header */}
              <div className="flex items-baseline justify-between border-b border-[#E8E4D8] pb-3">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-[#5E4E06]">₹{PRICE}</span>
                    <span className="text-xs text-gray-500 font-medium">/ pack</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Inclusive of all taxes</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>In Stock</span>
                </div>
              </div>

              {/* Quantity Selector Row */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#2A2418]">Quantity:</span>
                  {quantity > 1 && (
                    <span className="ml-2 text-xs text-[#8B7A1A] font-semibold">
                      (Total: ₹{(PRICE * quantity).toLocaleString()})
                    </span>
                  )}
                </div>

                <div className="flex items-center bg-[#F8F6F0] border border-[#B8A94A]/60 rounded-xl p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 rounded-lg bg-white hover:bg-[#E6C866]/40 text-[#5E4E06] font-bold flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-[#2A2418] text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.min(99, prev + 1))}
                    aria-label="Increase quantity"
                    className="w-8 h-8 rounded-lg bg-white hover:bg-[#E6C866]/40 text-[#5E4E06] font-bold flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: Spacious and clearly separated */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] hover:from-[#4D3F05] hover:to-[#736515] text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                  <span>{isAddingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>

                {/* Buy Now */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#E6C866] to-[#D4AF37] hover:from-[#DAC055] hover:to-[#C4A027] text-[#2A2418] font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap cursor-pointer"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-2.5 border-t border-[#E8E4D8] flex items-center justify-between text-xs text-[#5E4E06]">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#8B7A1A] flex-shrink-0" />
                  <span>Pan-India Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8B7A1A] flex-shrink-0" />
                  <span>100% Authentic Vedic Blend</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-8 sm:mb-10 text-center">Why Choose Dhunee?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-6 sm:p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl shadow-lg border border-[#E8E4D8] text-center group hover:shadow-2xl transition-all duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 sm:mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] shadow-lg group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ingredients Section - Creative Card Layout */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-black text-[#5E4E06] mb-8 sm:mb-10 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-[#B8A94A] animate-pulse" />
            100% Organic Ingredients
            <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-[#B8A94A] animate-pulse" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              { name: 'Nardotachys jatamasi', label: 'Muskroot', color: 'from-[#8B7A1A] to-[#B8A94A]' },
              { name: 'Valeriana Wallichii', label: 'Himalayan Tagar', color: 'from-[#B8A94A] to-[#5E4E06]' },
              { name: 'Cyperus Rotundus', label: 'Nagarmotha', color: 'from-[#5E4E06] to-[#8B7A1A]' },
              { name: 'Hedychium Spicatum', label: 'Sandharlika', color: 'from-[#8B7A1A] to-[#B8A94A]' },
              { name: 'Acorus Calamus', label: 'Nashini', color: 'from-[#B8A94A] to-[#5E4E06]' },
              { name: 'Organic Cow Dung & Pure Ghee', label: 'Healing Base', color: 'from-[#5E4E06] to-[#8B7A1A]' },
            ].map((item, idx) => (
              <div key={idx} className={`rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col items-center bg-gradient-to-br ${item.color} hover:scale-105 transition-transform duration-300`}>
                <div className="mb-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/70 shadow">
                  <Sparkles className="w-5 h-5 sm:w-7 sm:h-7 text-[#5E4E06]" />
                </div>
                <div className="font-bold text-sm sm:text-lg text-white mb-1 text-center leading-tight">{item.name}</div>
                <div className="text-white/90 text-xs sm:text-sm font-semibold mb-2 text-center">{item.label}</div>
                {idx === 5 && <span className="inline-block px-2 sm:px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold mt-2">Therapeutic Base</span>}
              </div>
            ))}
          </div>
          <p className="text-sm sm:text-base text-gray-600 text-center mt-6 sm:mt-8">All ingredients are highly therapeutic and have healing properties.</p>
        </div>
      </section>

      {/* Purpose & Benefits - Timeline/Stepper Style */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-black text-[#5E4E06] mb-8 sm:mb-10 text-center">Purpose & Benefits</h3>
          <div className="relative border-l-4 border-[#B8A94A] pl-6 sm:pl-8">
            <div className="mb-8 sm:mb-10 flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] shadow-lg">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-[#5E4E06] text-base sm:text-lg mb-1">Chakra Energy Restoration</div>
                <p className="text-gray-700 text-sm sm:text-base">Dhunee enhances the energy levels of <span className="font-semibold text-[#5E4E06]">chakras</span> and restores them. Chakras are the convergence of energy, thoughts, and physical body.</p>
              </div>
            </div>
            <div className="mb-8 sm:mb-10 flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#8B7A1A] to-[#5E4E06] shadow-lg">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-[#5E4E06] text-base sm:text-lg mb-1">Healing Properties</div>
                <p className="text-gray-700 text-sm sm:text-base">Cow dung & ghee are well known for their <span className="font-semibold text-[#5E4E06]">healing properties</span>: relieving respiratory systems, clearing vein clots, & fighting bacteria present in the atmosphere.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#B8A94A] to-[#5E4E06] shadow-lg">
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-[#5E4E06] text-base sm:text-lg mb-1">Therapeutic Value</div>
                <p className="text-gray-700 text-sm sm:text-base">Dhunee is <span className="font-semibold text-[#5E4E06]">highly therapeutic</span> due to the medicinal value of Himalayan ingredients used in its making.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Split Layout with Callouts */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Visual/Illustration Side */}
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06]/20 to-[#8B7A1A]/20 rounded-3xl blur-2xl opacity-30"></div>
            <img src="/images/dhunee_2.webp" alt="Hawan Ritual" className="relative w-full h-64 sm:h-80 object-cover rounded-3xl shadow-2xl" />
          </div>
          {/* Text Side */}
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-[#E8E4D8]">
            <h3 className="text-xl sm:text-2xl font-bold text-[#5E4E06] mb-4 text-center">About Dhunee & The Hawan Tradition</h3>
            <p className="text-sm sm:text-lg text-gray-700 mb-4">In primeval times, Deva Rishis, traditional scholars who lived their lives with simplicity and renunciation, practised Hawan, a crucial and sacred ritual of Hindu Culture, for mental peace and well being.</p>
            <blockquote className="border-l-4 border-[#5E4E06] pl-4 italic text-[#5E4E06] mb-4 bg-[#F8F6F0] py-2 rounded text-sm sm:text-base">Mahamrityunjay Mantra, a noted chant from Hindu Mythology, manifests as <span className='font-semibold'>sugandhim</span> (Aroma/Good Smell) <span className='font-semibold'>pushtivardhanam</span> (Give rise to good Health/nourishment) emphasizing that a clean and a fragrant atmosphere helps in nourishing the soul within.</blockquote>
            <p className="text-sm sm:text-lg text-gray-700 mb-4">Hawan follows the scientific process wherein carefully picked Himalayan medicinal herbs are offered to Agni Dev (the Fire God) along with 100% organic cow dung & Ghee (Butter), producing Oxygen when burnt together.</p>
            <p className="text-sm sm:text-lg text-gray-700 mb-4">Although widely noted as something practiced by Deva Rishis, the practice of Hawan is also recommended by the earliest holy scriptures of Hindu religion, the Yajur Veda. It advocates performing Hawan every morning and evening to attain spiritual enlightenment, mental peace, purification of mind, and calm aura.</p>
            <div className="mt-6 p-4 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-xl text-[#5E4E06] font-semibold text-center shadow text-sm sm:text-base">With a view to inculcate the recommendations of our holy scriptures in our daily lives, we present to you an opportunity to purify and to bless the aura engulfed by you at ease with Dhunee.</div>
          </div>
        </div>
      </section>

      {/* Product Description Section */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Experience Purity & Peace</h3>
          <p className="text-sm sm:text-lg text-gray-700 mb-4">Dhunee is more than incense, it's a sacred tradition. Each stick is hand-rolled using Himalayan herbs, desi cow dung, and pure ghee, following traditional Vedic recipes for spiritual and environmental purification. Light Dhunee to cleanse your space, invite peace, and connect with timeless Indian knowledge.</p>
        </div>
      </section>

      {/* Final CTA - Themed for Dhunee */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#2A2418] via-[#5E4E06] to-[#8B7A1A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#5E4E06]/20 to-[#8B7A1A]/20"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 sm:mb-10">Experience the Sacred Purity of Dhunee</h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-[#F0EDE4] mb-12 sm:mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Bring home the divine fragrance of authentic Vedic incense crafted with <span className="font-semibold text-[#E6C866]">Himalayan herbs, desi cow dung, and pure ghee</span> for peace, clarity, and spiritual wellness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button
              type="button"
              onClick={handleBuyNow}
              className="group px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-[#E6C866] to-[#D4AF37] hover:from-[#DAC055] hover:to-[#C4A027] text-[#2A2418] font-bold rounded-full shadow-2xl hover:shadow-[#B8A94A]/40 transition-all duration-300 hover:scale-105 cursor-pointer flex items-center gap-3 text-lg sm:text-xl"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Order Now • ₹{PRICE}</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="/cart"
              className="px-8 sm:px-10 py-4 sm:py-5 border-2 border-white/40 text-white font-bold rounded-full hover:bg-white hover:text-[#5E4E06] transition-all duration-300 hover:scale-105 cursor-pointer text-lg"
            >
              View Cart
            </a>
          </div>
        </div>
      </section>
      
    </div>
  );
}
