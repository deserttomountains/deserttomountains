'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthService, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { user, role, loading, userProfile } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    const getDebugInfo = async () => {
      if (user) {
        try {
          const profile = await AuthService.getUserProfile(user.uid);
          const roleFromService = await AuthService.getUserRole(user.uid);
          
          setDebugInfo({
            uid: user.uid,
            email: user.email,
            roleFromHook: role,
            roleFromService,
            hasProfile: !!profile,
            profileData: profile,
            authState: auth.currentUser ? 'authenticated' : 'not authenticated'
          });
        } catch (error) {
          setDebugInfo({
            error: error instanceof Error ? error.message : String(error),
            uid: user.uid,
            email: user.email
          });
        }
      }
    };

    getDebugInfo();
  }, [user, role]);

  const handleTestRedirect = async () => {
    if (user) {
      console.log('Testing redirect for user:', user.uid);
      try {
        const role = await AuthService.getUserRole(user.uid);
        console.log('Role determined:', role);
        
        if (role === 'admin') {
          console.log('Redirecting to admin');
          router.push('/admin');
        } else {
          console.log('Redirecting to dashboard');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error in test redirect:', error);
      }
    }
  };

  const handleCreateProfile = async () => {
    if (user) {
      try {
        await AuthService.createUserProfile(user);
        console.log('Profile created successfully');
        window.location.reload();
      } catch (error) {
        console.error('Error creating profile:', error);
      }
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
        <h1 className="text-3xl font-bold text-[#5E4E06] mb-8">Authentication Debug Page</h1>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#5E4E06] mb-4">Current State</h2>
          
          <div className="space-y-4">
            <div>
              <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User:</strong> {user ? user.uid : 'None'}
            </div>
            <div>
              <strong>Email:</strong> {user?.email || 'None'}
            </div>
            <div>
              <strong>Role (from hook):</strong> {role || 'None'}
            </div>
            <div>
              <strong>Has Profile:</strong> {userProfile ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#5E4E06] mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#5E4E06] mb-4">Actions</h2>
          
          <div className="space-y-4">
            <button
              onClick={handleTestRedirect}
              className="bg-[#D4AF37] hover:bg-[#8B7A1A] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Test Redirect
            </button>
            
            {user && !userProfile && (
              <button
                onClick={handleCreateProfile}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors ml-4"
              >
                Create User Profile
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors ml-4"
            >
              Refresh Page
            </button>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-[#D4AF37] p-8">
          <h2 className="text-2xl font-bold text-[#5E4E06] mb-4">Navigation</h2>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push('/login')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mr-4"
            >
              Go to Login
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors mr-4"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={() => router.push('/admin')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go to Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 