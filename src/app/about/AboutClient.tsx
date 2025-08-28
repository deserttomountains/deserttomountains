'use client';

import Navigation from '@/components/Navigation';
import { 
  User, 
  Target, 
  Heart, 
  Leaf, 
  Building, 
  ArrowRight, 
  Quote,
  Globe,
  Shield,
  Sparkles,
  Star,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section - About Page Specific */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-white via-[#F8F6F0] to-[#F0EDE4] relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%235E4E06' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569-13.431-30-30-30v60c16.569 0 30-13.431 30-30zm0 0c0 16.569 13.431 30 30 30V0c-16.569 0-30 13.431-30 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-gradient-to-br from-[#5E4E06]/10 to-[#8B7A1A]/10 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute bottom-32 right-20 w-32 h-32 bg-gradient-to-br from-[#B8A94A]/10 to-[#5E4E06]/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#5E4E06]/10 to-[#8B7A1A]/10 text-[#5E4E06] rounded-full text-sm font-semibold mb-8">
                <User className="w-4 h-4" />
                <span>About Us</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#2A2418] mb-8 leading-tight">
                The Story
                <span className="block text-transparent bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text">
                  Behind the Vision
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-[#2A2418]/70 leading-relaxed mb-10">
                From one man's passion for sustainable living to a movement
                that's transforming the construction industry with ancient
                wisdom and modern innovation.
              </p>

              {/* Key Points */}
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] rounded-full"></div>
                  <span className="text-[#2A2418]/80 font-medium">
                    Founded on principles of ecological conservation
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] rounded-full"></div>
                  <span className="text-[#2A2418]/80 font-medium">
                    Rooted in traditional Indian building practices
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] rounded-full"></div>
                  <span className="text-[#2A2418]/80 font-medium">
                    Committed to 100% natural, healthy solutions
                  </span>
                </div>
              </div>

              <Link
                href="#founder"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">Meet Our Founder</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right Side - Visual Element */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl blur-2xl opacity-20 scale-105"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-[#E8E4D8] shadow-2xl">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Building className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-[#2A2418] mb-4">
                    Desert to Mountains
                  </h3>
                  <p className="text-lg text-[#2A2418]/70 mb-6">
                    Transforming construction with sustainable, natural
                    solutions
                  </p>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl">
                      <div className="text-2xl font-black text-[#5E4E06] mb-1">
                        100%
                      </div>
                      <div className="text-[#2A2418]/70 font-medium text-sm">
                        Natural Materials
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-[#F8F6F0] to-[#F0EDE4] rounded-2xl">
                      <div className="text-2xl font-black text-[#5E4E06] mb-1">
                        Zero
                      </div>
                      <div className="text-[#2A2418]/70 font-medium text-sm">
                        Harmful Chemicals
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section - Balanced Layout */}
      <section
        id="founder"
        className="relative py-32 bg-gradient-to-br from-[#F8F6F0] via-white to-[#F0EDE4] overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%235E4E06' fill-opacity='0.1'%3E%3Cpath d='M50 50c0-27.614-22.386-50-50-50v100c27.614 0 50-22.386 50-50zm0 0c0 27.614 22.386 50 50 50V0c-27.614 0-50 22.386-50 50z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#5E4E06]/10 to-[#8B7A1A]/10 text-[#5E4E06] rounded-full text-sm font-semibold mb-6">
              <Star className="w-4 h-4" />
              <span>Meet Our Founder</span>
              <Star className="w-4 h-4" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-[#2A2418] mb-6">
              The Visionary Behind
              <span className="block text-transparent bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] bg-clip-text">
                Desert to Mountains
              </span>
            </h2>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left Side - Photo & Quote */}
            <div className="order-2 lg:order-1">
              <div className="relative mb-8">
                {/* Clean, Elegant Photo Container */}
                <div className="relative flex justify-center">
                  {/* Photo with rounded edges and shadow */}
                  <div className="relative">
                    <img
                      src="/images/founder.jpg"
                      alt="Divyveer Singh Bhati - Founder"
                      className="w-80 h-auto object-contain rounded-3xl shadow-xl"
                    />
                  </div>
                </div>

                {/* Clean Name Card */}
                <div className="mt-8 text-center">
                  <h3 className="text-3xl font-bold text-[#2A2418] mb-2">
                    Divyveer Singh Bhati
                  </h3>
                  <p className="text-[#5E4E06] font-semibold text-xl mb-4">
                    Founder & CEO
                  </p>
                </div>
              </div>

              {/* Quote Card */}
              <div className="relative p-6 bg-white rounded-3xl shadow-xl border border-[#E8E4D8]">
                <Quote className="w-10 h-10 text-[#5E4E06] mb-4" />
                <blockquote className="text-2xl font-light text-[#2A2418] italic leading-relaxed mb-4">
                  "For the society and conservation of natural resources, For
                  natural landscapes and our environment,"
                </blockquote>
                <div className="text-right text-[#5E4E06] font-semibold">
                  — Divyveer Singh Bhati
                </div>
              </div>
            </div>

            {/* Right Side - Bio Content */}
            <div className="order-1 lg:order-2">
              <div className="space-y-6">
                {/* Background & Vision */}
                <div className="relative p-8 bg-gradient-to-br from-[#F8F6F0] to-white rounded-2xl border-l-4 border-[#5E4E06] shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-[#2A2418] mb-3">
                        The Visionary
                      </h4>
                      <p className="text-[#2A2418]/80 leading-relaxed">
                        Divyveer Singh Bhati, the visionary behind Desert to
                        Mountains, champions ecological conservation and
                        sustainable living. With deep reverence for India's
                        traditional practices, he founded Aura as a response to
                        today's chemically-driven construction industry.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Philosophy */}
                <div className="relative p-8 bg-gradient-to-br from-[#F8F6F0] to-white rounded-2xl border-l-4 border-[#8B7A1A] shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#8B7A1A] to-[#B8A94A] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-[#2A2418] mb-3">
                        His Philosophy
                      </h4>
                      <p className="text-[#2A2418]/80 leading-relaxed">
                        For Divyveer,{" "}
                        <strong className="text-[#5E4E06]">
                          sustainability is not just an idea—it's a way of life
                        </strong>
                        . His mission is to reconnect people with nature through
                        mindful, ethical, and scalable building solutions that
                        honor both tradition and innovation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Global Impact */}
                <div className="relative p-8 bg-gradient-to-br from-[#F8F6F0] to-white rounded-2xl border-l-4 border-[#B8A94A] shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#B8A94A] to-[#5E4E06] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-[#2A2418] mb-3">
                        Global Vision
                      </h4>
                      <p className="text-[#2A2418]/80 leading-relaxed">
                        He envisions a world where every wall becomes a
                        statement of purity, every home a sanctuary of health,
                        and every structure a contribution to environmental
                        balance. His dream:
                        <strong className="text-[#5E4E06]">
                          {" "}
                          to make natural, healthy living beautifully practical
                          for everyone
                        </strong>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Centered */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <User className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Connect with Divyveer</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/aura"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 border-2 border-[#5E4E06] text-[#5E4E06] font-bold rounded-full hover:bg-[#5E4E06] hover:text-white transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                <span>Explore Aura</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Do What We Do - Split Section */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Content */}
          <div className="bg-gradient-to-br from-[#2A2418] to-[#5E4E06] text-white p-16 lg:p-24 flex items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-sm font-semibold mb-8">
                <Heart className="w-4 h-4" />
                Our Purpose
              </div>

              <h2 className="text-4xl md:text-5xl font-black mb-8">
                Why We Do
                <span className="block text-[#E6C866]">What We Do?</span>
              </h2>

              <div className="space-y-6 text-lg leading-relaxed opacity-90">
                <p>
                  <strong className="text-[#E6C866]">
                    Natural earthen plasters
                  </strong>{" "}
                  emerge as clear winners, defeating sand-cement plaster by a
                  long stretch.
                </p>

                <p>
                  Earthen plasters bridge the gulf between stellar masonry and
                  beautiful, cosy wall surfaces. They close the gap between
                  cold, emotionless concrete and your warmth-inducing living
                  room.
                </p>

                <p>
                  Such organic-material based plasters aren't just great for the
                  environment—
                  <strong className="text-[#E6C866]">
                    they're good for you and your overall wellness
                  </strong>
                  .
                </p>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-black text-[#E6C866] mb-2">
                    100%
                  </div>
                  <div className="text-sm opacity-80">Natural Materials</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-[#E6C866] mb-2">
                    0%
                  </div>
                  <div className="text-sm opacity-80">Harmful Chemicals</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative h-96 lg:h-auto">
            <img
              src="/images/aura.webp"
              alt="Natural Plaster Application"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#2A2418]/20"></div>
          </div>
        </div>
      </section>

      {/* Our Dream - Final Section */}
      <section className="py-32 bg-gradient-to-br from-[#F8F6F0] via-white to-[#F0EDE4] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-[#B8A94A] to-[#5E4E06] rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="mb-16">
            <Globe className="w-20 h-20 text-[#5E4E06] mx-auto mb-8" />
            <h2 className="text-5xl md:text-6xl font-black text-[#2A2418] mb-8">
              Our Dream
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] mx-auto"></div>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <p className="text-2xl md:text-3xl text-[#2A2418]/80 leading-relaxed font-light">
              Our dream to keep Mother Earth safe, and help realtors and
              property owners create well-laid, foundationally strong and
              aesthetically-attractive spaces to live, work and play, led us to
              create
              <span className="font-bold text-[#5E4E06]"> Aura</span>—an
              innovative gypsum-based natural plaster.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="group p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-[#E8E4D8] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <Shield className="w-16 h-16 text-[#5E4E06] mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-black text-[#2A2418] mb-4">
                100% Healthy
              </h3>
              <p className="text-[#2A2418]/70 leading-relaxed">
                Safe and beneficial for all family members and living spaces
              </p>
            </div>

            <div className="group p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-[#E8E4D8] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <Building className="w-16 h-16 text-[#5E4E06] mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-black text-[#2A2418] mb-4">
                Foundationally Strong
              </h3>
              <p className="text-[#2A2418]/70 leading-relaxed">
                Durable, long-lasting construction that stands the test of time
              </p>
            </div>

            <div className="group p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-[#E8E4D8] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <Sparkles className="w-16 h-16 text-[#5E4E06] mx-auto mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-black text-[#2A2418] mb-4">
                Aesthetically Attractive
              </h3>
              <p className="text-[#2A2418]/70 leading-relaxed">
                Beautiful, natural finishes that enhance any architectural style
              </p>
            </div>
          </div>

          {/* Final Quote */}
          <div className="relative max-w-3xl mx-auto p-8 bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] rounded-3xl text-white shadow-2xl">
            <Target className="w-12 h-12 mx-auto mb-6 text-[#E6C866]" />
            <p className="text-2xl md:text-3xl font-light leading-relaxed">
              "To make natural, healthy living not just possible, but
              <span className="font-bold text-[#E6C866]">
                {" "}
                beautifully practical for everyone
              </span>
              ."
            </p>
            <div className="mt-6 text-[#E6C866] font-semibold">
              — Divyveer Singh Bhati
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#2A2418] via-[#5E4E06] to-[#8B7A1A] text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            Ready to Transform Your Space?
          </h2>
          <p className="text-xl md:text-2xl mb-12 opacity-90 leading-relaxed">
            Join thousands who have chosen the path of natural, sustainable
            living with Desert to Mountains.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/aura"
              className="group px-10 py-5 bg-white text-[#2A2418] font-bold rounded-full hover:bg-[#E6C866] transition-all duration-300 hover:scale-105 relative overflow-hidden"
            >
              <span className="flex items-center gap-3 text-lg">
                <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                Explore Aura Products
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/contact"
              className="px-10 py-5 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <span className="text-lg">Get In Touch</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 