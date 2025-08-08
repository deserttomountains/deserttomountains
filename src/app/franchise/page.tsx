'use client';

import * as React from "react";
import { Button } from "@radix-ui/themes";
import { FaHandshake, FaHeadset, FaChartLine } from "react-icons/fa";

export default function FranchisePage() {
  // Form state
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    message: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/franchise-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ name: "", email: "", phone: "", city: "", state: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-4 bg-[#F5F2E8]">
      {/* Hero Section */}
      <section className="w-full max-w-5xl rounded-3xl overflow-hidden mb-16 shadow-xl bg-[#5E4E06] border border-[#E6C866]">
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#E6C866] drop-shadow-lg mb-4">
            Own a <span className="text-white">Desert to Mountains</span> Franchise
          </h1>
          <p className="text-xl md:text-2xl text-[#F5F2E8] mb-8 max-w-2xl mx-auto">
            Partner with a trusted, eco-conscious brand and bring authentic, sustainable living solutions to your city.
          </p>
          <Button asChild size="4" color="yellow" radius="full" className="shadow-lg text-lg px-8 py-3 bg-[#E6C866] text-[#5E4E06] hover:bg-white hover:text-[#5E4E06] border-2 border-[#E6C866]">
            <a href="#franchise-form" className="cursor-pointer" style={{ cursor: 'pointer' }}>Apply Now</a>
          </Button>
        </div>
      </section>

      {/* Why Franchise With Us */}
      <section className="w-full max-w-5xl mb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#2A2418] rounded-2xl shadow-lg p-8 flex flex-col items-center border border-[#E6C866]">
          <FaHandshake className="text-4xl text-[#E6C866] mb-4" />
          <h3 className="text-xl font-bold text-[#E6C866] mb-2">Proven Brand</h3>
          <p className="text-[#F5F2E8] text-center">Leverage our established reputation and loyal customer base to kickstart your business with confidence.</p>
        </div>
        <div className="bg-[#2A2418] rounded-2xl shadow-lg p-8 flex flex-col items-center border border-[#E6C866]">
          <FaHeadset className="text-4xl text-[#E6C866] mb-4" />
          <h3 className="text-xl font-bold text-[#E6C866] mb-2">Comprehensive Support</h3>
          <p className="text-[#F5F2E8] text-center">From training to marketing, we provide end-to-end support to ensure your franchise thrives.</p>
        </div>
        <div className="bg-[#2A2418] rounded-2xl shadow-lg p-8 flex flex-col items-center border border-[#E6C866]">
          <FaChartLine className="text-4xl text-[#E6C866] mb-4" />
          <h3 className="text-xl font-bold text-[#E6C866] mb-2">High Returns</h3>
          <p className="text-[#F5F2E8] text-center">Enjoy attractive margins and a scalable business model designed for long-term success.</p>
        </div>
      </section>

      {/* Steps to Get Started */}
      <section className="w-full max-w-3xl mb-20">
        <h2 className="text-3xl font-bold text-[#5E4E06] mb-10 text-center">How to Get Started</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#E6C866] flex items-center justify-center text-2xl font-bold text-[#5E4E06] mb-2 border-4 border-[#5E4E06]">1</div>
            <span className="text-[#2A2418] text-center">Fill out the franchise application form below.</span>
          </div>
          <div className="hidden md:block w-12 h-1 bg-[#E6C866] rounded-full" />
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#E6C866] flex items-center justify-center text-2xl font-bold text-[#5E4E06] mb-2 border-4 border-[#5E4E06]">2</div>
            <span className="text-[#2A2418] text-center">Our team will connect with you for an initial discussion and assessment.</span>
          </div>
          <div className="hidden md:block w-12 h-1 bg-[#E6C866] rounded-full" />
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#E6C866] flex items-center justify-center text-2xl font-bold text-[#5E4E06] mb-2 border-4 border-[#5E4E06]">3</div>
            <span className="text-[#2A2418] text-center">Complete training and launch your franchise business.</span>
          </div>
        </div>
      </section>

      {/* Franchise Application Form */}
      <section id="franchise-form" className="w-full max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-[#E6C866]">
          <h2 className="text-3xl font-bold text-[#5E4E06] mb-8 text-center">Apply for Franchise</h2>
          
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              Thank you for your interest! We'll get back to you within 24 hours.
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#2A2418] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#E6C866] rounded-lg focus:ring-2 focus:ring-[#5E4E06] focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#2A2418] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#E6C866] rounded-lg focus:ring-2 focus:ring-[#5E4E06] focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#2A2418] mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#E6C866] rounded-lg focus:ring-2 focus:ring-[#5E4E06] focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-[#2A2418] mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#E6C866] rounded-lg focus:ring-2 focus:ring-[#5E4E06] focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-[#2A2418] mb-2">
                  State *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-[#E6C866] rounded-lg focus:ring-2 focus:ring-[#5E4E06] focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-[#2A2418] mb-2">
                Why are you interested in a Desert to Mountains franchise? *
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-[#E6C866] rounded-lg focus:ring-2 focus:ring-[#5E4E06] focus:border-transparent"
                placeholder="Tell us about your interest in sustainable living and business experience..."
              />
            </div>
            
            <div className="text-center">
              <Button
                type="submit"
                size="4"
                color="yellow"
                radius="full"
                disabled={loading}
                className="shadow-lg text-lg px-12 py-4 bg-[#5E4E06] text-white hover:bg-[#4A3E05] disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
} 