'use client';

import { LogIn, ShoppingCart, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNav(false); // Hide on scroll down
      } else {
        setShowNav(true); // Show on scroll up
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/aura', label: 'Aura' },
    { href: '/dhunee', label: 'Dhunee' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/admin', label: 'Admin' }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-amber-900 border-b border-amber-800 shadow-lg transition-transform duration-500 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="relative max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <Image
                src="/desert-to-mountains-logo.webp"
                alt="Desert to Mountains"
                width={180}
                height={50}
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-5 py-2 font-semibold rounded-xl text-white hover:text-amber-900 hover:bg-amber-400 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  <span className="relative z-10">{link.label}</span>
                  {/* Bold underline on hover */}
                  <span className="absolute left-0 bottom-0 w-0 h-1 bg-amber-400 rounded-full group-hover:w-full transition-all duration-200"></span>
                </Link>
              ))}
            </div>
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Link href="/login" className="relative p-2 rounded-xl text-white bg-amber-400 hover:bg-white hover:text-amber-900 shadow-md transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                <LogIn className="w-5 h-5" />
              </Link>
              <Link href="/cart" className="relative p-2 rounded-xl text-white bg-amber-400 hover:bg-white hover:text-amber-900 shadow-md transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" aria-label="Cart">
                <ShoppingCart className="w-5 h-5" />
              </Link>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden relative p-2 rounded-xl text-white bg-amber-400 hover:bg-white hover:text-amber-900 shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      {/* Mobile Menu */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out md:hidden ${
        isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="bg-amber-900 shadow-lg border-b border-amber-800 mt-20 rounded-b-2xl">
          <div className="px-6 py-6">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-4 text-white font-semibold rounded-xl transition-all duration-200 hover:text-amber-900 hover:bg-amber-400 bg-transparent group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 