'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { AuthForm } from '../../../components/auth/auth-form';
import { useAuth } from '../../../hooks/useAuth';

export default function RegisterPage() {
  const { user, isLoading, registerMutation, router } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [isLoading, router, user]);

  return (
    <main className="mx-auto grid min-h-screen max-w-5xl place-items-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Task Manager</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">Create account</h1>
        <p className="mt-2 text-sm text-zinc-600">Start planning and completing tasks faster.</p>
        <div className="mt-5">
          <AuthForm
            mode="register"
            isLoading={registerMutation.isPending}
            onSubmit={async (values) => {
              try {
                await registerMutation.mutateAsync({
                  email: values.email,
                  password: values.password,
                  name: values.name
                });
                toast.success('Account created');
              } catch (error) {
                toast.error((error as Error).message);
              }
            }}
          />
        </div>
        <p className="mt-5 text-sm text-zinc-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-zinc-900 hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
