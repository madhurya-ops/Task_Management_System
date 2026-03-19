'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AuthForm } from '../../components/auth/auth-form';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { user, isLoading, loginMutation, router } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, router, user]);

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl place-items-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Task Manager</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
        <p className="mt-2 text-sm text-zinc-600">Sign in to continue managing your work.</p>
        <div className="mt-5">
          <AuthForm
            mode="login"
            isLoading={loginMutation.isPending}
            onSubmit={async (values) => {
              try {
                await loginMutation.mutateAsync({ email: values.email, password: values.password });
                toast.success('Signed in');
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
          />
        </div>
        <p className="mt-5 text-sm text-zinc-600">
          No account?{' '}
          <Link href="/register" className="font-semibold text-zinc-900 hover:underline">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
