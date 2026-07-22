'use client';

import { ReactNode } from 'react';
import { QueryProvider, ReduxProvider, ThemeProvider, ToastProvider } from '@/providers';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
