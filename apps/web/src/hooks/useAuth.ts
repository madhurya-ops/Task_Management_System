'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../lib/auth/auth-store';
import { authApi } from '../lib/api/auth';

export const useAuth = () => {
  const router = useRouter();
  const { user, setUser, clear, isLoading, setLoading } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      router.push('/dashboard');
    }
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setUser(data.user);
      router.push('/dashboard');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clear();
      router.push('/login');
    }
  });

  return {
    router,
    user,
    isLoading,
    setLoading,
    setUser,
    loginMutation,
    registerMutation,
    logoutMutation
  };
};
