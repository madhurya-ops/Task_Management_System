'use client';

import { useEffect } from 'react';
import { session } from '../../lib/auth/session';
import { useAuthStore } from '../../lib/auth/auth-store';

export function AuthBoot({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const user = await session.bootstrap();
        if (mounted) {
          setUser(user);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [setLoading, setUser]);

  return <>{children}</>;
}
