'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'Supporter' | 'Creator' | 'Admin'>;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to default home for their role
        if (user.role === 'Creator') {
          router.push('/dashboard/creator-home');
        } else if (user.role === 'Admin') {
          router.push('/dashboard/admin-home');
        } else {
          router.push('/dashboard/supporter-home');
        }
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9F5] text-[#172033]">
        <div className="w-12 h-12 border-4 border-[#FF6B4A] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-semibold text-slate-600">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
