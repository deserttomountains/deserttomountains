"use client";

import { Menu } from 'lucide-react';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  userProfile: any;
  onLogout: () => void;
}

export default function AdminLayout({ children, userProfile, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0]">
      {/* Main Layout */}
      <div className="fixed top-0 left-0 w-full h-full flex" style={{ top: 'env(safe-area-inset-top)', height: 'calc(100vh - env(safe-area-inset-top))' }}>
        {/* Sidebar */}
        <AdminSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userProfile={userProfile}
          onLogout={onLogout}
        />
        
        {/* Main Content */}
        <main className="flex-1 w-full h-full overflow-y-auto relative z-10 bg-transparent p-2 sm:p-3 md:p-4 lg:p-8 pt-20 md:pt-2">
          {/* Mobile Menu Button - Fixed Position */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white hover:from-[#8B7A1A] hover:to-[#5E4E06] transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Page Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
