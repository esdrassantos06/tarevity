'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { isDevelopment } from '@/utils/variables';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes in cache
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
            structuralSharing: true,
          },
          mutations: {
            retry: 1,
            retryDelay: 1000,
            networkMode: 'online',
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
