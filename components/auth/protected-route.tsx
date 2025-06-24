"use client";

import { useAuth } from '@/components/auth/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);

  console.log('[PROTECTED ROUTE] Current state:', { 
    user: !!user, 
    isLoading, 
    pathname,
    userDetails: user ? { id: user.id, email: user.email } : null
  });

  useEffect(() => {
    console.log('[PROTECTED ROUTE] useEffect triggered:', { user: !!user, isLoading });
    
    // Clear any existing timeout
    if (redirectTimeout) {
      clearTimeout(redirectTimeout);
      setRedirectTimeout(null);
    }
    
    if (!isLoading && !user) {
      console.log('[PROTECTED ROUTE] No user found, setting redirect timeout...');
      // Add a small delay to allow for auth state updates after login
      const timeout = setTimeout(() => {
        console.log('[PROTECTED ROUTE] Redirecting to login after timeout');
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      }, 200);
      setRedirectTimeout(timeout);
    } else if (!isLoading && user) {
      console.log('[PROTECTED ROUTE] User authenticated, allowing access');
    }
    
    // Cleanup function
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    console.log('[PROTECTED ROUTE] Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-red-600 animate-spin mb-4" />
          <p className="text-gray-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[PROTECTED ROUTE] No user, showing loading while redirect timeout is active');
    // Show loading while we wait for potential auth state update or redirect
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 text-red-600 animate-spin mb-4" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  console.log('[PROTECTED ROUTE] Rendering protected content');
  return <>{children}</>;
}
