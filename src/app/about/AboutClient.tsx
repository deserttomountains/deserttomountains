'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Leaf, Mountain, Heart, Sparkles, Shield, Users, Globe, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export default function AboutClient() {
  const products = [
    {
      icon: Shield,
      title: "Aura Natural Plaster",
      description: "Gypsum and Cow-dung based natural plaster for green building",
      status: "Available Now"
    },
    {
      icon: Sparkles,
      title: "Eco-friendly Textiles",
      description: "Sustainable fashion and textile products",
      status: "Coming Soon"
    },
    {
      icon: Leaf,
      title: "Natural Lifestyle Products",
      description: "Range of daily-use natural lifestyle products",
      status: "Coming Soon"
    },
    {
      icon: Mountain,
      title: "Upcycled Furniture",
      description: "Sustainable furniture from recycled materials",
      status: "Coming Soon"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-white overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-[#5E4E06]/20 to-[#8B7A1A]/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-[#B8A94A]/30 to-[#5E4E06]/30 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-[#8B7A1A]/25 to-[#B8A94A]/25 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#F8F6F0] to-[#F0EDE4] border border-[#B8A94A] text-[#5E4E06] rounded-full text-xs sm:text-sm font-semibold shadow-lg mb-6 sm:mb-8 animate-fade-in-up">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" style={{animationDuration: '3s'}} />
              <span>Our Story</span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" style={{animationDuration: '3s', animationDirection: 'reverse'}} />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-[#2A2418] mb-6 sm:mb-8 leading-tight animate-fade-in-up">
              From Desert to
              <span className="block bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text text-transparent">
                Mountains
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-[#2A2418]/70 max-w-4xl mx-auto leading-relaxed animate-fade-in-up">
              A journey across India's diverse landscapes, discovering ancient secrets that transform 
              simple materials into powerful wellness solutions for modern living.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2A2418] mb-6 sm:mb-8">Our Mission</h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                To bridge the gap between ancient Indian wisdom and modern sustainable living, 
                creating products that promote health, wellness, and environmental consciousness.
              </p>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Every product carries the wisdom of generations, the purity of nature, and the 
                promise of healthier, more harmonious living spaces.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-3 sm:gap-4 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer text-sm sm:text-base">
                <span>Get in Touch</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
            <div className="relative animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06]/20 to-[#8B7A1A]/20 rounded-3xl blur-2xl opacity-20"></div>
              <img
                src="https://picsum.photos/600/500?random=8"
                alt="Traditional Craftsmanship"
                className="relative w-full h-64 sm:h-80 md:h-96 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2A2418] mb-4 sm:mb-6">Our Values</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide our journey and shape our products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-[#E8E4D8] group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2A2418] mb-3 sm:mb-4">Wellness First</h3>
              <p className="text-gray-600 text-sm sm:text-lg">Prioritizing health and wellbeing in everything we create</p>
            </div>
            
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-[#E8E4D8] group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#8B7A1A] to-[#B8A94A] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2A2418] mb-3 sm:mb-4">Sustainability</h3>
              <p className="text-gray-600 text-sm sm:text-lg">Committed to eco-friendly practices and materials</p>
            </div>
            
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-[#E8E4D8] group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#B8A94A] to-[#5E4E06] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2A2418] mb-3 sm:mb-4">Ancient Wisdom</h3>
              <p className="text-gray-600 text-sm sm:text-lg">Honoring traditional knowledge and practices</p>
            </div>
            
            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-[#E8E4D8] group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#2A2418] mb-3 sm:mb-4">Global Impact</h3>
              <p className="text-gray-600 text-sm sm:text-lg">Making a positive difference worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2A2418] mb-4 sm:mb-6">Our Product Journey</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From our current offerings to future innovations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {products.map((product, index) => (
              <div key={index} className="p-6 sm:p-8 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-3xl border border-[#E8E4D8] hover:shadow-xl transition-all duration-500 group">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <product.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-black text-[#2A2418] mb-2">{product.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-lg mb-3 sm:mb-4">{product.description}</p>
                    <span className={`inline-block px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${
                      product.status === "Available Now" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-[#F8F6F0] text-[#5E4E06] border border-[#B8A94A]"
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#2A2418] via-[#5E4E06] to-[#8B7A1A] relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-[#B8A94A]/30 to-[#5E4E06]/30 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 bg-gradient-to-br from-[#8B7A1A]/40 to-[#B8A94A]/40 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 sm:mb-8">Our Team</h2>
          <p className="text-lg sm:text-xl text-[#F0EDE4] mb-12 sm:mb-16 max-w-3xl mx-auto">
            A diverse group of artisans, scientists, and visionaries dedicated to bringing 
            ancient wisdom to modern homes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 group hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3 sm:mb-4">Artisans</h3>
              <p className="text-gray-300 text-sm sm:text-lg">Traditional craftsmen preserving ancient techniques</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 group hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#8B7A1A] to-[#B8A94A] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3 sm:mb-4">Scientists</h3>
              <p className="text-gray-300 text-sm sm:text-lg">Researchers ensuring quality and safety standards</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 group hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#B8A94A] to-[#5E4E06] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Mountain className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3 sm:mb-4">Visionaries</h3>
              <p className="text-gray-300 text-sm sm:text-lg">Innovators shaping the future of sustainable living</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2A2418] mb-6 sm:mb-8">Join Our Journey</h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 sm:mb-12 max-w-3xl mx-auto">
            Be part of a movement that honors tradition while embracing innovation. 
            Together, we can create healthier, more sustainable living spaces.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <Link href="/contact" className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
              <span className="flex items-center gap-3 text-base sm:text-lg">
                Get Started Today
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
            </Link>
            <Link href="/gallery" className="px-8 sm:px-10 py-4 sm:py-5 border-2 border-[#B8A94A] text-[#5E4E06] font-bold rounded-xl hover:bg-[#5E4E06] hover:text-white transition-all duration-300 bg-white cursor-pointer">
              <span className="text-base sm:text-lg">View Our Work</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 