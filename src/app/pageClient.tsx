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
  Quote
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

      {/* Hero Section - Clean & Simple */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-amber-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-amber-200 text-amber-700 rounded-full text-sm font-semibold shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>Ancient Wisdom • Modern Living</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
            Transform Your Space with
            <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Nature's Finest
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover our premium natural wall plaster and organic incense, crafted from ancient Indian traditions 
            to create healthy, beautiful, and spiritually harmonious environments.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/aura" className="px-10 py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <span className="flex items-center gap-3 text-lg">
                Explore Products
                <ArrowRight className="w-6 h-6" />
              </span>
            </Link>
            <Link href="/about" className="px-10 py-5 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-amber-600 hover:text-amber-600 transition-all duration-300 bg-white">
              Learn Our Story
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8 bg-white rounded-2xl border border-amber-200 shadow-lg">
              <div className="text-4xl font-black text-amber-600 mb-3">500+</div>
              <div className="text-gray-700 font-medium">Happy Homes</div>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl border border-amber-200 shadow-lg">
              <div className="text-4xl font-black text-amber-600 mb-3">100%</div>
              <div className="text-gray-700 font-medium">Natural Ingredients</div>
            </div>
            <div className="text-center p-8 bg-white rounded-2xl border border-amber-200 shadow-lg">
              <div className="text-4xl font-black text-amber-600 mb-3">5000+</div>
              <div className="text-gray-700 font-medium">Years of Tradition</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - New Addition */}
      <section className="py-24 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">Why Choose Natural?</h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              Experience the transformative power of nature's finest ingredients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group text-center p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300">
                  <benefit.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 text-lg font-medium">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8">Our Premium Collection</h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              Two masterpieces born from ancient wisdom, perfected for modern homes
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Aura Product - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <div className="relative bg-white rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start gap-8 mb-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <Shield className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-gray-900 mb-3">Aura</h3>
                      <p className="text-amber-600 font-bold text-xl">Natural Wall Plaster</p>
                      <p className="text-gray-500 text-lg mt-2">Breathable • Toxin-Free • Beautiful</p>
                    </div>
                  </div>
                  
                  <div className="mb-10">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src="https://picsum.photos/500/300?random=2"
                        alt="Aura Natural Wall Plaster"
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-xl mb-10 leading-relaxed font-light">
                    Revolutionary gypsum and cow dung-based plaster that naturally regulates air quality 
                    while creating stunning, healthy surfaces inspired by ancient Indian wisdom.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 hover:shadow-lg transition-all duration-300 group/feature">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold text-lg">100% Natural Ingredients</h4>
                        <p className="text-gray-600 text-sm">Pure gypsum and organic cow dung</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 group/feature">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold text-lg">Breathable & Healthy</h4>
                        <p className="text-gray-600 text-sm">Naturally regulates indoor air quality</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 group/feature">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold text-lg">Zero Toxins</h4>
                        <p className="text-gray-600 text-sm">Completely safe for your family</p>
                      </div>
                    </div>
                  </div>
                  
                  <Link href="/aura" className="block w-full py-5 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 text-center text-xl">
                    Explore Aura Collection
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Dhunee Product - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
              
              <div className="relative bg-white rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start gap-8 mb-10">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black text-gray-900 mb-3">Dhunee</h3>
                      <p className="text-purple-600 font-bold text-xl">Organic Incense</p>
                      <p className="text-gray-500 text-lg mt-2">Pure • Natural • Himalayan</p>
                    </div>
                  </div>
                  
                  <div className="mb-10">
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src="https://picsum.photos/500/300?random=3"
                        alt="Dhunee Organic Incense"
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-xl mb-10 leading-relaxed font-light">
                    Premium incense crafted from Himalayan herbs, desi cow dung, and pure ghee, 
                    based on ancient Vedic traditions for purification and peaceful ambiance.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 mb-10">
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 hover:shadow-lg transition-all duration-300 group/feature">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold text-lg">Himalayan Herbs</h4>
                        <p className="text-gray-600 text-sm">Pure herbs from pristine mountains</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-200 hover:shadow-lg transition-all duration-300 group/feature">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold text-lg">Purifying Properties</h4>
                        <p className="text-gray-600 text-sm">Naturally cleanses your space</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 hover:shadow-lg transition-all duration-300 group/feature">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover/feature:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold text-lg">Peaceful Ambiance</h4>
                        <p className="text-gray-600 text-sm">Creates a calming atmosphere</p>
                      </div>
                    </div>
                  </div>

                  <Link href="/dhunee" className="block w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 text-center text-xl">
                    Discover Dhunee Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - New */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-amber-900 to-orange-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8">What Our Family Says</h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto font-light">
              Join thousands who've transformed their homes and lives
            </p>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20 shadow-2xl">
              <Quote className="w-16 h-16 text-amber-400 mx-auto mb-8" />
              
              <div className="text-center">
                <p className="text-2xl md:text-3xl text-white mb-8 leading-relaxed font-light italic">
                  "{testimonials[activeTestimonial].text}"
                </p>
                
                <div className="text-amber-400 font-bold text-xl mb-2">
                  {testimonials[activeTestimonial].author}
                </div>
                <div className="text-gray-300 text-lg">
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
                    index === activeTestimonial ? 'bg-amber-400 w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Story Section - Enhanced */}
      <section id="story" className="py-24 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-2xl opacity-20"></div>
                <img
                  src="https://picsum.photos/600/500?random=8"
                  alt="Traditional Craftsmanship"
                  className="relative w-full h-[500px] object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent rounded-3xl"></div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-10">From Desert to Mountains</h2>
              
              <div className="space-y-8 mb-12">
                <p className="text-2xl text-gray-600 leading-relaxed font-light">
                  Born from a sacred journey across India's diverse landscapes, we discovered the 
                  <span className="font-semibold text-amber-600"> ancient secrets</span> that transform 
                  simple materials into powerful wellness solutions.
                </p>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Every product carries the wisdom of generations, the purity of nature, and the 
                  promise of healthier, more harmonious living spaces.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                  <div className="text-3xl font-black text-amber-600 mb-2">Ancient</div>
                  <div className="text-gray-700 font-medium">Wisdom</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                  <div className="text-3xl font-black text-blue-600 mb-2">Modern</div>
                  <div className="text-gray-700 font-medium">Innovation</div>
                </div>
              </div>

              <Link href="/about" className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                <span className="text-xl">Discover Our Journey</span>
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-amber-900 to-orange-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-orange-600/20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-10">Ready for Transformation?</h2>
          <p className="text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Join our growing family of conscious homeowners who've chosen the path of 
            <span className="font-semibold text-amber-400"> natural living</span> and 
            <span className="font-semibold text-amber-400"> ancient wisdom</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link href="/contact" className="group px-12 py-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-full shadow-2xl hover:shadow-amber-500/25 transition-all duration-500 hover:scale-105">
              <span className="flex items-center gap-4 text-xl">
                <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Begin Your Journey
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
            
            <Link href="/gallery" className="px-12 py-6 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105">
              <span className="text-xl">View Gallery</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 