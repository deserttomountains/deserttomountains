"use client";

import { User, LogOut, X, ArrowLeft, BarChart3, UserPlus, FileText, Users, Target, MessageSquare, Calendar, Layout } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationItem {
  name: string;
  id: string;
  icon: any;
  href: string;
}

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userProfile: any;
  onLogout: () => void;
}

const navigation: NavigationItem[] = [
  { name: 'Overview', id: 'overview', icon: BarChart3, href: '/admin' },
  { name: 'Leads', id: 'leads', icon: UserPlus, href: '/admin/leads' },
  { name: 'Quotes', id: 'quotes', icon: FileText, href: '/admin/quotes' },
  { name: 'Customers', id: 'customers', icon: Users, href: '/admin/customers' },
  { name: 'Sales', id: 'sales', icon: Target, href: '/admin/sales' },
  { name: 'Messages', id: 'messages', icon: MessageSquare, href: '/admin/messages' },
  { name: 'Templates', id: 'templates', icon: Layout, href: '/admin/templates' },
  { name: 'Tasks', id: 'tasks', icon: Calendar, href: '/admin/tasks' },
  { name: 'Form Submissions', id: 'formSubmissions', icon: FileText, href: '/admin/form-submissions' },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen, userProfile, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
      
      {/* Sidebar */}
      <aside className={`fixed md:static z-40 left-0 top-0 w-72 sm:w-80 md:w-60 h-full bg-gradient-to-br from-[#FFFBE6] to-[#F5F2E8] border-r-2 border-[#D4AF37] shadow-2xl flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 sm:p-4 pt-6 border-b border-[#D4AF37]">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center shadow-lg border-2 border-white">
              <User className="w-4 h-4 sm:w-5 sm:w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-[#5E4E06] text-xs sm:text-sm">{userProfile?.firstName || 'Admin'}</div>
              <div className="text-[#8B7A1A] text-xs">{userProfile?.email || 'admin@email.com'}</div>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 sm:p-2 hover:bg-[#F5F2E8] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B7A1A]" />
          </button>
        </div>
        
        {/* Desktop Profile Section */}
        <div className="hidden md:flex flex-col items-center pt-6 sm:pt-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7A1A] flex items-center justify-center shadow-lg border-4 border-white mb-3 sm:mb-4">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="text-center mb-6 sm:mb-8">
            <div className="font-black text-base sm:text-lg text-[#5E4E06]">{userProfile?.firstName || 'Admin'}</div>
            <div className="text-[#8B7A1A] text-xs mb-2">{userProfile?.email || 'admin@email.com'}</div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 w-full px-3 sm:px-4">
          <ul className="space-y-1 sm:space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after selection
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-200 text-sm sm:text-base md:text-lg cursor-pointer ${
                      isActive 
                        ? 'bg-[#D4AF37] text-white shadow-md scale-[1.02] border-l-4 border-l-white' 
                        : 'text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06] hover:scale-[1.01]'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-current'}`} /> 
                    <span className="flex-1 text-left">{item.name}</span>
                  </Link>
                </li>
              );
            })}
            <li>
              <button 
                onClick={() => {
                  onLogout();
                  setSidebarOpen(false); // Close sidebar on mobile
                }} 
                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all text-sm sm:text-base md:text-lg text-[#8B7A1A] hover:bg-[#F5F2E8] hover:text-[#5E4E06] cursor-pointer"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" /> 
                <span className="flex-1 text-left">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
        
        {/* Back to Site Button */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-[#D4AF37]">
          <Link 
            href="/" 
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-[#8B7A1A] bg-[#F5F2E8] hover:bg-[#D4AF37] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm font-semibold">Back to Site</span>
          </Link>
        </div>
        
        {/* Footer */}
        <div className="p-3 sm:p-4 md:px-4 md:mb-6">
          <div className="text-xs text-[#8B7A1A] text-center">Desert to Mountains &copy; {new Date().getFullYear()}</div>
        </div>
      </aside>
    </>
  );
}
