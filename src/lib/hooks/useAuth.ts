import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, AuthService, UserProfile, UserRole } from '@/lib/firebase';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    role: null
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Get user profile and role
          const profile = await AuthService.getUserProfile(user.uid);
          const role = await AuthService.getUserRole(user.uid);
          
          setAuthState({
            user,
            userProfile: profile,
            loading: false,
            role
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
          setAuthState({
            user,
            userProfile: null,
            loading: false,
            role: 'customer' // Default role on error
          });
        }
      } else {
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          role: null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await AuthService.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const redirectBasedOnRole = async (uid: string) => {
    try {
      const role = await AuthService.getUserRole(uid);
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error getting user role:', error);
      // Default to customer dashboard on error
      router.push('/dashboard');
    }
  };

  return {
    ...authState,
    signOut,
    redirectBasedOnRole
  };
}; 