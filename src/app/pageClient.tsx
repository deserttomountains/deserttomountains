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

export default function HomeClient() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navigation />

      {/* Hero Section - Enhanced with Dynamic Elements */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-[#E8E4D8] overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#5E4E06]/10 to-[#8B7A1A]/10 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-[#E6C866]/20 to-[#D4AF37]/20 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-[#B8A94A]/15 to-[#5E4E06]/15 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-[#8B7A1A]/10 to-[#E6C866]/10 rounded-full animate-spin" style={{animationDuration: '20s'}}></div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <Mountain className="absolute top-32 left-16 w-8 h-8 text-[#5E4E06]/20 animate-float" />
          <Sun className="absolute top-24 right-24 w-6 h-6 text-[#E6C866]/30 animate-float" style={{animationDelay: '1.5s'}} />
          <Leaf className="absolute bottom-32 left-32 w-5 h-5 text-[#8B7A1A]/25 animate-float" style={{animationDelay: '2.5s'}} />
          <Zap className="absolute bottom-40 right-16 w-7 h-7 text-[#D4AF37]/20 animate-float" style={{animationDelay: '3s'}} />
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          {/* Badge with Enhanced Animation */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] border border-[#B8A94A] text-[#5E4E06] rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm animate-fade-in-up">
              <Sparkles className="w-4 h-4 animate-spin" style={{animationDuration: '3s'}} />
              <span>Ancient Wisdom • Modern Living</span>
              <Sparkles className="w-4 h-4 animate-spin" style={{animationDuration: '3s', animationDirection: 'reverse'}} />
            </div>
          </div>

          {/* Main Headline with Enhanced Typography */}
          <h1 className="text-5xl md:text-7xl font-black text-[#2A2418] mb-8 leading-tight animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Transform Your Space with
            <span className="block bg-gradient-to-r from-[#5E4E06] via-[#8B7A1A] to-[#D4AF37] bg-clip-text text-transparent animate-gradient">
              Nature's Finest
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-[#2A2418]/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            Discover our premium natural wall plaster and organic incense, crafted from ancient Indian traditions 
            to create healthy, beautiful, and spiritually harmonious environments.
          </p>
          
          {/* CTA Buttons with Enhanced Effects */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <Link href="/aura" className="group px-10 py-5 bg-gradient-to-r from-[#5E4E06] via-[#8B7A1A] to-[#5E4E06] text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="flex items-center gap-3 text-lg relative z-10">
                Explore Products
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
            <Link href="/about" className="px-10 py-5 border-2 border-[#B8A94A] text-[#5E4E06] font-bold rounded-xl hover:border-[#5E4E06] hover:text-[#5E4E06] transition-all duration-300 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] hover:shadow-lg">
              <span className="text-lg">Learn Our Story</span>
            </Link>
          </div>
          
          {/* Stats with Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '0.8s'}}>
            <div className="text-center p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="text-4xl font-black bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent mb-3">500+</div>
              <div className="text-[#2A2418]/80 font-medium">Happy Homes</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="text-4xl font-black bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent mb-3">100%</div>
              <div className="text-[#2A2418]/80 font-medium">Natural Ingredients</div>
            </div>
            <div className="text-center p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm">
              <div className="text-4xl font-black bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent mb-3">5000+</div>
              <div className="text-[#2A2418]/80 font-medium">Years of Tradition</div>
            </div>
          </div>
        </div>
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
            <h2 className="text-5xl md:text-6xl font-black text-[#2A2418] mb-6">Why Choose Natural?</h2>
            <p className="text-2xl text-[#2A2418]/70 max-w-4xl mx-auto font-light">
              Experience the transformative power of nature's finest ingredients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group text-center p-10 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-[#E8E4D8] backdrop-blur-sm relative overflow-hidden">
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

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-[#2A2418] mb-8">Our Premium Collection</h2>
            <p className="text-2xl text-[#2A2418]/70 max-w-4xl mx-auto font-light">
              Two masterpieces born from ancient wisdom, perfected for modern homes
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Aura Product - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <div className="relative bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-[#E8E4D8] overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5E4E06]/10 to-[#8B7A1A]/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start gap-8 mb-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-12 h-12 text-white group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-[#2A2418] mb-3">Aura</h3>
                      <p className="text-[#5E4E06] font-bold text-xl">Natural Wall Plaster</p>
                      <p className="text-[#2A2418]/60 text-lg mt-2">Breathable • Toxin-Free • Beautiful</p>
                    </div>
                  </div>
                  
                  <div className="mb-10">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src="https://picsum.photos/500/300?random=2"
                        alt="Aura Natural Wall Plaster"
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2A2418]/20 to-transparent"></div>
                    </div>
                  </div>
                  
                  <p className="text-[#2A2418]/70 text-xl mb-10 leading-relaxed font-light">
                    Revolutionary gypsum and cow dung-based plaster that naturally regulates air quality 
                    while creating stunning, healthy surfaces inspired by ancient Indian wisdom.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-lg">100% Natural Ingredients</h4>
                        <p className="text-[#2A2418]/60 text-sm">Pure gypsum and organic cow dung</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-lg">Breathable & Healthy</h4>
                        <p className="text-[#2A2418]/60 text-sm">Naturally regulates indoor air quality</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-lg">Zero Toxins</h4>
                        <p className="text-[#2A2418]/60 text-sm">Completely safe for your family</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link href="/aura" className="block w-full py-5 bg-gradient-to-r from-[#5E4E06] via-[#8B7A1A] to-[#5E4E06] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 text-center text-xl relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative z-10">Explore Aura Collection</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Dhunee Product - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <div className="relative bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-[#E8E4D8] overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5E4E06]/10 to-[#8B7A1A]/10 rounded-full -translate-y-16 translate-x-16 animate-pulse" style={{animationDelay: '1s'}}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start gap-8 mb-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-12 h-12 text-white group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-[#2A2418] mb-3">Dhunee</h3>
                      <p className="text-[#5E4E06] font-bold text-xl">Organic Incense</p>
                      <p className="text-[#2A2418]/60 text-lg mt-2">Pure • Natural • Himalayan</p>
                    </div>
                  </div>
                  
                  <div className="mb-10">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src="https://picsum.photos/500/300?random=3"
                        alt="Dhunee Organic Incense"
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2A2418]/20 to-transparent"></div>
                    </div>
                  </div>
                  
                  <p className="text-[#2A2418]/70 text-xl mb-10 leading-relaxed font-light">
                    Premium incense crafted from Himalayan herbs, desi cow dung, and pure ghee, 
                    based on ancient Vedic traditions for purification and peaceful ambiance.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-lg">Himalayan Herbs</h4>
                        <p className="text-[#2A2418]/60 text-sm">Pure herbs from pristine mountains</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-lg">Purifying Properties</h4>
                        <p className="text-[#2A2418]/60 text-sm">Naturally cleanses your space</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl border border-[#B8A94A] hover:shadow-lg transition-all duration-300 group/feature hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-[#2A2418] font-bold text-lg">Peaceful Ambiance</h4>
                        <p className="text-[#2A2418]/60 text-sm">Creates a calming atmosphere</p>
                      </div>
                    </div>
                  </div>

                  <Link href="/dhunee" className="block w-full py-5 bg-gradient-to-r from-[#5E4E06] via-[#8B7A1A] to-[#5E4E06] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 text-center text-xl relative overflow-hidden group/btn">
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%235E4E06' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v40c11.046 0 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20V0c-11.046 0-20 8.954-20 20z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <img
                  src="https://picsum.photos/600/500?random=8"
                  alt="Traditional Craftsmanship"
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