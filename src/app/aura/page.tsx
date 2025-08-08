import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aura Natural Plaster - Eco-Friendly Wall Solution | Desert to Mountains',
  description: 'Discover Aura natural plaster - 100% eco-friendly gypsum and cow dung based wall plaster. Breathable, toxin-free, and healthy for your home. Transform your walls naturally.',
  keywords: 'Aura natural plaster, gypsum plaster, cow dung plaster, eco-friendly wall plaster, natural wall finish, healthy home materials, breathable plaster',
  openGraph: {
    title: 'Aura Natural Plaster - Eco-Friendly Wall Solution | Desert to Mountains',
    description: 'Discover Aura natural plaster - 100% eco-friendly gypsum and cow dung based wall plaster. Breathable, toxin-free, and healthy for your home. Transform your walls naturally.',
    type: 'website',
    url: 'https://deserttomountains.com/aura',
    siteName: 'Desert to Mountains',
    images: [
      {
        url: '/images/aura.webp',
        width: 1200,
        height: 630,
        alt: 'Aura Natural Plaster - Eco-Friendly Wall Solution',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aura Natural Plaster - Eco-Friendly Wall Solution | Desert to Mountains',
    description: 'Discover Aura natural plaster - 100% eco-friendly gypsum and cow dung based wall plaster. Breathable, toxin-free, and healthy for your home. Transform your walls naturally.',
    images: ['/images/aura.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://deserttomountains.com/aura',
  },
};

import AuraClient from './AuraClient';

export default function AuraPage() {
  // Product schema markup for Aura
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Aura Natural Plaster",
    "description": "100% eco-friendly gypsum and cow dung based wall plaster. Breathable, toxin-free, and healthy for your home. Transform your walls naturally.",
    "image": [
      "https://deserttomountains.com/images/aura.webp",
      "https://deserttomountains.com/images/aura_1.webp",
      "https://deserttomountains.com/images/aura-on-site-1-1.webp"
    ],
    "brand": {
      "@type": "Brand",
      "name": "Desert to Mountains"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Desert to Mountains"
    },
    "category": "Building Materials",
    "material": ["Gypsum", "Cow Dung", "Natural Pigments"],
    "color": [
      "Natural White", "Thar Grey", "Amber Rust", "Pushkar Sunset", 
      "Rose Quartz", "Jaisalmer Dune", "Sandstone Dust", "Udaipur Terracotta",
      "Aravalli Green", "Kishangarh Lime", "Almond Biege", "Rajasthan Ochre", "Jodhpur Blue"
    ],
    "offers": {
      "@type": "Offer",
      "price": "499",
      "priceCurrency": "INR",
      "priceValidUntil": "2024-12-31",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Desert to Mountains"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Priya Sharma"
        },
        "reviewBody": "Amazing natural plaster! My walls feel so much better and the air quality has improved significantly."
      }
    ],
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Coverage",
        "value": "125 sq ft per 25kg pack"
      },
      {
        "@type": "PropertyValue",
        "name": "Weight",
        "value": "25kg"
      },
      {
        "@type": "PropertyValue",
        "name": "Eco-Friendly",
        "value": "100% Natural"
      },
      {
        "@type": "PropertyValue",
        "name": "Breathable",
        "value": "Yes"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <AuraClient />
    </>
  );
} 