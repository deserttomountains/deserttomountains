import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { CartProvider } from "@/components/CartContext";
import { ToastProvider } from "@/components/ToastContext";
import LayoutContent from "@/components/LayoutContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Desert to Mountains - Natural Building Solutions",
  description: "Natural, sustainable living solutions from the Thar Desert to the Himalayas. Eco-friendly plasters, incense, and more for a healthier home and planet.",
  keywords: "natural plaster, eco-friendly building materials, sustainable construction, gypsum plaster, organic incense, healthy homes, green building",
  metadataBase: new URL('https://deserttomountains.com'),
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/desert-to-mountains-logo.webp',
  },
  other: {
    'theme-color': '#fbbf24',
  },
  // Open Graph meta tags for social media sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://deserttomountains.com',
    siteName: 'Desert to Mountains',
    title: 'Desert to Mountains - Natural Building Solutions',
    description: 'Natural, sustainable living solutions from the Thar Desert to the Himalayas. Eco-friendly plasters, incense, and more for a healthier home and planet.',
    images: [
      {
        url: 'https://deserttomountains.com/images/deserttomountains-4-scaled-1.webp',
        width: 1200,
        height: 630,
        alt: 'Desert to Mountains - Natural Building Solutions',
        type: 'image/webp',
      },
      {
        url: 'https://deserttomountains.com/desert-to-mountains-logo.webp',
        width: 512,
        height: 512,
        alt: 'Desert to Mountains Logo',
        type: 'image/webp',
      }
    ],
  },
  // Twitter Card meta tags
  twitter: {
    card: 'summary_large_image',
    site: '@deserttomountains',
    creator: '@deserttomountains',
    title: 'Desert to Mountains - Natural Building Solutions',
    description: 'Natural, sustainable living solutions from the Thar Desert to the Himalayas. Eco-friendly plasters, incense, and more for a healthier home and planet.',
    images: ['https://deserttomountains.com/images/deserttomountains-4-scaled-1.webp'],
  },
  // Additional meta tags for better SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://deserttomountains.com',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured data for organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Desert to Mountains",
    "description": "Natural, sustainable living solutions from the Thar Desert to the Himalayas. Eco-friendly plasters, incense, and more for a healthier home and planet.",
    "url": "https://deserttomountains.com",
    "logo": "https://deserttomountains.com/desert-to-mountains-logo.webp",
    "image": "https://deserttomountains.com/images/deserttomountains-4-scaled-1.webp",
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
    },
    "sameAs": [
      "https://instagram.com/deserttomountains",
      "https://facebook.com/deserttomountains"
    ],
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Divyveer Singh Bhati",
      "jobTitle": "Founder & CEO",
      "description": "Passionate advocate for ecological architecture and sustainable living"
    }
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#fbbf24" />
        
        {/* Resource hints for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/deserttomountains-4-scaled-1.webp" as="image" type="image/webp" />
        <link rel="preload" href="/desert-to-mountains-logo.webp" as="image" type="image/webp" />
        
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Theme accentColor="yellow" radius="large">
          <ToastProvider>
            <CartProvider>
              <LayoutContent>{children}</LayoutContent>
            </CartProvider>
          </ToastProvider>
        </Theme>
      </body>
    </html>
  );
}
