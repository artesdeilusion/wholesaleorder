'use client';

import { useAuth } from '@/app/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  fallback = <div>Loading...</div>
}: AuthGuardProps) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  console.log('🔍 AuthGuard: Current state - loading:', loading, 'user:', user?.email, 'role:', role);
  console.log('🔍 AuthGuard: Requirements - requireAuth:', requireAuth, 'requireAdmin:', requireAdmin);

  useEffect(() => {
    if (!loading) {
      console.log('🔍 AuthGuard: Loading finished, checking requirements...');
      
      if (requireAuth && !user) {
        console.log('🔍 AuthGuard: No user found, redirecting to login');
        router.push('/login');
      } else if (requireAdmin && role !== 'admin') {
        console.log('🔍 AuthGuard: User is not admin, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('🔍 AuthGuard: Requirements met, rendering children');
      }
    }
  }, [user, loading, requireAuth, requireAdmin, router, role]);

  if (loading) {
    console.log('🔍 AuthGuard: Still loading, showing fallback');
    return <>{fallback}</>;
  }

  if (requireAuth && !user) {
    console.log('🔍 AuthGuard: No user and auth required, showing nothing');
    return null;
  }

  if (requireAdmin && role !== 'admin') {
    console.log('🔍 AuthGuard: User is not admin and admin required, showing nothing');
    return null;
  }

  console.log('🔍 AuthGuard: Rendering children');
  return <>{children}</>;
}

export function AdminGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  if (loading) return fallback || null;
  if (!user || (role !== 'admin' && role !== 'customer')) return fallback || null;
  return <>{children}</>;
}

export function ClientGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user, loading, role } = useAuth();

  if (loading) {
    return <>{fallback}</>;
  }

  if (role !== 'customer') {
    return null;
  }

  return <>{children}</>;
} 