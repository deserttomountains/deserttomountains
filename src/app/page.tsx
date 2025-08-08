import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Desert to Mountains',
  description: 'Transform your home with Desert to Mountains natural building solutions. Eco-friendly gypsum plaster, organic incense, and sustainable construction materials for healthier living spaces.',
  keywords: 'natural plaster, eco-friendly building materials, sustainable construction, gypsum plaster, organic incense, healthy homes, green building',
  openGraph: {
    title: 'Home | Desert to Mountains',
    description: 'Transform your home with Desert to Mountains natural building solutions. Eco-friendly gypsum plaster, organic incense, and sustainable construction materials for healthier living spaces.',
    type: 'website',
    url: 'https://deserttomountains.com',
    siteName: 'Desert to Mountains',
    images: [
      {
        url: '/images/deserttomountains-4-scaled-1.webp',
        width: 1200,
        height: 630,
        alt: 'Desert to Mountains - Natural Building Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home | Desert to Mountains',
    description: 'Transform your home with Desert to Mountains natural building solutions. Eco-friendly gypsum plaster, organic incense, and sustainable construction materials for healthier living spaces.',
    images: ['/images/deserttomountains-4-scaled-1.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://deserttomountains.com',
  },
};

import HomeClient from './pageClient';

export default function Home() {
  return <HomeClient />;
} 