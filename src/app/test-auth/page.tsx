'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { AuthService } from '@/lib/firebase';
import { useState } from 'react';

export default function TestAuthPage() {
  const { user, userProfile, role, loading } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  const testAdminRole = async () => {
    if (!user) {
      setTestResult('No user logged in');
      return;
    }

    try {
      await AuthService.updateUserRole(user.uid, 'admin');
      setTestResult('Admin role set successfully! Please refresh the page.');
    } catch (error) {
      setTestResult(`Error setting admin role: ${error}`);
    }
  };

  const testCustomerRole = async () => {
    if (!user) {
      setTestResult('No user logged in');
      return;
    }

    try {
      await AuthService.updateUserRole(user.uid, 'customer');
      setTestResult('Customer role set successfully! Please refresh the page.');
    } catch (error) {
      setTestResult(`Error setting customer role: ${error}`);
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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#5E4E06] mb-8">Authentication Test Page</h1>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#5E4E06] mb-6">Current Auth State</h2>
          
          <div className="space-y-4">
            <div>
              <strong>User Logged In:</strong> {user ? 'Yes' : 'No'}
            </div>
            
            {user && (
              <>
                <div>
                  <strong>User ID:</strong> {user.uid}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Role:</strong> {role || 'Not set'}
                </div>
                <div>
                  <strong>Profile:</strong> {userProfile ? 'Loaded' : 'Not found'}
                </div>
                {userProfile && (
                  <div>
                    <strong>Name:</strong> {userProfile.firstName} {userProfile.lastName}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {user && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 mb-8">
            <h2 className="text-2xl font-bold text-[#5E4E06] mb-6">Role Testing</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={testAdminRole}
                  className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium"
                >
                  Set Admin Role
                </button>
                <button
                  onClick={testCustomerRole}
                  className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium"
                >
                  Set Customer Role
                </button>
              </div>
              
              {testResult && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <strong>Test Result:</strong> {testResult}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8">
          <h2 className="text-2xl font-bold text-[#5E4E06] mb-6">Navigation Test</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <a
                href="/login"
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium"
              >
                Go to Login
              </a>
              <a
                href="/signup"
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium"
              >
                Go to Signup
              </a>
              <a
                href="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium"
              >
                Go to Dashboard
              </a>
              <a
                href="/admin"
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#8B7A1A] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg font-medium"
              >
                Go to Admin
              </a>
            </div>
            
            <div className="text-sm text-[#8B7A1A]">
              <p><strong>Expected Behavior:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>If not logged in: Login/Signup should work, Dashboard/Admin should redirect to login</li>
                <li>If logged in as customer: Login/Signup should redirect to dashboard, Dashboard should work, Admin should redirect to dashboard</li>
                <li>If logged in as admin: Login/Signup should redirect to admin, Dashboard should redirect to admin, Admin should work</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 