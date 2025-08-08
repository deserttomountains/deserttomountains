'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Home, ArrowLeft, Search, Mountain, Sun } from 'lucide-react';
import Head from 'next/head';

export default function NotFound() {
  const popularPages = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/aura', label: 'Aura Plaster', icon: Mountain },
    { href: '/dhunee', label: 'Dhunee Incense', icon: Sun },
    { href: '/about', label: 'About Us', icon: Search },
  ];

  return (
    <>
      <Head>
        <title>Page Not Found - 404 Error | Desert to Mountains</title>
        <meta name="description" content="The page you are looking for could not be found. Explore our natural building solutions, eco-friendly plasters, and organic incense products." />
        <meta name="robots" content="noindex, follow" />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8F6F0] via-[#F0EDE4] to-[#E8E4D8]">
        <Navigation />
        
        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Number */}
            <div className="mb-8">
              <h1 className="text-9xl md:text-[12rem] font-extrabold text-[#5E4E06]/20 leading-none">
                404
              </h1>
            </div>

            {/* Error Message */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#2A2418] mb-4">
                Oops! Page Not Found
              </h2>
              <p className="text-lg text-[#5E4E06] mb-6 max-w-md mx-auto">
                The page you're looking for seems to have wandered off into the desert. 
                Let's get you back to exploring our natural building solutions.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#5E4E06] text-white font-semibold rounded-xl hover:bg-[#4A3E05] transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[#5E4E06] text-[#5E4E06] font-semibold rounded-xl hover:bg-[#5E4E06] hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back
              </button>
            </div>

            {/* Popular Pages */}
            <div className="bg-white/80 rounded-2xl p-8 shadow-lg border border-[#E6C866]/30">
              <h3 className="text-xl font-semibold text-[#2A2418] mb-6">
                Popular Pages
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularPages.map((page) => (
                  <Link
                    key={page.href}
                    href={page.href}
                    className="group flex flex-col items-center p-4 rounded-xl hover:bg-[#F8F6F0] transition-colors duration-200"
                  >
                    <page.icon className="w-8 h-8 text-[#5E4E06] mb-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-sm font-medium text-[#2A2418] group-hover:text-[#5E4E06] transition-colors">
                      {page.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Search Suggestion */}
            <div className="mt-8 text-center">
              <p className="text-[#5E4E06] mb-4">
                Can't find what you're looking for?
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-[#5E4E06] font-semibold hover:text-[#4A3E05] transition-colors underline"
              >
                <Search className="w-4 h-4" />
                Contact us for help
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
