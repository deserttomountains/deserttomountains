'use client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { User, Settings, LogOut, ShoppingBag, Bell, Edit3, Menu, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Simulate active link for demo
  const active: string = 'Dashboard';
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex flex-col">
      <Navigation />
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside className={`fixed z-20 top-0 left-0 h-screen w-72 bg-gradient-to-br from-[#FFFBE6] to-[#F5F2E8] border-r-2 border-[#D4AF37] shadow-2xl flex flex-col items-center pt-0 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:w-72 lg:translate-x-0`}>
          {/* Logo/Site Name */}
          <div className="w-full flex items-center justify-center h-20 border-b-2 border-[#D4AF37] bg-gradient-to-r from-[#F8F6F0] to-[#E6DCC0]">
            <span className="font-black text-2xl text-[#5E4E06] tracking-wide">Desert<span className="text-[#D4AF37]">2</span>Mountains</span>
          </div>
          {/* User Info Card */}
          <div className="mt-8 mb-10 w-11/12 bg-gradient-to-br from-[#FFFBE6] to-[#F5F2E8] border border-[#D4AF37] rounded-2xl shadow flex flex-col items-center p-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center shadow-lg border-4 border-white mb-2">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <div className="font-black text-lg text-[#5E4E06]">[User]</div>
              <div className="text-[#8B7A1A] text-xs mb-2">user@email.com</div>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#5E4E06] to-[#8B7A1A] text-white font-bold rounded-xl shadow hover:scale-105 transition-all duration-300 cursor-pointer text-xs" disabled>
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            </div>
          </div>
          {/* Navigation Links */}
          <nav className="flex-1 w-full">
            <ul className="space-y-2 px-6 mt-4">
              <li>
                <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-lg ${active === 'Dashboard' ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}><LayoutDashboard className="w-5 h-5" /> Dashboard</a>
              </li>
              <li>
                <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-lg ${active === 'Orders' ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}><ShoppingBag className="w-5 h-5" /> My Orders</a>
              </li>
              <li>
                <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-lg ${active === 'Settings' ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}><Settings className="w-5 h-5" /> Account Settings</a>
              </li>
              <li>
                <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-lg ${active === 'Notifications' ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}><Bell className="w-5 h-5" /> Notifications</a>
              </li>
              <li>
                <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-lg ${active === 'Logout' ? 'bg-gradient-to-r from-[#D4AF37]/30 to-[#8B7A1A]/10 text-[#5E4E06] shadow' : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06]'}`}><LogOut className="w-5 h-5" /> Logout</a>
              </li>
            </ul>
          </nav>
          <div className="mt-auto mb-8 text-xs text-[#8B7A1A] px-6 text-center">Desert to Mountains &copy; {new Date().getFullYear()}</div>
        </aside>
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-10 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
        {/* Main Content */}
        <div className="flex-1 ml-0 lg:ml-72 w-full min-h-screen relative z-10">
          {/* Mobile sidebar toggle */}
          <button className="lg:hidden fixed top-6 left-6 z-30 bg-white/90 border-2 border-[#D4AF37] rounded-full p-2 shadow-lg" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="w-7 h-7 text-[#8B7A1A]" />
          </button>
          <main className="max-w-5xl mx-auto py-12 px-4 pt-32 md:pt-24">
            {/* Welcome Section */}
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-black text-[#5E4E06] mb-2">Welcome back, [User]!</h1>
              <p className="text-[#8B7A1A] text-lg mb-4">Your personal dashboard for all things Desert to Mountains</p>
            </div>
            {/* Recent Activity / Announcements */}
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 mb-10 animate-fade-in">
              <h2 className="text-2xl font-bold text-[#5E4E06] mb-4 flex items-center gap-2">
                <Bell className="w-6 h-6 text-[#8B7A1A]" />
                Recent Activity & Announcements
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="w-3 h-3 mt-2 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] inline-block"></span>
                  <div>
                    <span className="font-semibold text-[#5E4E06]">No recent activity yet.</span>
                    <p className="text-[#8B7A1A] text-sm">Your updates and order history will appear here.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-3 h-3 mt-2 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] inline-block"></span>
                  <div>
                    <span className="font-semibold text-[#5E4E06]">Welcome to your new dashboard!</span>
                    <p className="text-[#8B7A1A] text-sm">Stay tuned for new features and updates.</p>
                  </div>
                </li>
              </ul>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
} 