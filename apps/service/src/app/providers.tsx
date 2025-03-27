'use client';
import { client } from '@apis';
import { AuthProvider } from '@contexts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type * as React from 'react';

import authMiddleware from '@/apis/authMiddleware';

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  client.use(authMiddleware);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <div style={{ fontSize: '16px' }}>
          <ReactQueryDevtools />
        </div>
      </QueryClientProvider>
    </AuthProvider>
  );
}
