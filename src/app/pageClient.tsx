'use client';

import { 
  ArrowRight, 
  Leaf, 
  Sparkles, 
  Shield, 
  Heart, 
  Star, 
  Phone, 
  CheckCircle, 
  Quote,
  Zap,
  Mountain,
  Sun,
  Globe,
  Compass
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import React from 'react';

export default function HomeClient() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slideshow images
  const heroImages = [
    '/images/deserttomountains-4-scaled-1.webp',
    '/images/aura-on-site-1-1.webp',
    '/images/dhunee_1.webp',
    '/images/aura_1.webp'
  ];

  useEffect(() => {
    const slideshowInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    
    return () => {
      clearInterval(slideshowInterval);
    };
  }, []);





  // Helper to split text into spans for letter animation
  function AnimatedTitle({ text, className = '' }: { text: string; className?: string }) {
    return (
      <span className={className}>
        {text.split('').map((char: string, i: number) => (
          <span
            key={i}
            className="inline-block animate-letter-reveal"
            style={{
              animationDelay: `${0.15 + i * 0.06}s`,
              animationDuration: '0.7s',
              animationFillMode: 'both',
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navigation />

      {/* Hero Section - Autoplaying Slideshow Background, Glassmorphism Overlay, Animated Title with Floating Panel and Letter Reveal */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Slideshow */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Desert to Mountains Hero Slide ${index + 1} - Natural Building Solutions`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ filter: 'brightness(0.7) saturate(1.1)' }}
            />
          ))}
        </div>
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent z-10" />
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        {/* Glassmorphism Overlay with Animated Title */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full px-2 sm:px-4">
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl sm:rounded-3xl shadow-2xl px-3 py-6 sm:px-8 sm:py-16 md:px-20 md:py-24 max-w-[95vw] sm:max-w-xl md:max-w-2xl mx-auto flex flex-col items-center animate-panel-float" style={{boxShadow: '0 8px 48px 0 rgba(90, 80, 30, 0.18)'}}>
            <h1 className="text-xl xs:text-2xl sm:text-4xl md:text-6xl font-extrabold text-white text-center tracking-tight mb-2 leading-tight sm:leading-tight">
              <AnimatedTitle text="Think Natural" />
              <br />
              <span style={{ whiteSpace: 'nowrap' }}>
                <AnimatedTitle text="Build Better" className="text-[#E6C866]" />
              </span>
            </h1>
          </div>
        </div>
        {/* Animations */}
        <style jsx global>{`
          @keyframes fade-slide-up {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes panel-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-16px); }
          }
          .animate-panel-float {
            animation: panel-float 5s ease-in-out infinite;
          }
          @keyframes letter-reveal {
            0% { opacity: 0; transform: translateY(30px) scale(0.9) skewY(8deg); filter: blur(4px); }
            60% { opacity: 1; transform: translateY(-4px) scale(1.04) skewY(-2deg); filter: blur(0.5px); }
            100% { opacity: 1; transform: translateY(0) scale(1) skewY(0deg); filter: blur(0); }
          }
          .animate-letter-reveal {
            animation-name: letter-reveal;
            animation-timing-function: cubic-bezier(0.4,0,0.2,1);
          }
          @media (max-width: 640px) {
            .backdrop-blur-xl {
              padding-left: 1rem !important;
              padding-right: 1rem !important;
              padding-top: 2rem !important;
              padding-bottom: 2rem !important;
              border-radius: 1rem !important;
            }
            h1 {
              font-size: 1.6rem !important;
              line-height: 2.2rem !important;
            }
          }
        `}</style>
      </section>

      {/* Desert to Mountains Section - New */}
      <section className="py-24 bg-gradient-to-br from-[#F0EDE4] via-[#F8F6F0] to-[#E8E4D8] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%235E4E06' fill-opacity='0.1'%3E%3Cpath d='M40 40c0-22.091-17.909-40-40-40v80c22.091 0 40-17.909 40-40zm0 0c0 22.091 17.909 40 40 40V0c-22.091 0-40 17.909-40 40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Mountain className="w-12 h-12 text-[#5E4E06]" />
              <h1 className="text-5xl md:text-6xl font-black text-[#2A2418]">Desert to Mountains</h1>
              <Sun className="w-12 h-12 text-[#8B7A1A]" />
            </div>
            <p className="text-2xl md:text-3xl text-[#5E4E06] font-semibold mb-6">
              A Return to the Earth, A Step Toward the Future
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <img
                  src="/images/deserttomountains-4-scaled-1.webp"
                  alt="Desert to Mountains Landscape - Natural Building Solutions from Thar Desert to Himalayas"
                  className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A2418]/30 to-transparent rounded-3xl"></div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="space-y-8">
                <p className="text-xl md:text-2xl text-[#2A2418]/80 leading-relaxed font-light">
                  Desert to Mountains is a vision born from the raw beauty and wisdom of India's landscapes—from the
                  sun-baked dunes of the Thar Desert to the enduring serenity of the Himalayan ranges. Our mission is rooted
                  in a single belief: <span className="font-semibold text-[#5E4E06]">nature has everything we need</span>, if only we learn how to use it responsibly.
                </p>
                
                <p className="text-lg md:text-xl text-[#2A2418]/70 leading-relaxed">
                  We are dedicated to reviving ancient building practices through modern, sustainable innovation. By crafting
                  eco-conscious materials that honor our ecological heritage, we aim to redefine how homes and buildings
                  interact with the environment.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div className="group p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl border border-[#E8E4D8] hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#2A2418]">Minimally Processed</h3>
              </div>
              <p className="text-[#2A2418]/70 text-lg leading-relaxed">
                Each of our products is developed with care—minimally processed, naturally sourced, and designed to nourish not just your spaces, but also your wellbeing.
              </p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl border border-[#E8E4D8] hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black text-[#2A2418]">Natural Ingredients</h3>
              </div>
              <p className="text-[#2A2418]/70 text-lg leading-relaxed">
                From clay that breathes, to lime that strengthens, from gypsum that insulates, to cow dung that heals, we work with ingredients that have long protected Indian homes—now reimagined for the world of tomorrow.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              <div className="relative p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl border border-[#B8A94A] shadow-xl">
                <Quote className="w-12 h-12 text-[#5E4E06] mx-auto mb-6" />
                <p className="text-2xl md:text-3xl text-[#2A2418]/80 font-light leading-relaxed mb-6">
                  We don't just create materials—we create movements. Movements toward healthier homes, cleaner air,
                  skilled local communities, and a future where construction doesn't compromise the planet.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Compass className="w-8 h-8 text-[#5E4E06]" />
                  <span className="text-[#5E4E06] font-semibold text-lg">Building Tomorrow, Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Products Section - Enhanced with Dynamic Elements */}
      <section className="py-24 bg-gradient-to-br from-[#F0EDE4] via-[#F8F6F0] to-[#E8E4D8] relative overflow-hidden">

        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-[#2A2418] mb-8">Our Premium Collection</h2>
            <p className="text-2xl text-[#2A2418]/70 max-w-4xl mx-auto font-light">
              Two masterpieces born from timeless traditions, perfected for modern homes
            </p>
          </div>
          
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Aura Product - Enhanced */}
            <div className="group relative w-full max-w-xl mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <div className="relative bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-[#E8E4D8] overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5E4E06]/10 to-[#8B7A1A]/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-12 h-12 text-white group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-4xl font-black text-[#2A2418] mb-3">Aura</h3>
                      <p className="text-[#5E4E06] font-bold text-xl">Natural Wall Plaster</p>
                      <p className="text-[#2A2418]/60 text-lg mt-2">Breathable • Toxin-Free • Beautiful</p>
                    </div>
                  </div>
                  
                  <div className="mb-10">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src="/images/aura.webp"
                        alt="Aura Natural Wall Plaster - Eco-Friendly Gypsum and Cow Dung Based Plaster"
                        className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700 rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2A2418]/20 to-transparent"></div>
                    </div>
                  </div>
                  
                  <p className="text-[#2A2418]/70 text-base sm:text-lg md:text-xl mb-10 leading-relaxed font-light">
                    Revolutionary gypsum and cow dung-based plaster that naturally regulates air quality 
                    while creating stunning, healthy surfaces inspired by traditional Indian knowledge.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[#2A2418] font-bold text-sm sm:text-base md:text-lg">100% Natural Ingredients</h4>
                        <p className="text-[#2A2418]/60 text-xs sm:text-sm">Pure gypsum and organic cow dung</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[#2A2418] font-bold text-sm sm:text-base md:text-lg">Breathable & Healthy</h4>
                        <p className="text-[#2A2418]/60 text-xs sm:text-sm">Naturally regulates indoor air quality</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[#2A2418] font-bold text-sm sm:text-base md:text-lg">Zero Toxins</h4>
                        <p className="text-[#2A2418]/60 text-xs sm:text-sm">Completely safe for your family</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link href="/aura" className="block w-full py-4 sm:py-5 bg-gradient-to-r from-[#5E4E06] via-[#8B7A1A] to-[#5E4E06] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 text-center text-lg sm:text-xl relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative z-10">Explore Aura Collection</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Dhunee Product - Enhanced */}
            <div className="group relative w-full max-w-xl mx-auto lg:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <div className="relative bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-[#E8E4D8] overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5E4E06]/10 to-[#8B7A1A]/10 rounded-full -translate-y-16 translate-x-16 animate-pulse" style={{animationDelay: '1s'}}></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-12 h-12 text-white group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-4xl font-black text-[#2A2418] mb-3">Dhunee</h3>
                      <p className="text-[#5E4E06] font-bold text-xl">Organic Incense</p>
                      <p className="text-[#2A2418]/60 text-lg mt-2">Pure • Natural • Himalayan</p>
                    </div>
                  </div>
                  
                  <div className="mb-10">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src="/images/dhunee.webp"
                        alt="Dhunee Organic Incense - Traditional Vedic Incense with Himalayan Herbs"
                        className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700 rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2A2418]/20 to-transparent"></div>
                    </div>
                  </div>
                  
                  <p className="text-[#2A2418]/70 text-base sm:text-lg md:text-xl mb-10 leading-relaxed font-light">
                    Premium incense crafted from Himalayan herbs, desi cow dung, and pure ghee, 
                    based on traditional Vedic practices for purification and peaceful ambiance.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[#2A2418] font-bold text-sm sm:text-base md:text-lg">Himalayan Herbs</h4>
                        <p className="text-[#2A2418]/60 text-xs sm:text-sm">Pure herbs from pristine mountains</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[#2A2418] font-bold text-sm sm:text-base md:text-lg">Purifying Properties</h4>
                        <p className="text-[#2A2418]/60 text-xs sm:text-sm">Naturally cleanses your space</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[#2A2418] font-bold text-sm sm:text-base md:text-lg">Peaceful Ambiance</h4>
                        <p className="text-[#2A2418]/60 text-xs sm:text-sm">Creates a calming atmosphere</p>
                      </div>
                    </div>
                  </div>

                  <Link href="/dhunee" className="block w-full py-4 sm:py-5 bg-gradient-to-r from-[#5E4E06] via-[#8B7A1A] to-[#5E4E06] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 text-center text-lg sm:text-xl relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative z-10">Discover Dhunee Collection</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Story Section - Enhanced */}
      <section id="story" className="py-24 bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-[#E8E4D8] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%235E4E06' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v40c11.046 0 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20V0c-11.046 0-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <img
                  src="/images/gallery/1.webp"
                  alt="From Desert to Mountains"
                  className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A2418]/30 to-transparent rounded-3xl"></div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-5xl md:text-6xl font-black text-[#2A2418] mb-10">From Desert to Mountains</h2>
              
              <div className="space-y-8 mb-12">
                <p className="text-2xl text-[#2A2418]/70 leading-relaxed font-light">
                  Born from a sacred journey across India's diverse landscapes, we discovered the 
                  <span className="font-semibold text-[#5E4E06]"> traditional secrets</span> that transform 
                  simple materials into powerful wellness solutions.
                </p>
                
                <p className="text-xl text-[#2A2418]/70 leading-relaxed">
                  Every product carries the wisdom of generations, the purity of nature, and the 
                  promise of healthier, more harmonious living spaces.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-12">
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:scale-105 transition-transform duration-300">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-[#5E4E06] mb-1 sm:mb-2 whitespace-nowrap">Traditional</div>
                  <div className="text-[#2A2418]/70 font-medium text-sm sm:text-base whitespace-nowrap">Knowledge</div>
                </div>
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:scale-105 transition-transform duration-300">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-[#5E4E06] mb-1 sm:mb-2 whitespace-nowrap">Modern</div>
                  <div className="text-[#2A2418]/70 font-medium text-sm sm:text-base whitespace-nowrap">Innovation</div>
                </div>
              </div>

              <Link href="/about" className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-[#5E4E06] via-[#8B7A1A] to-[#5E4E06] text-white font-bold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="text-xl relative z-10">Discover Our Journey</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-[#2A2418] via-[#5E4E06] to-[#8B7A1A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#5E4E06]/20 to-[#8B7A1A]/20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-10">Ready for Transformation?</h2>
          <p className="text-2xl text-[#F5F2E8] mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Join our growing family of conscious homeowners who've chosen the path of 
            <span className="font-semibold text-[#E6C866]"> natural living</span> and 
            <span className="font-semibold text-[#E6C866]"> traditional knowledge</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center">
            <Link href="/contact" className="group px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-[#5E4E06] via-[#8B7A1A] to-[#5E4E06] text-white font-bold rounded-full shadow-2xl hover:shadow-[#5E4E06]/25 transition-all duration-500 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="flex items-center gap-3 sm:gap-4 text-lg sm:text-xl relative z-10">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" />
                Begin Your Journey
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
            
            <Link href="/gallery" className="px-8 sm:px-12 py-4 sm:py-6 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white hover:text-[#2A2418] transition-all duration-300 hover:scale-105">
              <span className="text-lg sm:text-xl">View Gallery</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
} 