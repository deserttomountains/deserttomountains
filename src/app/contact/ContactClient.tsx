'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Sparkles, Mail, Phone, MapPin, Send, CheckCircle, Instagram, MessageCircle, ChevronDown, ChevronUp, Star } from 'lucide-react';

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'info@deserttomountains.com', href: 'mailto:info@deserttomountains.com' },
    { icon: Phone, label: 'Phone', value: '+91 98765 43210', href: 'tel:+919876543210' },
    { icon: MapPin, label: 'Address', value: 'Jodhpur, Rajasthan', href: null }
  ];

  const faqs = [
    { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days across India.' },
    { q: 'Do you offer installation services?', a: 'Yes, we provide professional installation services for Aura plaster.' },
    { q: 'Are your products safe for children?', a: 'Absolutely! All our products are 100% natural and child-safe.' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-white to-[#F0EDE4]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-[#5E4E06]/20 to-[#8B7A1A]/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-[#B8A94A]/30 to-[#5E4E06]/30 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-br from-[#8B7A1A]/25 to-[#B8A94A]/25 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-[#5E4E06]/10 via-white/80 to-[#8B7A1A]/10 pointer-events-none" />
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#2A2418] mb-4 flex items-center justify-center gap-2 sm:gap-3 relative z-10 drop-shadow-xl animate-fade-in-up">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#5E4E06] animate-pulse" /> Contact Us
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-[#2A2418]/70 max-w-2xl mx-auto font-medium relative z-10 animate-fade-in-up">
          We'd love to hear from you. Let's build something beautiful together.
        </p>
      </section>
      
      {/* Main Section: Modern Card Layout */}
      <section className="py-8 sm:py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start px-4 sm:px-6">
          {/* Left: Glassmorphism Contact Form */}
          <div className="bg-gradient-to-br from-[#F8F6F0]/80 to-[#F0EDE4]/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between border border-[#E8E4D8] relative overflow-hidden animate-fade-in-up">
            <div className="absolute -top-10 -left-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-[#5E4E06]/20 to-[#8B7A1A]/20 rounded-full blur-2xl opacity-60" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5E4E06] mb-6 sm:mb-8 z-10 relative">Send a Message</h2>
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center h-full z-10 relative">
                <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mb-2 animate-bounce" />
                <div className="text-lg sm:text-xl font-semibold text-green-700 mb-2">Message Sent!</div>
                <div className="text-gray-600 mb-4 text-center text-sm sm:text-base">Thank you for reaching out. We'll get back to you soon.</div>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition cursor-pointer text-sm sm:text-base"
                >Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 z-10 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`peer w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#5E4E06] placeholder:text-gray-700 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-[#B8A94A]'}`}
                      placeholder=" "
                      autoComplete="off"
                    />
                    <label className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base font-semibold pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#5E4E06] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 bg-white/80 px-1">
                      Full Name *
                    </label>
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`peer w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#5E4E06] placeholder:text-gray-700 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-[#B8A94A]'}`}
                      placeholder=" "
                      autoComplete="off"
                    />
                    <label className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base font-semibold pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#5E4E06] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 bg-white/80 px-1">
                      Email *
                    </label>
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="peer w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#5E4E06] border-gray-200 hover:border-[#B8A94A] placeholder:text-gray-700"
                      placeholder=" "
                      autoComplete="off"
                    />
                    <label className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm sm:text-base font-semibold pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#5E4E06] peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 bg-white/80 px-1">
                      Phone
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`peer w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#5E4E06] text-gray-800 ${errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-[#B8A94A]'}`}
                    >
                      <option value="" className="text-gray-700">Select a subject</option>
                      <option value="Product Inquiry" className="text-gray-800">Product Inquiry</option>
                      <option value="Project Consultation" className="text-gray-800">Project Consultation</option>
                      <option value="Bulk Order" className="text-gray-800">Bulk Order</option>
                      <option value="Partnership" className="text-gray-800">Partnership</option>
                      <option value="Support" className="text-gray-800">Support</option>
                      <option value="Other" className="text-gray-800">Other</option>
                    </select>
                    <label className="absolute left-3 sm:left-4 -top-3 text-xs text-[#5E4E06] bg-white/80 px-1 font-semibold">Subject *</label>
                    {errors.subject && <p className="text-xs text-red-600 mt-1">{errors.subject}</p>}
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className={`peer w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#5E4E06] resize-none placeholder:text-gray-700 ${errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-[#B8A94A]'}`}
                    placeholder=" "
                  />
                  <label className="absolute left-3 sm:left-4 top-3 sm:top-4 text-gray-500 text-sm sm:text-base font-semibold pointer-events-none transition-all duration-200 peer-focus:-top-3 peer-focus:text-xs peer-focus:text-[#5E4E06] peer-placeholder-shown:top-3 sm:peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm sm:peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 bg-white/80 px-1">
                    Message *
                  </label>
                  {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                  {isSubmitting ? 'Sending...' : 'Send'}
                </button>
              </form>
            )}
          </div>
          
          {/* Right: Info Card + Google Map */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <div className="bg-gradient-to-br from-[#F8F6F0]/80 to-[#F0EDE4]/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between border border-[#E8E4D8] animate-fade-in-up">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5E4E06] mb-4 sm:mb-6">Contact Details</h2>
              <div className="space-y-4 sm:space-y-5 mb-4 sm:mb-6">
                {contactInfo.map((info, idx) => (
                  <a
                    key={info.label}
                    href={info.href || undefined}
                    className="flex items-center gap-3 sm:gap-4 text-gray-800 hover:text-[#5E4E06] text-sm sm:text-lg group cursor-pointer"
                    target={info.href ? '_blank' : undefined}
                    rel={info.href ? 'noopener noreferrer' : undefined}
                  >
                    <info.icon className="w-5 h-5 sm:w-7 sm:h-7 text-[#5E4E06] group-hover:text-[#8B7A1A]" />
                    <span className="font-semibold">{info.label}:</span>
                    <span>{info.value}</span>
                  </a>
                ))}
              </div>
              <div className="mb-3 font-semibold text-gray-700 text-sm sm:text-lg">Connect with us:</div>
              <div className="flex gap-3 sm:gap-4 mb-4">
                <a
                  href="https://instagram.com/aura_natural.wall.plasters"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gradient-to-br from-[#5E4E06] to-[#8B7A1A] p-3 sm:p-4 text-white shadow-lg hover:scale-110 hover:shadow-2xl transition cursor-pointer"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5 sm:w-7 sm:h-7" />
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gradient-to-br from-[#8B7A1A] to-[#B8A94A] p-3 sm:p-4 text-white shadow-lg hover:scale-110 hover:shadow-2xl transition cursor-pointer"
                  title="WhatsApp"
                >
                  {/* Official WhatsApp SVG */}
                  <svg viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5 sm:w-7 sm:h-7" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.37L4 29l7.824-2.206C13.41 27.597 14.686 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.18 0-2.337-.232-3.424-.69l-.245-.104-4.646 1.31 1.242-4.53-.16-.234C7.26 18.13 6.5 16.6 6.5 15c0-5.238 4.262-9.5 9.5-9.5s9.5 4.262 9.5 9.5-4.262 9.5-9.5 9.5zm5.13-7.13c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.28.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.62-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.29-1 1-.97 2.43.03 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.22.69.24 1.23.38 1.65.48.69.16 1.32.14 1.82.08.56-.07 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/>
                    </g>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Google Maps Embed */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#E8E4D8] animate-fade-in-up">
              <div className="px-4 pt-4 pb-2 font-semibold text-gray-700 text-sm sm:text-lg">Find us on the map:</div>
              <iframe
                title="Desert to Mountains Location"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d114478.31923944691!2d73.084716!3d26.27959!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39418d39ccb37c4b%3A0x4257c9da08edcb14!2sDesert%20To%20Mountains!5e0!3m2!1sen!2sus!4v1750833061245!5m2!1sen!2sus"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
} 