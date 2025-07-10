'use client';

import { LogIn, ShoppingCart, Menu, X, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useCart } from '@/components/CartContext';
import { auth, AuthService } from '@/lib/firebase';

import { useRouter } from 'next/navigation';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        try {
          const role = await AuthService.getUserRole(user.uid);
          setUserRole(role);
        } catch (error) {
          console.error('Error getting user role:', error);
          setUserRole('customer'); // Default to customer if error
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const handleDashboardClick = () => {
    if (userRole === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/aura', label: 'Aura' },
    { href: '/dhunee', label: 'Dhunee' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-[#5E4E06] border-b border-[#3D3204] shadow-lg transition-transform duration-500 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
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
                  className="relative px-5 py-2 font-semibold rounded-xl text-white hover:text-[#5E4E06] hover:bg-[#E6C866] transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C866]"
                >
                  <span className="relative z-10">{link.label}</span>
                  {/* Bold underline on hover */}
                  <span className="absolute left-0 bottom-0 w-0 h-1 bg-[#E6C866] rounded-full group-hover:w-full transition-all duration-200"></span>
                </Link>
              ))}
            </div>
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {isLoggedIn ? (
                <button 
                  onClick={handleDashboardClick}
                  className="relative p-2 rounded-xl text-white bg-[#8B7A1A] hover:bg-white hover:text-[#5E4E06] shadow-md transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C866]" 
                  aria-label={userRole === 'admin' ? 'Admin Dashboard' : 'Dashboard'}
                >
                  <LayoutDashboard className="w-5 h-5" />
                </button>
              ) : (
              <Link href="/login" className="relative p-2 rounded-xl text-white bg-[#8B7A1A] hover:bg-white hover:text-[#5E4E06] shadow-md transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C866]">
                <LogIn className="w-5 h-5" />
              </Link>
              )}
              <Link href="/cart" className="relative p-2 rounded-xl text-white bg-[#8B7A1A] hover:bg-white hover:text-[#5E4E06] shadow-md transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C866]" aria-label="Cart">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E6C866] text-[#5E4E06] text-xs font-bold rounded-full px-1.5 py-0.5 shadow-lg border-2 border-white animate-bounce">
                    {cartCount}
                  </span>
                )}
              </Link>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden relative p-2 rounded-xl text-white bg-[#8B7A1A] hover:bg-white hover:text-[#5E4E06] shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C866]"
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
        <div className="bg-[#5E4E06] shadow-lg border-b border-[#3D3204] mt-20 rounded-b-2xl">
          <div className="px-6 py-6">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-4 text-white font-semibold rounded-xl transition-all duration-200 hover:text-[#5E4E06] hover:bg-[#E6C866] bg-transparent group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E6C866]"
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