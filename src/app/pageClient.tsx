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
  Sun
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import React from 'react';

export default function HomeClient() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    },5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      text: "The Aura plaster completely transformed our home. The air quality improved dramatically and the walls look absolutely stunning.",
      author: "Priya Sharma",
      location: "Mumbai"
    },
    {
      text: "Dhunee incense has become an essential part of our daily ritual. The aroma is pure and brings such peace to our space.",
      author: "Rajesh Kumar",
      location: "Delhi"
    },
    {
      text: "Finally found products that align with our values of natural living. The quality and authenticity are unmatched.",
      author: "Anita Patel",
      location: "Bangalore"
    }
  ];

  const benefits = [
    { icon: Shield, title: "100% Natural", desc: "Zero chemicals or toxins" },
    { icon: Heart, title: "Health First", desc: "Promotes wellbeing naturally" },
    { icon: Leaf, title: "Eco-Conscious", desc: "Sustainable & earth-friendly" },
    { icon: Star, title: "Ancient Wisdom", desc: "5000+ years of tradition" }
  ];

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

      {/* Hero Section - Full Background Image, Glassmorphism Overlay, Animated Title with Floating Panel and Letter Reveal */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <img
          src="/images/deserttomountains-4-scaled-1.webp"
          alt="Desert to Mountains Hero"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          style={{ filter: 'brightness(0.7) saturate(1.1)' }}
        />
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent z-10" />
        {/* Glassmorphism Overlay with Animated Title */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full px-2 sm:px-4">
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-2xl sm:rounded-3xl shadow-2xl px-4 py-8 sm:px-8 sm:py-16 md:px-20 md:py-24 max-w-[95vw] sm:max-w-xl md:max-w-2xl mx-auto flex flex-col items-center animate-panel-float" style={{boxShadow: '0 8px 48px 0 rgba(90, 80, 30, 0.18)'}}>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-extrabold text-white text-center tracking-tight mb-2 leading-tight sm:leading-tight">
              <AnimatedTitle text="Think Aura" />
              <br />
              <span style={{ whiteSpace: 'nowrap' }}>
                <AnimatedTitle text="Think better Home" className="text-[#E6C866]" />
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

      {/* Benefits Section - Enhanced with Dynamic Background */}
      <section className="py-24 bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-[#E8E4D8] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235E4E06' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-[#2A2418] mb-6">Why Choose Aura?</h2>
            <p className="text-2xl text-[#2A2418]/70 max-w-4xl mx-auto font-light">
              Experience the transformative power of nature's finest ingredients
            </p>
          </div>
          
          
          {/* Benefits Cards Grid - Centered and Responsive */}
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center max-w-4xl">
            {benefits
              .filter((benefit) => benefit.title !== "Ancient Wisdom")
              .map((benefit, index) => (
                <div key={index} className="group text-center p-10 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-[#E8E4D8] backdrop-blur-sm relative overflow-hidden w-full max-w-xs">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06]/5 to-[#8B7A1A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-[#5E4E06]/25 transition-all duration-300 relative z-10 group-hover:scale-110">
                  <benefit.icon className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <h3 className="text-2xl font-black text-[#2A2418] mb-4 relative z-10">{benefit.title}</h3>
                <p className="text-[#2A2418]/70 text-lg font-medium relative z-10">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section - Enhanced with Dynamic Elements */}
      <section className="py-24 bg-gradient-to-br from-[#F0EDE4] via-[#F8F6F0] to-[#E8E4D8] relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-4 h-4 bg-[#5E4E06]/20 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-[#8B7A1A]/30 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-5 h-5 bg-[#E6C866]/25 rounded-full animate-bounce" style={{animationDelay: '2.5s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-[#2A2418] mb-8">Our Premium Collection</h2>
            <p className="text-2xl text-[#2A2418]/70 max-w-4xl mx-auto font-light">
              Two masterpieces born from ancient wisdom, perfected for modern homes
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
                        alt="Aura Natural Wall Plaster"
                        className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700 rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2A2418]/20 to-transparent"></div>
                    </div>
                  </div>
                  
                  <p className="text-[#2A2418]/70 text-base sm:text-lg md:text-xl mb-10 leading-relaxed font-light">
                    Revolutionary gypsum and cow dung-based plaster that naturally regulates air quality 
                    while creating stunning, healthy surfaces inspired by ancient Indian wisdom.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-base sm:text-lg">100% Natural Ingredients</h4>
                        <p className="text-[#2A2418]/60 text-xs sm:text-sm">Pure gypsum and organic cow dung</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-base sm:text-lg">Breathable & Healthy</h4>
                        <p className="text-[#2A2418]/60 text-xs sm:text-sm">Naturally regulates indoor air quality</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-base sm:text-lg">Zero Toxins</h4>
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
                        alt="Dhunee Organic Incense"
                        className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-700 rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2A2418]/20 to-transparent"></div>
                    </div>
                  </div>
                  
                  <p className="text-[#2A2418]/70 text-base sm:text-lg md:text-xl mb-10 leading-relaxed font-light">
                    Premium incense crafted from Himalayan herbs, desi cow dung, and pure ghee, 
                    based on ancient Vedic traditions for purification and peaceful ambiance.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-base sm:text-lg">Himalayan Herbs</h4>
                        <p className="text-[#2A2418]/60 text-xs sm:text-sm">Pure herbs from pristine mountains</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-base sm:text-lg">Purifying Properties</h4>
                        <p className="text-[#2A2418]/60 text-xs sm:text-sm">Naturally cleanses your space</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-base sm:text-lg">Peaceful Ambiance</h4>
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

      {/* Testimonials Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-[#2A2418] via-[#5E4E06] to-[#8B7A1A] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8">What Our Family Says</h2>
            <p className="text-2xl text-[#F5F2E8] max-w-3xl mx-auto font-light">
              Join thousands who've transformed their homes and lives
            </p>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <Quote className="w-16 h-16 text-[#E6C866] mx-auto mb-8 animate-bounce" style={{animationDuration: '3s'}} />
              
              <div className="text-center">
                <p className="text-2xl md:text-3xl text-white mb-8 leading-relaxed font-light italic">
                  "{testimonials[activeTestimonial].text}"
                </p>
                
                <div className="text-[#E6C866] font-bold text-xl mb-2">
                  {testimonials[activeTestimonial].author}
                </div>
                <div className="text-[#F5F2E8] text-lg">
                  {testimonials[activeTestimonial].location}
                </div>
              </div>
            </div>
            
            {/* Testimonial Indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial ? 'bg-[#E6C866] w-8' : 'bg-white/30'
                  }`}
                />
              ))}
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
                  src="/images/dtm_1.webp"
                  alt="From Desert to Mountains"
                  className="relative w-full h-[500px] object-cover rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A2418]/30 to-transparent rounded-3xl"></div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-5xl md:text-6xl font-black text-[#2A2418] mb-10">From Desert to Mountains</h2>
              
              <div className="space-y-8 mb-12">
                <p className="text-2xl text-[#2A2418]/70 leading-relaxed font-light">
                  Born from a sacred journey across India's diverse landscapes, we discovered the 
                  <span className="font-semibold text-[#5E4E06]"> ancient secrets</span> that transform 
                  simple materials into powerful wellness solutions.
                </p>
                
                <p className="text-xl text-[#2A2418]/70 leading-relaxed">
                  Every product carries the wisdom of generations, the purity of nature, and the 
                  promise of healthier, more harmonious living spaces.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="text-center p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-black text-[#5E4E06] mb-2">Ancient</div>
                  <div className="text-[#2A2418]/70 font-medium">Wisdom</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:scale-105 transition-transform duration-300">
                  <div className="text-3xl font-black text-[#5E4E06] mb-2">Modern</div>
                  <div className="text-[#2A2418]/70 font-medium">Innovation</div>
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
            <span className="font-semibold text-[#E6C866]"> ancient wisdom</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link href="/contact" className="group px-12 py-6 bg-gradient-to-r from-[#5E4E06] via-[#8B7A1A] to-[#5E4E06] text-white font-bold rounded-full shadow-2xl hover:shadow-[#5E4E06]/25 transition-all duration-500 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="flex items-center gap-4 text-xl relative z-10">
                <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Begin Your Journey
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
            
            <Link href="/gallery" className="px-12 py-6 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white hover:text-[#2A2418] transition-all duration-300 hover:scale-105">
              <span className="text-xl">View Gallery</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 