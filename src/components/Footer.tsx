import Link from 'next/link';
import Image from 'next/image';
import { FileText, Shield, Truck, Undo2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#2A2418] text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center mb-8 md:mb-0">
            <Image
              src="/desert-to-mountains-logo.webp"
              alt="Desert to Mountains Logo"
              width={112}
              height={56}
              className="h-14 w-auto mb-2"
              priority
            />
            <p className="text-[#F5F2E8] leading-relaxed text-sm max-w-xs mx-auto">
              Ancient wisdom meets modern living through natural wall plaster and organic incense.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-[#F5F2E8]">
              <li><Link href="/aura" className="hover:text-[#E6C866] transition-colors">Aura Wall Plaster</Link></li>
              <li><Link href="/dhunee" className="hover:text-[#E6C866] transition-colors">Dhunee Incense</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-[#F5F2E8]">
              <li><Link href="/about" className="hover:text-[#E6C866] transition-colors">About Us</Link></li>
              <li><Link href="/gallery" className="hover:text-[#E6C866] transition-colors">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-[#E6C866] transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-[#F5F2E8]">
              <li><a href="#" className="hover:text-[#E6C866] transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-[#E6C866] transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-[#E6C866] transition-colors">Returns</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#5E4E06] mt-8 pt-8 text-center text-[#F5F2E8]">
          <p>&copy; 2024 Desert to Mountains. All rights reserved.</p>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-[#E6C866]/80">
            <Link href="/privacy-policy" className="hover:underline transition-colors">Privacy Policy</Link>
            <span className="opacity-60">·</span>
            <Link href="/shipping-policy" className="hover:underline transition-colors">Shipping Policy</Link>
            <span className="opacity-60">·</span>
            <Link href="/refund-policy" className="hover:underline transition-colors">Refund Policy</Link>
            <span className="opacity-60">·</span>
            <Link href="/terms" className="hover:underline transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 