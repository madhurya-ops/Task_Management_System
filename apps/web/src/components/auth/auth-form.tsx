'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value;
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    },
    z.string().min(1).max(120).optional()
  )
});

export type AuthFormValues = z.infer<typeof schema>;

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (values: AuthFormValues) => Promise<void>;
  isLoading: boolean;
}

const inputClass =
  'mt-1 w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100';

export function AuthForm({ mode, onSubmit, isLoading }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      name: ''
    }
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit((values) => onSubmit(values))}>
      {mode === 'register' && (
        <label className="block text-sm font-medium text-zinc-700">
          Name
          <input className={inputClass} placeholder="Jane Doe" {...register('name')} />
          {errors.name && (
            <p className="mt-1 rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs text-red-700">
              {errors.name.message}
            </p>
          )}
        </label>
      )}

      <label className="block text-sm font-medium text-zinc-700">
        Email
        <input className={inputClass} type="email" placeholder="you@example.com" {...register('email')} />
        {errors.email && (
          <p className="mt-1 rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs text-red-700">
            {errors.email.message}
          </p>
        )}
      </label>

      <label className="block text-sm font-medium text-zinc-700">
        Password
        <input className={inputClass} type="password" placeholder="********" {...register('password')} />
        {errors.password && (
          <p className="mt-1 rounded-lg border border-red-100 bg-red-50 px-2 py-1 text-xs text-red-700">
            {errors.password.message}
          </p>
        )}
      </label>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        type="submit"
        disabled={isLoading}
      >
        {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />}
        {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  );
}
