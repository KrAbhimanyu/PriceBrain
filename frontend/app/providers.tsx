'use client';

import { ReactNode } from 'react';
import { QueryProvider, ReduxProvider, ThemeProvider, ToastProvider, PersonalizationProvider } from '@/providers';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ThemeProvider>
          <ToastProvider>
            <PersonalizationProvider>
              {children}
            </PersonalizationProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
