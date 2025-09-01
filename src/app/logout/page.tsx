'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, LogIn, UserPlus, Home, Clock } from 'lucide-react';
import Link from 'next/link';

export default function LogoutPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect to login after countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Separate effect for navigation when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      router.push('/login');
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logout Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#D4AF37] p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-[#5E4E06] mb-3">
            Successfully Logged Out
          </h1>
          <p className="text-[#8B7A1A] text-lg mb-6">
            You have been securely logged out of your account.
          </p>

          {/* Security Info */}
          <div className="bg-[#F8F6F0] rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-[#8B7A1A] mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Session Information</span>
            </div>
            <p className="text-xs text-[#8B7A1A]">
              All session data has been cleared and your account is secure.
            </p>
          </div>

          {/* Auto-redirect Info */}
          <div className="bg-[#FFF8E1] border border-[#D4AF37] rounded-xl p-4 mb-6">
            <p className="text-sm text-[#8B7A1A]">
              Redirecting to login page in{' '}
              <span className="font-bold text-[#D4AF37]">{countdown}</span> seconds...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white py-3 px-6 rounded-xl font-semibold hover:from-[#8B7A1A] hover:to-[#5E4E06] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login Again
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/signup"
                className="bg-[#F5F2E8] text-[#8B7A1A] py-3 px-4 rounded-xl font-medium hover:bg-[#E6DCC0] transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Link>

              <Link
                href="/"
                className="bg-[#F5F2E8] text-[#8B7A1A] py-3 px-4 rounded-xl font-medium hover:bg-[#E6DCC0] transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-[#8B7A1A]">
            Need help?{' '}
            <Link href="/contact" className="text-[#D4AF37] hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
