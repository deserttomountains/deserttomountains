import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">Desert to Mountains</div>
            <p className="text-gray-400 leading-relaxed">
              Ancient wisdom meets modern living through natural wall plaster and organic incense.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/aura" className="hover:text-amber-400 transition-colors">Aura Wall Plaster</Link></li>
              <li><Link href="/dhunee" className="hover:text-amber-400 transition-colors">Dhunee Incense</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link></li>
              <li><Link href="/gallery" className="hover:text-amber-400 transition-colors">Gallery</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-amber-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Returns</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Desert to Mountains. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 