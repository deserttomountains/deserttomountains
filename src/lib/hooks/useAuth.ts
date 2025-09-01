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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Don't set up auth listener if we're signing out
    if (isSigningOut) {
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', { user: user?.uid, email: user?.email, isSigningOut });
      
      if (user && !isSigningOut) {
        try {
          // Keep loading true until we have both user and role
          setAuthState(prev => ({ ...prev, user, loading: true }));
          
          // Get user profile and role in parallel for better performance
          const [profile, role] = await Promise.all([
            AuthService.getUserProfile(user.uid),
            AuthService.getUserRole(user.uid)
          ]);
          
          console.log('User profile loaded:', { 
            uid: user.uid, 
            role, 
            hasProfile: !!profile,
            profileEmail: profile?.email
          });
          
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
        console.log('User signed out');
        // Clear auth state immediately without any Firestore calls
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          role: null
        });
      }
    });

    return () => {
      unsubscribe();
      // Cleanup any registered listeners
      AuthService.unregisterListener(() => {
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          role: null
        });
      });
    };
  }, [isSigningOut]);

  const signOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Clear all local state first to prevent race conditions
      setAuthState({
        user: null,
        userProfile: null,
        loading: false,
        role: null
      });
      
      // Clear any stored data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingSignup');
        sessionStorage.clear();
        
        // Clear any cached auth data
        Object.keys(localStorage).forEach(key => {
          if (key.includes('firebase') || key.includes('auth') || key.includes('user')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Register this component's cleanup for the AuthService
      AuthService.registerListenerForCleanup(() => {
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          role: null
        });
      });
      
      await AuthService.signOut();
      
      // Always redirect to login, even if there's an error
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still redirect to login even if signOut fails
      router.push('/login');
    } finally {
      setIsSigningOut(false);
    }
  };

  const redirectBasedOnRole = async (uid: string) => {
    try {
      console.log('Redirecting based on role for user:', uid);
      
      // Reduced delay to prevent race conditions while ensuring auth state is stable
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const role = await AuthService.getUserRole(uid);
      console.log('User role determined:', role);
      
      if (role === 'admin') {
        console.log('Redirecting to admin dashboard');
        router.push('/admin');
      } else {
        console.log('Redirecting to customer dashboard');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error getting user role:', error);
      // Default to customer dashboard on error
      console.log('Defaulting to customer dashboard due to error');
      router.push('/dashboard');
    }
  };

  return {
    ...authState,
    signOut,
    redirectBasedOnRole
  };
}; 