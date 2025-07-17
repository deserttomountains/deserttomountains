'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (!loading) {
      // If user is not authenticated, redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      // If role is required and user doesn't have the required role
      if (requiredRole && role !== requiredRole) {
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
    }
  }, [user, role, loading, requiredRole, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6F0] via-[#F5F2E8] to-[#E6DCC0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  // If user is not authenticated, don't render children
  if (!user) {
    return null;
  }

  // If role is required and user doesn't have the required role, don't render children
  if (requiredRole && role !== requiredRole) {
    return null;
  }

  // User is authenticated and has the required role (if any)
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