import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Our Story & Founder | Desert to Mountains',
  description: 'Meet Divyveer Singh Bhati, founder of Desert to Mountains. Discover our mission to create sustainable, natural building solutions that honor traditional Indian wisdom and modern innovation.',
  keywords: 'Desert to Mountains founder, Divyveer Singh Bhati, sustainable building, ecological architecture, natural construction, traditional Indian building practices',
  openGraph: {
    title: 'About Us - Our Story & Founder | Desert to Mountains',
    description: 'Meet Divyveer Singh Bhati, founder of Desert to Mountains. Discover our mission to create sustainable, natural building solutions that honor traditional Indian wisdom and modern innovation.',
    type: 'website',
    url: 'https://deserttomountains.com/about',
    siteName: 'Desert to Mountains',
    images: [
      {
        url: '/images/founder.jpg',
        width: 1200,
        height: 630,
        alt: 'Divyveer Singh Bhati - Founder of Desert to Mountains',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Our Story & Founder | Desert to Mountains',
    description: 'Meet Divyveer Singh Bhati, founder of Desert to Mountains. Discover our mission to create sustainable, natural building solutions that honor traditional Indian wisdom and modern innovation.',
    images: ['/images/founder.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://deserttomountains.com/about',
  },
};

import AboutClient from './AboutClient';

export default function AboutPage() {
  // Person schema markup for founder
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Divyveer Singh Bhati",
    "jobTitle": "Founder & CEO",
    "worksFor": {
      "@type": "Organization",
      "name": "Desert to Mountains"
    },
    "description": "Passionate advocate for ecological architecture and sustainable living. Founder of Desert to Mountains, dedicated to reviving ancient building practices through modern, sustainable innovation.",
    "image": "https://deserttomountains.com/images/founder.jpg",
    "url": "https://deserttomountains.com/about",
    "sameAs": [
      "https://linkedin.com/in/divyveer-singh-bhati",
      "https://twitter.com/divyveer_bhati"
    ],
    "knowsAbout": [
      "Ecological Architecture",
      "Sustainable Building",
      "Natural Construction Materials",
      "Traditional Indian Building Practices",
      "Gypsum Plaster",
      "Organic Building Solutions"
    ],
    "award": [
      "Sustainable Innovation Award",
      "Green Building Excellence"
    ],
    "alumniOf": {
      "@type": "Organization",
      "name": "Architecture Institute"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressRegion": "Rajasthan"
    }
  };

  // Organization schema for the company
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Desert to Mountains",
    "description": "Natural, sustainable living solutions from the Thar Desert to the Himalayas. Eco-friendly plasters, incense, and more for a healthier home and planet.",
    "url": "https://deserttomountains.com",
    "logo": "https://deserttomountains.com/desert-to-mountains-logo.webp",
    "image": "https://deserttomountains.com/images/deserttomountains-4-scaled-1.webp",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Divyveer Singh Bhati"
    },
    "mission": "To revive ancient building practices through modern, sustainable innovation and create eco-conscious materials that honor our ecological heritage.",
    "slogan": "Think Natural, Build Better",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-81711-89456",
      "contactType": "customer service",
      "email": "deserttomountains@gmail.com"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN",
      "addressRegion": "Rajasthan"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <AboutClient />
    </>
  );
} 