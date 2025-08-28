'use client';

import { useState } from 'react';
import { AlertTriangle, Mail, Phone, User, ArrowRight, LogIn } from 'lucide-react';
import Link from 'next/link';
import { AuthService } from '@/lib/firebase';

interface DuplicateAccountHandlerProps {
  email?: string;
  phone?: string;
  onClose: () => void;
}

interface ExistingAccountInfo {
  email?: { uid: string; createdAt: Date };
  phone?: { uid: string; createdAt: Date };
}

export default function DuplicateAccountHandler({ email, phone, onClose }: DuplicateAccountHandlerProps) {
  const [existingAccountInfo, setExistingAccountInfo] = useState<ExistingAccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckExistingAccounts = async () => {
    if (!email && !phone) return;
    
    setIsLoading(true);
    try {
      const info = await AuthService.getExistingAccountInfo(email, phone);
      setExistingAccountInfo(info);
    } catch (error) {
      console.error('Error checking existing accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Account Already Exists
            </h2>
            <p className="text-gray-600 text-lg">
              We found existing accounts with the credentials you're trying to use.
            </p>
          </div>

          {/* Duplicate Information */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Duplicate Credentials Detected
            </h3>
            
            <div className="space-y-4">
              {email && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-200">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Email Address</p>
                    <p className="text-gray-600">{email}</p>
                  </div>
                </div>
              )}
              
              {phone && (
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-200">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Phone Number</p>
                    <p className="text-gray-600">{phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleCheckExistingAccounts}
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span>Check Existing Accounts</span>
                </>
              )}
            </button>

            <Link
              href="/login"
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In Instead</span>
            </Link>
          </div>

          {/* Existing Account Information */}
          {existingAccountInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                Existing Account Details
              </h3>
              
              <div className="space-y-4">
                {existingAccountInfo.email && (
                  <div className="p-4 bg-white rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">Email Account</span>
                    </div>
                    <p className="text-gray-600 mb-2">Created: {formatDate(existingAccountInfo.email.createdAt)}</p>
                    <Link
                      href={`/login?email=${encodeURIComponent(email!)}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <span>Sign in with this email</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
                
                {existingAccountInfo.phone && (
                  <div className="p-4 bg-white rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">Phone Account</span>
                    </div>
                    <p className="text-gray-600 mb-2">Created: {formatDate(existingAccountInfo.phone.createdAt)}</p>
                    <Link
                      href={`/login?phone=${encodeURIComponent(phone!)}`}
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <span>Sign in with this phone</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Need Help?</h3>
            <div className="space-y-2 text-gray-600">
              <p>• If you forgot your password, use the "Forgot Password" option on the login page</p>
              <p>• If you're having trouble accessing your account, contact our support team</p>
              <p>• You can only have one account per email address and phone number</p>
            </div>
          </div>

          {/* Close Button */}
          <div className="text-center mt-8">
            <button
              onClick={onClose}
              className="px-8 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
