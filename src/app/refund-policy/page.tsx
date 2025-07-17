import React from "react";
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Undo2, Package, CheckCircle, AlertCircle, Mail, Info } from 'lucide-react';

const sections = [
  {
    icon: <Undo2 className="w-7 h-7 text-[#E6C866]" />, title: 'Returns',
    content: (
      <>
        <p>Our policy lasts <span className="font-semibold text-[#5E4E06]">2 days</span>. If 2 days have gone by since your purchase, unfortunately we can’t offer you a refund or exchange unless the product is defective or damaged.</p>
        <p>To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.</p>
        <p>Several types of goods are exempt from being returned, such as perishable goods, custom products, and digital downloads.</p>
      </>
    )
  },
  {
    icon: <CheckCircle className="w-7 h-7 text-[#E6C866]" />, title: 'Refunds (if applicable)',
    content: (
      <>
        <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.</p>
        <p>If you are approved, then your refund will be processed, and a credit will automatically be applied to your original method of payment, within a certain amount of days.</p>
      </>
    )
  },
  {
    icon: <Package className="w-7 h-7 text-[#E6C866]" />, title: 'Late or Missing Refunds',
    content: (
      <>
        <p>If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted. Next contact your bank. There is often some processing time before a refund is posted. If you’ve done all of this and you still have not received your refund yet, please contact us at <a href="mailto:deserttomountains@gmail.com" className="text-[#5E4E06] underline">deserttomountains@gmail.com</a>.</p>
      </>
    )
  },
  {
    icon: <AlertCircle className="w-7 h-7 text-[#E6C866]" />, title: 'Sale Items',
    content: (
      <p>Only regular priced items may be refunded, unfortunately sale items cannot be refunded.</p>
    )
  },
  {
    icon: <Info className="w-7 h-7 text-[#E6C866]" />, title: 'Exchanges',
    content: (
      <p>We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <a href="mailto:deserttomountains@gmail.com" className="text-[#5E4E06] underline">deserttomountains@gmail.com</a>.</p>
    )
  },
  {
    icon: <Mail className="w-7 h-7 text-[#E6C866]" />, title: 'Contact',
    content: (
      <ul className="list-disc ml-6">
        <li>Email: <a href="mailto:deserttomountains@gmail.com" className="text-[#5E4E06] underline">deserttomountains@gmail.com</a></li>
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
      <section className="relative w-full h-64 flex items-center justify-center bg-cover bg-center" style={{backgroundImage: 'url(/images/gallery/4.webp)'}}>
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
      <Footer />
    </div>
  );
} 