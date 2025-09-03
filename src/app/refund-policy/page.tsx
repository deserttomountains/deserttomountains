import type { Metadata } from 'next';
import React from "react";
import Navigation from '@/components/Navigation';
import { Undo2, Package, CheckCircle, AlertCircle, Mail, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Refund Policy - Return & Exchange Terms | Desert to Mountains',
  description: 'Learn about Desert to Mountains refund and return policy. 2-day return window, warranty claims, and exchange terms for our natural building products and organic incense.',
  keywords: 'Desert to Mountains refund policy, return policy, exchange terms, warranty claims, natural products returns, eco-friendly products refund',
  openGraph: {
    title: 'Refund Policy - Return & Exchange Terms | Desert to Mountains',
    description: 'Learn about Desert to Mountains refund and return policy. 2-day return window, warranty claims, and exchange terms for our natural building products and organic incense.',
    type: 'website',
    url: 'https://deserttomountains.com/refund-policy',
    siteName: 'Desert to Mountains',
    images: [
      {
        url: '/images/gallery/60.webp',
        width: 1200,
        height: 630,
        alt: 'Desert to Mountains Refund Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refund Policy - Return & Exchange Terms | Desert to Mountains',
    description: 'Learn about Desert to Mountains refund and return policy. 2-day return window, warranty claims, and exchange terms for our natural building products and organic incense.',
    images: ['/images/gallery/60.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://deserttomountains.com/refund-policy',
  },
};

const sections = [
  {
    icon: <Undo2 className="w-7 h-7 text-[#E6C866]" />, title: 'No Refund Policy',
    content: (
      <>
        <p><strong>DESERT TO MOUNTAINS does not provide refunds in any case.</strong> All sales are final once the order is confirmed and payment is received.</p>
        <p>We encourage customers to carefully review product descriptions, specifications, and images before placing an order to ensure complete satisfaction with their purchase.</p>
      </>
    )
  },
  {
    icon: <CheckCircle className="w-7 h-7 text-[#E6C866]" />, title: 'Order Confirmation',
    content: (
      <>
        <p>Once your order is confirmed and payment is processed, the transaction is considered final. We do not accept cancellations, returns, or refunds under any circumstances.</p>
        <p>Please ensure all order details are correct before confirming your purchase, as changes cannot be made after order confirmation.</p>
      </>
    )
  },
  {
    icon: <Package className="w-7 h-7 text-[#E6C866]" />, title: 'Product Quality Assurance',
    content: (
      <>
        <p>We maintain strict quality control standards to ensure all products meet our high standards before shipment. All products are carefully inspected and packaged to prevent damage during transit.</p>
        <p>If you receive a damaged product due to shipping issues, please contact us immediately for assistance, though this does not qualify for a refund.</p>
      </>
    )
  },
  {
    icon: <AlertCircle className="w-7 h-7 text-[#E6C866]" />, title: 'Customer Responsibility',
    content: (
      <p>Customers are responsible for reviewing product information, understanding product specifications, and ensuring the product meets their requirements before placing an order. We provide detailed product descriptions and images to help with informed decision-making.</p>
    )
  },
  {
    icon: <Info className="w-7 h-7 text-[#E6C866]" />, title: 'Contact Information',
    content: (
      <p>If you have any questions about our products or need assistance with your order, please contact our customer service team. While we cannot provide refunds, we are committed to helping you with any product-related inquiries.</p>
    )
  },
  {
    icon: <Mail className="w-7 h-7 text-[#E6C866]" />, title: 'Contact',
    content: (
      <ul className="list-disc ml-6">
        <li>Email: <a href="mailto:contact@deserttomountains.com" className="text-[#5E4E06] underline">contact@deserttomountains.com</a></li>
        <li>Phone: <a href="tel:+918171189456" className="text-[#5E4E06] underline">+91 81711 89456</a></li>
      </ul>
    )
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-[#E8E4D8]">
      <Navigation />
      {/* Hero Section */}
      <section className="relative w-full h-64 flex items-center justify-center bg-cover bg-center" style={{backgroundImage: 'url(/images/gallery/60.webp)'}}>
        <div className="absolute inset-0 bg-[#5E4E06]/70" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold text-white drop-shadow mb-2">Refund Policy</h1>
          <p className="text-lg text-[#E6C866] font-medium drop-shadow">Shop with confidence. Learn about our return & refund process.</p>
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
    </div>
  );
} 