'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type * as React from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <div style={{ fontSize: '16px' }}>
        <ReactQueryDevtools />
      </div>
    </QueryClientProvider>
  );
}
