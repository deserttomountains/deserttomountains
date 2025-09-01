"use client";

import { Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  userProfile: any;
  onLogout: () => void;
}

export default function AdminLayout({ children, userProfile, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication once at layout level
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('AdminLayout: No user, redirecting to login');
        router.push('/login?redirect=' + encodeURIComponent(pathname));
        return;
      }
      
      if (role !== 'admin') {
        console.log('AdminLayout: User is not admin, redirecting to dashboard');
        router.push('/dashboard');
        return;
      }
    }
  }, [user, role, loading, router, pathname]);

  // Show loading while checking authentication
  if (loading || !user || role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

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
