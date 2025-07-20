"use client";
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
            <span className="text-[#2A2418] text-center">Complete onboarding, training, and launch your franchise!</span>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-xl text-center mb-8">
        <h3 className="text-2xl font-semibold text-[#5E4E06] mb-2">Ready to Start Your Journey?</h3>
        <p className="text-[#2A2418] mb-6">We’re excited to partner with passionate entrepreneurs like you. Fill out the application form below to get started.</p>
      </section>

      {/* Franchise Application Form */}
      <section id="franchise-form" className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#E6C866] p-8 mb-12">
        <h4 className="text-2xl font-bold text-[#5E4E06] mb-6 text-center">Franchise Application</h4>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-[#5E4E06] font-semibold mb-2">Full Name<span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} type="text" required className="w-full rounded-lg border border-[#E6C866] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E6C866] bg-[#F5F2E8] text-[#2A2418]" placeholder="Your Name" />
            </div>
            <div className="flex-1">
              <label className="block text-[#5E4E06] font-semibold mb-2">Email<span className="text-red-500">*</span></label>
              <input name="email" value={form.email} onChange={handleChange} type="email" required className="w-full rounded-lg border border-[#E6C866] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E6C866] bg-[#F5F2E8] text-[#2A2418]" placeholder="you@email.com" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-[#5E4E06] font-semibold mb-2">Phone<span className="text-red-500">*</span></label>
              <input name="phone" value={form.phone} onChange={handleChange} type="tel" required className="w-full rounded-lg border border-[#E6C866] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E6C866] bg-[#F5F2E8] text-[#2A2418]" placeholder="Your Phone Number" />
            </div>
            <div className="flex-1">
              <label className="block text-[#5E4E06] font-semibold mb-2">City<span className="text-red-500">*</span></label>
              <input name="city" value={form.city} onChange={handleChange} type="text" required className="w-full rounded-lg border border-[#E6C866] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E6C866] bg-[#F5F2E8] text-[#2A2418]" placeholder="Your City" />
            </div>
          </div>
          <div>
            <label className="block text-[#5E4E06] font-semibold mb-2">State<span className="text-red-500">*</span></label>
            <input name="state" value={form.state} onChange={handleChange} type="text" required className="w-full rounded-lg border border-[#E6C866] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E6C866] bg-[#F5F2E8] text-[#2A2418]" placeholder="Your State" />
          </div>
          <div>
            <label className="block text-[#5E4E06] font-semibold mb-2">Why do you want to open a franchise with us?<span className="text-red-500">*</span></label>
            <textarea name="message" value={form.message} onChange={handleChange} required rows={4} className="w-full rounded-lg border border-[#E6C866] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E6C866] bg-[#F5F2E8] text-[#2A2418] resize-none" placeholder="Tell us about your interest, experience, and vision..." />
          </div>
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
          {success && <div className="text-green-700 text-center font-semibold">Application submitted successfully!</div>}
          <div className="text-center pt-2">
            <Button asChild size="3" color="yellow" radius="full" className="shadow-md text-lg px-8 py-3 bg-[#E6C866] text-[#5E4E06] hover:bg-white hover:text-[#5E4E06] border-2 border-[#E6C866]">
              <button type="submit" className="cursor-pointer" style={{ cursor: 'pointer' }} disabled={loading}>{loading ? "Submitting..." : "Submit Application"}</button>
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
} 