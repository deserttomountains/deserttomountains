import type { Metadata } from 'next';
import React from "react";
import Navigation from '@/components/Navigation';
import { Truck, Package, DollarSign, Undo2, AlertCircle, Mail, MapPin, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping Policy - Delivery & Returns | Desert to Mountains',
  description: 'Learn about Desert to Mountains shipping policy, delivery times, tracking, and return procedures for our natural building products and organic incense across India.',
  keywords: 'Desert to Mountains shipping policy, delivery times, tracking, return procedures, natural products shipping, eco-friendly products delivery',
  openGraph: {
    title: 'Shipping Policy - Delivery & Returns | Desert to Mountains',
    description: 'Learn about Desert to Mountains shipping policy, delivery times, tracking, and return procedures for our natural building products and organic incense across India.',
    type: 'website',
    url: 'https://deserttomountains.com/shipping-policy',
    siteName: 'Desert to Mountains',
    images: [
      {
        url: '/images/shipping_1.webp',
        width: 1200,
        height: 630,
        alt: 'Desert to Mountains Shipping Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipping Policy - Delivery & Returns | Desert to Mountains',
    description: 'Learn about Desert to Mountains shipping policy, delivery times, tracking, and return procedures for our natural building products and organic incense across India.',
    images: ['/images/shipping_1.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://deserttomountains.com/shipping-policy',
  },
};

const sections = [
  {
    icon: <Package className="w-7 h-7 text-[#E6C866]" />, title: 'General',
    content: (
      <p>Subject to stock availability. We try to maintain accurate stock counts on our website but from time-to-time there may be a stock discrepancy and we will not be able to fulfill all your items at time of purchase. In this instance, we will fulfill the available products to you, and contact you about whether you would prefer to await restocking of the backordered item.</p>
    )
  },
  {
    icon: <DollarSign className="w-7 h-7 text-[#E6C866]" />, title: 'Shipping Costs',
    content: (
      <p>Shipping charges are calculated based on distance and order size, and will be conveyed to you after order confirmation. We work with multiple shipping providers to find the most cost-effective option for your location, ensuring minimal shipping charges. Payment for shipping can be made either upon delivery at your doorstep or before shipment, as per your preference.</p>
    )
  },
  {
    icon: <Undo2 className="w-7 h-7 text-[#E6C866]" />, title: 'Returns',
    content: (
      <>
        <h4 className="font-semibold mt-0 mb-1">Return Policy</h4>
        <p><strong>DESERT TO MOUNTAINS does not accept returns.</strong> All sales are final. We encourage customers to carefully review product descriptions, specifications, and images before placing an order.</p>
      </>
    )
  },
  {
    icon: <Truck className="w-7 h-7 text-[#E6C866]" />, title: 'Delivery Terms',
    content: (
      <ul className="list-disc ml-6">
        <li><strong>Transit Time Domestically:</strong> In general, domestic shipments are in transit for 2 – 7 days</li>
        <li><strong>Transit time Internationally:</strong> Generally, orders shipped internationally are in transit for 4 – 22 days. This varies greatly depending on the courier you have selected. We are able to offer a more specific estimate when you are choosing your courier at checkout.</li>
        <li><strong>Change Of Delivery Address:</strong> Orders will be dispatched within a time of a week. Our warehouse operates on Monday – Friday during standard business hours, except on national holidays at which time the warehouse will be closed. In these instances, we take steps to ensure shipment delays will be kept to a minimum.</li>
        <li><strong>Change Of Delivery Address:</strong> For change of delivery address requests, we are able to change the address at any time before the order has been dispatched.</li>
        <li><strong>Items Out Of Stock:</strong> If an item is out of stock, we will wait for the item to be available before dispatching your order. Existing items in the order will be reserved while we await this item.</li>
        <li><strong>Delivery Time Exceeded:</strong> If delivery time has exceeded the forecasted time, please contact us so that we can conduct an investigation.</li>
      </ul>
    )
  },
  {
    icon: <MapPin className="w-7 h-7 text-[#E6C866]" />, title: 'Tracking Notifications',
    content: (
      <p>Upon dispatch, customers will receive a tracking updates through Email/whatsapp/SMS, from which they will be able to follow the progress of their shipment based on the latest updates made available by the shipping provider.</p>
    )
  },
  {
    icon: <Shield className="w-7 h-7 text-[#E6C866]" />, title: 'Duties & Taxes',
    content: (
      <p><strong>GST:</strong> Goods and Service tax has already been applied to the price of goods.</p>
    )
  },
  {
    icon: <AlertCircle className="w-7 h-7 text-[#E6C866]" />, title: 'Cancellations',
          content: (
        <p>Once we have received your confirmed order and payment, the order cannot be cancelled or refunded. We encourage customers to carefully review their order details before confirming the purchase.</p>
      )
  },
  {
    icon: <Mail className="w-7 h-7 text-[#E6C866]" />, title: 'Customer Service',
    content: (
      <ul className="list-disc ml-6">
        <li>Email: <a href="mailto:contact@deserttomountains.com" className="text-[#5E4E06] underline">contact@deserttomountains.com</a></li>
        <li>Phone: <a href="tel:+918171189456" className="text-[#5E4E06] underline">+91 81711 89456</a></li>
      </ul>
    )
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-[#E8E4D8]">
      <Navigation />
      {/* Hero Section */}
      <section className="relative w-full h-64 flex items-center justify-center bg-cover bg-bottom" style={{backgroundImage: 'url(/images/shipping_1.webp)'}}>
        <div className="absolute inset-0 bg-[#5E4E06]/70" />
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-extrabold text-white drop-shadow mb-2">Shipping Policy</h1>
          <p className="text-lg text-[#E6C866] font-medium drop-shadow">Fast, reliable delivery across India. Learn about our shipping process.</p>
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