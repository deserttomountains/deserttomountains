"use client";

import { useState, useEffect } from 'react';
import { AuthService, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContext';

import AdminLayout from '../components/AdminLayout';
import { MessageSquare, Send } from 'lucide-react';

function MessagesPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();
  const { showToast } = useToast();

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const profile = await AuthService.getUserProfile(user.uid);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    const loadData = async () => {
      try {
        // TODO: Load messages data
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadUserProfile();
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      router.push('/login');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Error logging out', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <AdminLayout userProfile={userProfile} onLogout={handleLogout}>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 mt-4 md:mt-0">
        {/* Header */}
        <div className="bg-white rounded-xl border border-[#D4AF37] p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#5E4E06]">Messages</h2>
                <p className="text-[#8B7A1A] text-xs sm:text-sm">Chat with your customers</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-lg hover:scale-105 transition-all duration-200 cursor-pointer">
              <Send className="w-4 h-4" />
              <span>New Message</span>
            </button>
          </div>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-xl border border-[#D4AF37] shadow-sm p-8 text-center">
          <MessageSquare className="w-20 h-20 text-[#D4AF37] mx-auto mb-6 opacity-60" />
          <h2 className="text-2xl font-bold text-[#5E4E06] mb-3">Chat & Messaging</h2>
          <p className="text-[#8B7A1A] text-lg mb-4 text-center max-w-md">
            This page will contain the complete messaging functionality including:
            chat interface, WhatsApp integration, message history, and customer support.
          </p>
          <p className="text-sm text-[#8B7A1A]">
            Coming soon with full functionality from the original admin dashboard.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function MessagesPage() {
  return <MessagesPageContent />;
}
