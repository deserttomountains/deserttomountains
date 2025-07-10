'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Sparkles, CheckCircle, ShoppingCart, Star, ArrowRight } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';

export default function DhuneeClient() {
  const [selectedSize, setSelectedSize] = useState<'small' | 'large'>('small');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const sizes = [
    { key: 'small', label: 'Small', price: 249 },
    { key: 'large', label: 'Large', price: 400 }
  ];

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

  const selected = sizes.find(s => s.key === selectedSize);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      const cartItem = {
        id: selectedSize === 'small' ? 4 : 5,
        name: `Dhunee Organic Incense (${selected?.label})`,
        image: '/images/dhunee_1.webp',
        price: selected?.price || 0,
        quantity,
        subtitle: 'Himalayan Herbs & Cow Dung',
      };
      addToCart(cartItem);
      showToast('Added to cart!', 'success');
      router.push('/cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4]">
      <Navigation />
      
      {/* Hero/Product Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-white overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-[#5E4E06]/20 to-[#8B7A1A]/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-[#B8A94A]/30 to-[#5E4E06]/30 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-[#8B7A1A]/25 to-[#B8A94A]/25 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 items-center">
          {/* Product Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up">
              <img
                src="/images/dhunee_1.webp"
                alt="Dhunee Organic Incense"
                className="w-full h-80 object-cover rounded-3xl"
              />
              <div className="absolute top-4 left-4 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full p-3 shadow-lg animate-float">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 shadow-lg">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-[#E6C866] fill-current" />
                  <span className="text-xs sm:text-sm font-bold text-[#2A2418]">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="animate-fade-in-up">
            <div className="mb-4 inline-flex items-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] border border-[#B8A94A] text-[#5E4E06] rounded-full text-xs sm:text-sm font-semibold animate-fade-in-up">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" style={{animationDuration: '3s'}} />
              <span>Organic Incense • Vedic Tradition</span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" style={{animationDuration: '3s', animationDirection: 'reverse'}} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2A2418] mb-2 animate-fade-in-up">Dhunee</h1>
            <p className="text-[#5E4E06] font-bold text-lg sm:text-xl mb-4 animate-fade-in-up">Organic Incense</p>
            <p className="text-[#2A2418]/70 text-base sm:text-lg mb-6 animate-fade-in-up">Premium incense crafted from Himalayan herbs, desi cow dung, and pure ghee, based on ancient Vedic traditions for purification and peaceful ambiance.</p>
            
            {/* Size Selection */}
            <div className="mb-6">
              <div className="font-semibold text-[#2A2418] mb-3 text-sm sm:text-base">Choose Size:</div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {sizes.map(size => (
                  <button
                    key={size.key}
                    onClick={() => setSelectedSize(size.key as 'small' | 'large')}
                    className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none cursor-pointer text-sm sm:text-base ${
                      selectedSize === size.key 
                        ? 'border-[#5E4E06] bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] text-[#5E4E06] shadow-lg' 
                        : 'border-[#B8A94A] bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] text-[#2A2418] hover:border-[#5E4E06] hover:shadow-md'
                    }`}
                  >
                    {size.label} (₹{size.price})
                  </button>
                ))}
              </div>
            </div>
            
            {/* Price, Quantity Selector, and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-6 sm:mb-8">
              <span className="text-2xl sm:text-3xl font-black text-[#5E4E06]">₹{selected?.price}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full bg-[#F8F6F0] text-[#5E4E06] font-bold flex items-center justify-center border border-[#B8A94A] hover:bg-[#E6C866] transition-colors"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center font-bold text-[#5E4E06] bg-white border border-[#D4AF37] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#8B7A1A] transition text-sm"
                />
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-full bg-[#F8F6F0] text-[#5E4E06] font-bold flex items-center justify-center border border-[#B8A94A] hover:bg-[#E6C866] transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer ${
                  isAddingToCart ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
            <div className="text-xs sm:text-sm text-gray-500">Inclusive of all taxes</div>
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
            <p className="text-sm sm:text-lg text-gray-700 mb-4">In primeval times, Deva Rishis, ancient scholars who lived their lives with simplicity and renunciation, practised Hawan – a crucial and sacred ritual of Hindu Culture – for mental peace and well being.</p>
            <blockquote className="border-l-4 border-[#5E4E06] pl-4 italic text-[#5E4E06] mb-4 bg-[#F8F6F0] py-2 rounded text-sm sm:text-base">Mahamrityunjay Mantra, a noted chant from Hindu Mythology, manifests as <span className='font-semibold'>sugandhim</span> (Aroma/Good Smell) <span className='font-semibold'>pushtivardhanam</span> (Give rise to good Health/nourishment) emphasizing that a clean and a fragrant atmosphere helps in nourishing the soul within.</blockquote>
            <p className="text-sm sm:text-lg text-gray-700 mb-4">Hawan follows the scientific process wherein carefully picked Himalayan medicinal herbs are offered to Agni Dev (the Fire God) along with 100% organic cow dung & Ghee (Butter), producing Oxygen when burnt together.</p>
            <p className="text-sm sm:text-lg text-gray-700 mb-4">Although widely noted as something practiced by Deva Rishis, the practice of Hawan is also recommended by the earliest holy scriptures of Hindu religion – Yajur Veda. It advocates performing Hawan every morning and evening to attain spiritual enlightenment, mental peace, purification of mind, and calm aura.</p>
            <div className="mt-6 p-4 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] rounded-xl text-[#5E4E06] font-semibold text-center shadow text-sm sm:text-base">With a view to inculcate the recommendations of our holy scriptures in our daily lives, we present to you an opportunity to purify and to bless the aura engulfed by you at ease with Dhunee.</div>
          </div>
        </div>
      </section>

      {/* Product Description Section */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Experience Purity & Peace</h3>
          <p className="text-sm sm:text-lg text-gray-700 mb-4">Dhunee is more than incense—it's a sacred tradition. Each stick is hand-rolled using Himalayan herbs, desi cow dung, and pure ghee, following ancient Vedic recipes for spiritual and environmental purification. Light Dhunee to cleanse your space, invite peace, and connect with timeless Indian wisdom.</p>
        </div>
      </section>

      {/* Final CTA - Inspired by Home, themed for Dhunee */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#2A2418] via-[#5E4E06] to-[#8B7A1A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#5E4E06]/20 to-[#8B7A1A]/20"></div>
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-[#B8A94A]/30 to-[#5E4E06]/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-br from-[#8B7A1A]/40 to-[#B8A94A]/40 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-8 sm:mb-10">Ready to Elevate Your Space?</h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-[#F0EDE4] mb-12 sm:mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Join those who have embraced <span className="font-semibold text-[#E6C866]">spiritual purity</span> and <span className="font-semibold text-[#E6C866]">therapeutic living</span> with Dhunee. Transform your home, mind, and aura today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center">
            <a href="/contact" className="group px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-full shadow-2xl hover:shadow-[#B8A94A]/25 transition-all duration-500 hover:scale-105 cursor-pointer">
              <span className="flex items-center gap-3 sm:gap-4 text-lg sm:text-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                Connect with Us
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </a>
            <a href="/gallery" className="px-8 sm:px-12 py-4 sm:py-6 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white hover:text-[#5E4E06] transition-all duration-300 hover:scale-105 cursor-pointer">
              <span className="text-lg sm:text-xl">View Gallery</span>
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 
 