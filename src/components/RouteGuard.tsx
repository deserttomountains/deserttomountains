'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { UserRole } from '@/lib/firebase';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export const RouteGuard = ({ 
  children, 
  requiredRole, 
  redirectTo 
}: RouteGuardProps) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log('RouteGuard: Checking access...', {
      user: user?.uid,
      role,
      loading,
      requiredRole,
      redirectTo,
      currentPath: pathname
    });
    
    if (!loading) {
      // Add small delay to ensure auth state is stable and prevent race conditions
      const timer = setTimeout(() => {
        // Prevent infinite redirects
        if (isRedirecting) {
          console.log('RouteGuard: Already redirecting, skipping...');
          return;
        }

        // If user is not authenticated, redirect to login with current path as redirect
        if (!user) {
          console.log('RouteGuard: No user, redirecting to login with redirect:', pathname);
          setIsRedirecting(true);
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }

        // If role is required and user doesn't have the required role
        if (requiredRole && role !== requiredRole) {
          console.log('RouteGuard: Role mismatch, redirecting...', {
            requiredRole,
            actualRole: role
          });
          setIsRedirecting(true);
          if (redirectTo) {
            router.push(redirectTo);
          } else {
            // Default redirect based on user's actual role
            if (role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          }
          return;
        }
        
        console.log('RouteGuard: Access granted');
        // Reset redirecting state when access is granted
        setIsRedirecting(false);
      }, 100); // Small delay to prevent race conditions

      return () => clearTimeout(timer);
    }
  }, [user, role, loading, requiredRole, redirectTo, router, pathname]);

  // Reset redirecting state when pathname changes
  useEffect(() => {
    setIsRedirecting(false);
  }, [pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('RouteGuard: Loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  // If user is not authenticated, don't render children
  if (!user) {
    console.log('RouteGuard: No user, not rendering children');
    return null;
  }

  // If role is required and user doesn't have the required role, don't render children
  if (requiredRole && role !== requiredRole) {
    console.log('RouteGuard: Role mismatch, not rendering children');
    return null;
  }

  // User is authenticated and has the required role (if any)
  console.log('RouteGuard: Rendering children');
  return <>{children}</>;
};

// Specific route guards for common use cases
export const AdminRouteGuard = ({ children }: { children: React.ReactNode }) => (
  <RouteGuard requiredRole="admin" redirectTo="/dashboard">
    {children}
  </RouteGuard>
);

export const CustomerRouteGuard = ({ children }: { children: React.ReactNode }) => (
  <RouteGuard requiredRole="customer" redirectTo="/admin">
    {children}
  </RouteGuard>
);

export const AuthRouteGuard = ({ children }: { children: React.ReactNode }) => (
  <RouteGuard>
    {children}
  </RouteGuard>
); 