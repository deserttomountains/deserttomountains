'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Sparkles, CheckCircle } from 'lucide-react';

export default function DhuneeClient() {
  const [selectedSize, setSelectedSize] = useState<'small' | 'large'>('small');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-pink-50">
      <Navigation />
      {/* Hero/Product Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-purple-50 via-pink-50 to-white overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Product Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://picsum.photos/500/300?random=3"
                alt="Dhunee Organic Incense"
                className="w-full h-80 object-cover rounded-3xl"
              />
              <div className="absolute top-4 left-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          {/* Product Details */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 px-6 py-2 bg-white border border-pink-200 text-pink-700 rounded-full text-sm font-semibold shadow">
              <Sparkles className="w-4 h-4" />
              <span>Organic Incense • Vedic Tradition</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Dhunee</h1>
            <p className="text-pink-600 font-bold text-xl mb-2">Organic Incense</p>
            <p className="text-gray-500 text-lg mb-8">Premium incense crafted from Himalayan herbs, desi cow dung, and pure ghee, based on ancient Vedic traditions for purification and peaceful ambiance.</p>
            {/* Size Selection */}
            <div className="mb-6">
              <div className="font-semibold text-gray-800 mb-2">Choose Size:</div>
              <div className="flex gap-4">
                {sizes.map(size => (
                  <button
                    key={size.key}
                    onClick={() => setSelectedSize(size.key as 'small' | 'large')}
                    className={`px-6 py-3 rounded-xl border-2 font-bold transition-all duration-300 focus:outline-none ${selectedSize === size.key ? 'border-pink-600 bg-pink-100 text-pink-700' : 'border-gray-200 bg-white text-gray-700 hover:border-pink-400'}`}
                  >
                    {size.label} (₹{size.price})
                  </button>
                ))}
              </div>
            </div>
            {/* Price and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-8">
              <span className="text-3xl font-black text-pink-600">₹{selected?.price}</span>
              <button
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 text-base cursor-pointer"
                // onClick={handleAddToCart} // Placeholder for cart logic
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007.5 17h9a1 1 0 00.9-.55L21 9M7 13V6a1 1 0 011-1h3m4 0h2a1 1 0 011 1v2" /></svg>
                Add to Cart
              </button>
            </div>
            <div className="text-sm text-gray-500">Inclusive of all taxes</div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-white to-pink-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-10 text-center">Why Choose Dhunee?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 bg-white rounded-2xl shadow-lg border border-pink-100 text-center group hover:shadow-2xl transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Ingredients Section - Creative Card Layout */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="text-3xl font-black text-pink-700 mb-10 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-7 h-7 text-pink-400 animate-pulse" />
            100% Organic Ingredients
            <Sparkles className="w-7 h-7 text-pink-400 animate-pulse" />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: 'Nardotachys jatamasi', label: 'Muskroot', color: 'from-pink-400 to-purple-400' },
              { name: 'Valeriana Wallichii', label: 'Himalayan Tagar', color: 'from-purple-400 to-pink-300' },
              { name: 'Cyperus Rotundus', label: 'Nagarmotha', color: 'from-pink-300 to-yellow-200' },
              { name: 'Hedychium Spicatum', label: 'Sandharlika', color: 'from-yellow-200 to-pink-200' },
              { name: 'Acorus Calamus', label: 'Nashini', color: 'from-pink-200 to-purple-200' },
              { name: 'Organic Cow Dung & Pure Ghee', label: 'Healing Base', color: 'from-purple-200 to-pink-100' },
            ].map((item, idx) => (
              <div key={idx} className={`rounded-2xl shadow-xl p-6 flex flex-col items-center bg-gradient-to-br ${item.color} hover:scale-105 transition-transform duration-300`}>
                <div className="mb-3 w-12 h-12 flex items-center justify-center rounded-full bg-white/70 shadow">
                  <Sparkles className="w-7 h-7 text-pink-500" />
                </div>
                <div className="font-bold text-lg text-gray-900 mb-1 text-center">{item.name}</div>
                <div className="text-pink-700 text-sm font-semibold mb-2 text-center">{item.label}</div>
                {idx === 5 && <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold mt-2">Therapeutic Base</span>}
              </div>
            ))}
          </div>
          <p className="text-base text-gray-600 text-center mt-8">All ingredients are highly therapeutic and have healing properties.</p>
        </div>
      </section>
      {/* Purpose & Benefits - Timeline/Stepper Style */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-3xl font-black text-pink-700 mb-10 text-center">Purpose & Benefits</h3>
          <div className="relative border-l-4 border-pink-200 pl-8">
            <div className="mb-10 flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-400 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-pink-700 text-lg mb-1">Chakra Energy Restoration</div>
                <p className="text-gray-700">Dhunee enhances the energy levels of <span className="font-semibold text-pink-600">chakras</span> and restores them. Chakras are the convergence of energy, thoughts, and physical body.</p>
              </div>
            </div>
            <div className="mb-10 flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-pink-700 text-lg mb-1">Healing Properties</div>
                <p className="text-gray-700">Cow dung & ghee are well known for their <span className="font-semibold text-pink-600">healing properties</span>: relieving respiratory systems, clearing vein clots, & fighting bacteria present in the atmosphere.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-pink-300 to-yellow-200 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-pink-700 text-lg mb-1">Therapeutic Value</div>
                <p className="text-gray-700">Dhunee is <span className="font-semibold text-pink-600">highly therapeutic</span> due to the medicinal value of Himalayan ingredients used in its making.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* About Section - Split Layout with Callouts */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Visual/Illustration Side */}
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 rounded-3xl blur-2xl opacity-30"></div>
            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" alt="Hawan Ritual" className="relative w-full h-80 object-cover rounded-3xl shadow-2xl" />
          </div>
          {/* Text Side */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
            <h3 className="text-2xl font-bold text-pink-700 mb-4 text-center">About Dhunee & The Hawan Tradition</h3>
            <p className="text-lg text-gray-700 mb-4">In primeval times, Deva Rishis, ancient scholars who lived their lives with simplicity and renunciation, practised Hawan – a crucial and sacred ritual of Hindu Culture – for mental peace and well being.</p>
            <blockquote className="border-l-4 border-pink-400 pl-4 italic text-pink-800 mb-4 bg-pink-50 py-2 rounded">Mahamrityunjay Mantra, a noted chant from Hindu Mythology, manifests as <span className='font-semibold'>sugandhim</span> (Aroma/Good Smell) <span className='font-semibold'>pushtivardhanam</span> (Give rise to good Health/nourishment) emphasizing that a clean and a fragrant atmosphere helps in nourishing the soul within.</blockquote>
            <p className="text-lg text-gray-700 mb-4">Hawan follows the scientific process wherein carefully picked Himalayan medicinal herbs are offered to Agni Dev (the Fire God) along with 100% organic cow dung & Ghee (Butter), producing Oxygen when burnt together.</p>
            <p className="text-lg text-gray-700 mb-4">Although widely noted as something practiced by Deva Rishis, the practice of Hawan is also recommended by the earliest holy scriptures of Hindu religion – Yajur Veda. It advocates performing Hawan every morning and evening to attain spiritual enlightenment, mental peace, purification of mind, and calm aura.</p>
            <div className="mt-6 p-4 bg-pink-100 rounded-xl text-pink-800 font-semibold text-center shadow">With a view to inculcate the recommendations of our holy scriptures in our daily lives, we present to you an opportunity to purify and to bless the aura engulfed by you at ease with Dhunee.</div>
          </div>
        </div>
      </section>
      {/* Product Description Section */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Experience Purity & Peace</h3>
          <p className="text-lg text-gray-700 mb-4">Dhunee is more than incense—it's a sacred tradition. Each stick is hand-rolled using Himalayan herbs, desi cow dung, and pure ghee, following ancient Vedic recipes for spiritual and environmental purification. Light Dhunee to cleanse your space, invite peace, and connect with timeless Indian wisdom.</p>
        </div>
      </section>
      {/* Final CTA - Inspired by Home, themed for Dhunee */}
      <section className="py-24 bg-gradient-to-br from-purple-900 via-pink-900 to-pink-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-purple-600/20"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-10">Ready to Elevate Your Space?</h2>
          <p className="text-2xl text-pink-100 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Join those who have embraced <span className="font-semibold text-pink-300">spiritual purity</span> and <span className="font-semibold text-pink-300">therapeutic living</span> with Dhunee. Transform your home, mind, and aura today.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <a href="/contact" className="group px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-500 hover:scale-105">
              <span className="flex items-center gap-4 text-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                Connect with Us
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
            </a>
            <a href="/gallery" className="px-12 py-6 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white hover:text-pink-900 transition-all duration-300 hover:scale-105">
              <span className="text-xl">View Gallery</span>
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
} 
 