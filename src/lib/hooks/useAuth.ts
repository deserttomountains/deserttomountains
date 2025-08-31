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
          // Get user profile and role
          const profile = await AuthService.getUserProfile(user.uid);
          const role = await AuthService.getUserRole(user.uid);
          
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

    return () => unsubscribe();
  }, [isSigningOut]);

  const signOut = async () => {
    try {
      setIsSigningOut(true);
      await AuthService.signOut();
      // Redirect to login page instead of home page
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
      
      // Add a small delay to ensure Firebase auth state is fully updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
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