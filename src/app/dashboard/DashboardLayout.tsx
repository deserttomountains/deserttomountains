'use client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { User, Settings, LogOut, ShoppingBag, Bell, Edit3, Menu, LayoutDashboard, X as CloseIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, auth, UserProfile } from '@/lib/firebase';

interface DashboardLayoutProps {
  active: string;
  children: React.ReactNode;
}

export default function DashboardLayout({ active, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const profile = await AuthService.getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex flex-col">
      <Navigation />
      <div className="flex flex-1 relative">
        {/* Sidebar (hidden on mobile) */}
        <aside className="hidden md:fixed md:z-20 md:top-0 md:left-0 md:h-screen md:w-72 bg-gradient-to-br from-[#FFFBE6] to-[#F5F2E8] border-r-2 border-[#D4AF37] shadow-2xl md:flex flex-col items-center pt-0 transition-transform duration-300">
          {/* Spacer to prevent overlap with header navigation */}
          <div className="h-20 md:h-20 lg:h-20 xl:h-20" />
          {/* User Info Card */}
          <div className="mt-6 mb-8 w-11/12 bg-gradient-to-br from-[#FFFBE6] to-[#F5F2E8] border border-[#D4AF37] rounded-2xl shadow flex flex-col items-center p-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center shadow-lg border-4 border-white mb-2">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <div className="font-black text-lg text-[#5E4E06]">
                {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}` : 'Valued Customer'}
              </div>
              <div className="text-[#8B7A1A] text-xs mb-2">
                {userProfile?.email
                  ? userProfile.email
                  : userProfile?.phone
                    ? userProfile.phone
                    : 'user@email.com'}
              </div>
              <Link 
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300 cursor-pointer text-xs"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </Link>
            </div>
          </div>
          {/* Navigation Links */}
          <nav className="flex-1 w-full">
            <ul className="space-y-3 px-4 mt-2">
              <li>
                <Link href="/dashboard" className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all text-lg md:text-base ${active === 'Dashboard' ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}><LayoutDashboard className="w-6 h-6 md:w-5 md:h-5" /> Dashboard</Link>
              </li>
              <li>
                <Link href="/dashboard/orders" className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all text-lg md:text-base ${active === 'Orders' ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}><ShoppingBag className="w-6 h-6 md:w-5 md:h-5" /> My Orders</Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all text-lg md:text-base ${active === 'Settings' ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}><Settings className="w-6 h-6 md:w-5 md:h-5" /> Account Settings</Link>
              </li>
              <li>
                <Link href="/dashboard/notifications" className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all text-lg md:text-base ${active === 'Notifications' ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}><Bell className="w-6 h-6 md:w-5 md:h-5" /> Notifications</Link>
              </li>
              <li>
                <button 
                  onClick={async () => { await handleLogout(); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all text-lg md:text-base ${active === 'Logout' ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}
                >
                  <LogOut className="w-6 h-6 md:w-5 md:h-5" /> Logout
                </button>
              </li>
            </ul>
          </nav>
          <div className="mt-auto mb-6 text-xs text-[#8B7A1A] px-4 text-center">Desert to Mountains &copy; {new Date().getFullYear()}</div>
        </aside>
        {/* Main Content */}
        <div className="flex-1 ml-0 md:ml-72 w-full min-h-screen relative z-10">
          {children}
        </div>
        {/* Bottom Navigation Bar for Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-br from-[#FFFBE6] to-[#F5F2E8] border-t-2 border-[#D4AF37] shadow-2xl flex md:hidden justify-around items-center h-16">
          <Link href="/dashboard" className={`flex flex-col items-center justify-center flex-1 h-full ${active === 'Dashboard' ? 'text-[#5E4E06]' : 'text-[#8B7A1A]'} font-bold transition-all`}><LayoutDashboard className="w-6 h-6 mb-1" /> <span className="text-xs">Dashboard</span></Link>
          <Link href="/dashboard/orders" className={`flex flex-col items-center justify-center flex-1 h-full ${active === 'Orders' ? 'text-[#5E4E06]' : 'text-[#8B7A1A]'} font-bold transition-all`}><ShoppingBag className="w-6 h-6 mb-1" /> <span className="text-xs">Orders</span></Link>
          <Link href="/dashboard/settings" className={`flex flex-col items-center justify-center flex-1 h-full ${active === 'Settings' ? 'text-[#5E4E06]' : 'text-[#8B7A1A]'} font-bold transition-all`}><Settings className="w-6 h-6 mb-1" /> <span className="text-xs">Settings</span></Link>
          <Link href="/dashboard/notifications" className={`flex flex-col items-center justify-center flex-1 h-full ${active === 'Notifications' ? 'text-[#5E4E06]' : 'text-[#8B7A1A]'} font-bold transition-all`}><Bell className="w-6 h-6 mb-1" /> <span className="text-xs">Alerts</span></Link>
          <button onClick={handleLogout} className="flex flex-col items-center justify-center flex-1 h-full text-[#8B7A1A] font-bold transition-all"><LogOut className="w-6 h-6 mb-1" /> <span className="text-xs">Logout</span></button>
        </nav>
      </div>
    </div>
  );
} 