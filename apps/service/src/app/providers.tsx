'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type * as React from 'react';

import { client } from '@apis';
import authMiddleware from '@/apis/authMiddleware';
import Toast from '@/components/common/Toast';

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  client.use(authMiddleware);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <Toast />
    </QueryClientProvider>
  );
}
