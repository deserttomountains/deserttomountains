import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - Get in Touch | Desert to Mountains',
  description: 'Contact Desert to Mountains for natural building solutions. Get in touch for Aura plaster, Dhunee incense, sustainable construction materials, and eco-friendly home products.',
  keywords: 'contact Desert to Mountains, natural building solutions, eco-friendly products, sustainable construction, Aura plaster contact, Dhunee incense contact',
  openGraph: {
    title: 'Contact Us - Get in Touch | Desert to Mountains',
    description: 'Contact Desert to Mountains for natural building solutions. Get in touch for Aura plaster, Dhunee incense, sustainable construction materials, and eco-friendly home products.',
    type: 'website',
    url: 'https://deserttomountains.com/contact',
    siteName: 'Desert to Mountains',
    images: [
      {
        url: '/images/deserttomountains-4-scaled-1.webp',
        width: 1200,
        height: 630,
        alt: 'Contact Desert to Mountains - Natural Building Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - Get in Touch | Desert to Mountains',
    description: 'Contact Desert to Mountains for natural building solutions. Get in touch for Aura plaster, Dhunee incense, sustainable construction materials, and eco-friendly home products.',
    images: ['/images/deserttomountains-4-scaled-1.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://deserttomountains.com/contact',
  },
};

import ContactClient from './ContactClient';

export default function Contact() {
  return <ContactClient />;
} 