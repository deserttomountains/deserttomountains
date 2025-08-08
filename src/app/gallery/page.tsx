import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | Desert to Mountains',
  description: 'Explore our gallery of natural building projects and sustainable construction work. See Aura plaster applications, eco-friendly materials in action, and beautiful natural finishes.',
  keywords: 'natural building gallery, sustainable construction projects, Aura plaster gallery, eco-friendly building examples, natural wall finishes, green building projects',
  openGraph: {
    title: 'Gallery | Desert to Mountains',
    description: 'Explore our gallery of natural building projects and sustainable construction work. See Aura plaster applications, eco-friendly materials in action, and beautiful natural finishes.',
    type: 'website',
    url: 'https://deserttomountains.com/gallery',
    siteName: 'Desert to Mountains',
    images: [
      {
        url: '/images/gallery/1.webp',
        width: 1200,
        height: 630,
        alt: 'Desert to Mountains Gallery - Natural Building Projects',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery | Desert to Mountains',
    description: 'Explore our gallery of natural building projects and sustainable construction work. See Aura plaster applications, eco-friendly materials in action, and beautiful natural finishes.',
    images: ['/images/gallery/1.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://deserttomountains.com/gallery',
  },
};

import GalleryClient from './GalleryClient';

export default function GalleryPage() {
  return <GalleryClient />;
} 