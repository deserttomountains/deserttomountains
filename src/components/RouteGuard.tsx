'use client';

import { useEffect, useState, useMemo } from 'react';
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

  // Memoize the authentication check to prevent unnecessary re-runs
  const authCheck = useMemo(() => {
    if (loading) return { shouldRedirect: false, redirectPath: null };
    
    // If user is not authenticated
    if (!user) {
      return { 
        shouldRedirect: true, 
        redirectPath: `/login?redirect=${encodeURIComponent(pathname)}` 
      };
    }
    
    // If role is required and user doesn't have the required role
    if (requiredRole && role !== requiredRole) {
      if (redirectTo) {
        return { shouldRedirect: true, redirectPath: redirectTo };
      } else {
        // Default redirect based on user's actual role
        if (role === 'admin') {
          return { shouldRedirect: true, redirectPath: '/admin' };
        } else {
          return { shouldRedirect: true, redirectPath: '/dashboard' };
        }
      }
    }
    
    // Access granted
    return { shouldRedirect: false, redirectPath: null };
  }, [user, role, loading, requiredRole, redirectTo, pathname]);

  useEffect(() => {
    console.log('RouteGuard: Checking access...', {
      user: user?.uid,
      role,
      loading,
      requiredRole,
      redirectTo,
      currentPath: pathname,
      authCheck
    });
    
    if (!loading && authCheck.shouldRedirect && !isRedirecting) {
      console.log('RouteGuard: Redirecting to:', authCheck.redirectPath);
      setIsRedirecting(true);
      router.push(authCheck.redirectPath!);
    } else if (!loading && !authCheck.shouldRedirect) {
      console.log('RouteGuard: Access granted');
      setIsRedirecting(false);
    }
  }, [authCheck, loading, router, isRedirecting]);

  // Reset redirecting state when pathname changes (but don't re-run auth check)
  useEffect(() => {
    if (user && role && (!requiredRole || role === requiredRole)) {
      // User is authenticated and has the right role, just reset redirecting state
      setIsRedirecting(false);
    }
  }, [pathname, user, role, requiredRole]);

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