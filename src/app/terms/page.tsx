import React from "react";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Info, FileText, UserCheck, Shield, Edit3, AlertCircle, RefreshCcw, Gavel, Mail } from 'lucide-react';

const sections = [
  {
    icon: <Info className="w-7 h-7 text-[#E6C866]" />, title: 'Introduction',
    content: (
      <p>Welcome to Desert to Mountains. By accessing or using our website, you agree to be bound by these Terms & Conditions. Please read them carefully before using our services.</p>
    )
  },
  {
    icon: <FileText className="w-7 h-7 text-[#E6C866]" />, title: 'Intellectual Property',
    content: (
      <p>All content, trademarks, and data on this website, including but not limited to software, databases, text, graphics, icons, hyperlinks, private information, designs, and agreements, are the property of or licensed to Desert to Mountains and as such are protected from infringement by local and international legislation and treaties.</p>
    )
  },
  {
    icon: <UserCheck className="w-7 h-7 text-[#E6C866]" />, title: 'Use of Site',
    content: (
      <p>You may use this site only for lawful purposes and in accordance with these Terms. You agree not to use the site in any way that violates any applicable law or regulation.</p>
    )
  },
  {
    icon: <Edit3 className="w-7 h-7 text-[#E6C866]" />, title: 'Product Information',
    content: (
      <p>We strive to ensure that all details, descriptions, and prices of products appearing on this website are accurate. However, errors may occur. We reserve the right to refuse orders where product information has been incorrectly published, including prices and promotions.</p>
    )
  },
  {
    icon: <Shield className="w-7 h-7 text-[#E6C866]" />, title: 'Limitation of Liability',
    content: (
      <p>Desert to Mountains will not be liable for any direct, indirect, incidental, special, or consequential damages that result from the use or inability to use the website or services.</p>
    )
  },
  {
    icon: <RefreshCcw className="w-7 h-7 text-[#E6C866]" />, title: 'Changes to Terms',
    content: (
      <p>We reserve the right to update or modify these Terms & Conditions at any time without prior notice. Your use of the website following any such change constitutes your agreement to follow and be bound by the Terms & Conditions as changed.</p>
    )
  },
  {
    icon: <Gavel className="w-7 h-7 text-[#E6C866]" />, title: 'Governing Law',
    content: (
      <p>These Terms & Conditions are governed by and construed in accordance with the laws of India. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of India.</p>
    )
  },
  {
    icon: <Mail className="w-7 h-7 text-[#E6C866]" />, title: 'Contact Information',
    content: (
      <ul className="list-disc ml-6">
        <li>Company Name: Desert to Mountains</li>
        <li>Email: <a href="mailto:deserttomountains@gmail.com" className="text-[#5E4E06] underline">deserttomountains@gmail.com</a></li>
        <li>Phone: <a href="tel:+918171189456" className="text-[#5E4E06] underline">+91 81711 89456</a></li>
      </ul>
    )
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-[#E8E4D8]">
      <Navigation />
      {/* Hero Section */}
      <section className="relative w-full h-64 flex items-center justify-center bg-cover bg-center" style={{backgroundImage: 'url(/images/gallery/2.webp)'}}>
        <div className="absolute inset-0 bg-[#5E4E06]/70" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold text-white drop-shadow mb-2">Terms & Conditions</h1>
          <p className="text-lg text-[#E6C866] font-medium drop-shadow">Please read our terms before using our website or services.</p>
        </div>
      </section>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white/90 rounded-2xl shadow-lg p-6 flex items-start gap-4 border border-[#E6C866]/30">
              <div className="mt-1">{section.icon}</div>
              <div>
                <h3 className="text-xl font-semibold text-[#5E4E06] mb-2 flex items-center gap-2">{section.title}</h3>
                <div className="text-[#2A2418] prose prose-sm max-w-none">{section.content}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
} 