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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Desert to Mountains",
  description: "Natural, sustainable living solutions from the Thar Desert to the Himalayas. Eco-friendly plasters, incense, and more for a healthier home and planet.",
  metadataBase: new URL('https://deserttomountains.com'),
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
