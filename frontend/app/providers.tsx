'use client';

import { ReactNode } from 'react';
import { QueryProvider, ReduxProvider, ThemeProvider, ToastProvider, PersonalizationProvider, GlobalExperienceProvider } from '@/providers';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <QueryProvider>
        <ThemeProvider>
          <ToastProvider>
            <PersonalizationProvider>
              <GlobalExperienceProvider>
                {children}
              </GlobalExperienceProvider>
            </PersonalizationProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
