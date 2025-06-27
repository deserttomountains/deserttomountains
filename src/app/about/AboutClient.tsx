'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Leaf, Mountain, Heart, Sparkles, Shield, Users, Globe, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-white to-amber-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23d97706%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-amber-200 text-amber-700 rounded-full text-sm font-semibold shadow-lg mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Our Story</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
              From Desert to
              <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Mountains
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
              A journey across India's diverse landscapes, discovering ancient secrets that transform 
              simple materials into powerful wellness solutions for modern living.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Our Mission</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                To bridge the gap between ancient Indian wisdom and modern sustainable living, 
                creating products that promote health, wellness, and environmental consciousness.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Every product carries the wisdom of generations, the purity of nature, and the 
                promise of healthier, more harmonious living spaces.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
                <span>Get in Touch</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-2xl opacity-20"></div>
              <img
                src="https://picsum.photos/600/500?random=8"
                alt="Traditional Craftsmanship"
                className="relative w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide our journey and shape our products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Wellness First</h3>
              <p className="text-gray-600 text-lg">Prioritizing health and wellbeing in everything we create</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Sustainability</h3>
              <p className="text-gray-600 text-lg">Committed to eco-friendly practices and materials</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Ancient Wisdom</h3>
              <p className="text-gray-600 text-lg">Honoring traditional knowledge and practices</p>
            </div>
            
            <div className="text-center p-8 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Global Impact</h3>
              <p className="text-gray-600 text-lg">Making a positive difference worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Our Product Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From our current offerings to future innovations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product, index) => (
              <div key={index} className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-200 hover:shadow-xl transition-all duration-500">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <product.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{product.title}</h3>
                    <p className="text-gray-600 text-lg mb-4">{product.description}</p>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      product.status === "Available Now" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-amber-100 text-amber-700"
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
      <section className="py-24 bg-gradient-to-br from-gray-900 via-amber-900 to-orange-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Our Team</h2>
          <p className="text-xl text-gray-300 mb-16 max-w-3xl mx-auto">
            A diverse group of artisans, scientists, and visionaries dedicated to bringing 
            ancient wisdom to modern homes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Artisans</h3>
              <p className="text-gray-300 text-lg">Traditional craftsmen preserving ancient techniques</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Scientists</h3>
              <p className="text-gray-300 text-lg">Researchers ensuring quality and safety standards</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Mountain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Visionaries</h3>
              <p className="text-gray-300 text-lg">Innovators shaping the future of sustainable living</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Join Our Journey</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Be part of a movement that honors tradition while embracing innovation. 
            Together, we can create healthier, more sustainable living spaces.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/contact" className="px-10 py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              <span className="flex items-center gap-3 text-lg">
                Get Started Today
                <ArrowRight className="w-6 h-6" />
              </span>
            </Link>
            <Link href="/gallery" className="px-10 py-5 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-amber-600 hover:text-amber-600 transition-all duration-300 bg-white">
              <span className="text-lg">View Our Work</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 