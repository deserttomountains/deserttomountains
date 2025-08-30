import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dhunee Organic Incense - Himalayan Herbs | Desert to Mountains',
  description: 'Experience Dhunee organic incense crafted from Himalayan herbs, desi cow dung, and pure ghee. Traditional Vedic purification for peaceful ambiance and natural wellness.',
  keywords: 'Dhunee incense, organic incense, Himalayan herbs, Vedic incense, natural purification, cow dung incense, traditional Indian incense, spiritual wellness',
  openGraph: {
    title: 'Dhunee Organic Incense - Himalayan Herbs | Desert to Mountains',
    description: 'Experience Dhunee organic incense crafted from Himalayan herbs, desi cow dung, and pure ghee. Traditional Vedic purification for peaceful ambiance and natural wellness.',
    type: 'website',
    url: 'https://deserttomountains.com/dhunee',
    siteName: 'Desert to Mountains',
    images: [
      {
        url: '/images/dhunee.webp',
        width: 1200,
        height: 630,
        alt: 'Dhunee Organic Incense - Himalayan Herbs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dhunee Organic Incense - Himalayan Herbs | Desert to Mountains',
    description: 'Experience Dhunee organic incense crafted from Himalayan herbs, desi cow dung, and pure ghee. Traditional Vedic purification for peaceful ambiance and natural wellness.',
    images: ['/images/dhunee.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://deserttomountains.com/dhunee',
  },
};

import DhuneeClient from './DhuneeClient';

export default function DhuneePage() {
  // Product schema markup for Dhunee
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Dhunee Organic Incense",
    "description": "Traditional Vedic incense crafted from Himalayan herbs, desi cow dung, and pure ghee for natural purification and spiritual wellness.",
    "image": [
      "https://deserttomountains.com/images/dhunee.webp",
      "https://deserttomountains.com/images/dhunee_1.webp",
      "https://deserttomountains.com/images/dhunee_2.webp"
    ],
    "brand": {
      "@type": "Brand",
      "name": "Desert to Mountains"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Desert to Mountains"
    },
    "category": "Incense & Spiritual Products",
    "material": ["Himalayan Herbs", "Desi Cow Dung", "Pure Ghee", "Natural Resins"],
    "color": ["Natural Brown", "Golden", "Amber"],
    "offers": {
      "@type": "Offer",
      "price": "299",
      "priceCurrency": "INR",
      "priceValidUntil": "2024-12-31",
      "availability": "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Desert to Mountains"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "89"
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
          "name": "Rajesh Kumar"
        },
        "reviewBody": "Authentic Vedic incense with amazing fragrance. Creates perfect spiritual ambiance at home."
      }
    ],
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Burn Time",
        "value": "45-60 minutes"
      },
      {
        "@type": "PropertyValue",
        "name": "Weight",
        "value": "50g per pack"
      },
      {
        "@type": "PropertyValue",
        "name": "Organic",
        "value": "100% Natural"
      },
      {
        "@type": "PropertyValue",
        "name": "Traditional",
        "value": "Vedic Recipe"
      },
      {
        "@type": "PropertyValue",
        "name": "Purpose",
        "value": "Spiritual Purification"
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
      <DhuneeClient />
    </>
  );
} 