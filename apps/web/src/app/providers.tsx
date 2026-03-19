'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30_000,
          gcTime: 5 * 60_000,
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          refetchOnMount: false
        }
      }
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        theme="light"
        position="top-right"
        toastOptions={{
          className: 'border border-zinc-200 bg-white text-zinc-800 shadow-sm',
          descriptionClassName: 'text-zinc-500'
        }}
      />
    </QueryClientProvider>
  );
}
