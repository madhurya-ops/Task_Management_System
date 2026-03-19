'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth/auth-store';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return <main className="mx-auto max-w-5xl p-6 text-sm text-zinc-500">Restoring session...</main>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
