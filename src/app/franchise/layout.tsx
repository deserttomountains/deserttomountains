import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Franchise Opportunity - Partner With Us | Desert to Mountains',
  description: 'Own a Desert to Mountains franchise. Partner with a trusted, eco-conscious brand and bring authentic, sustainable living solutions to your city. High returns, comprehensive support.',
  keywords: 'Desert to Mountains franchise, business opportunity, eco-friendly franchise, sustainable building franchise, natural products franchise, franchise partnership',
  openGraph: {
    title: 'Franchise Opportunity - Partner With Us | Desert to Mountains',
    description: 'Own a Desert to Mountains franchise. Partner with a trusted, eco-conscious brand and bring authentic, sustainable living solutions to your city. High returns, comprehensive support.',
    type: 'website',
    url: 'https://deserttomountains.com/franchise',
    siteName: 'Desert to Mountains',
    images: [
      {
        url: '/images/deserttomountains-4-scaled-1.webp',
        width: 1200,
        height: 630,
        alt: 'Desert to Mountains Franchise Opportunity',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Franchise Opportunity - Partner With Us | Desert to Mountains',
    description: 'Own a Desert to Mountains franchise. Partner with a trusted, eco-conscious brand and bring authentic, sustainable living solutions to your city. High returns, comprehensive support.',
    images: ['/images/deserttomountains-4-scaled-1.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://deserttomountains.com/franchise',
  },
};

export default function FranchiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
