'use client';

import { ReactNode } from 'react';
import { LocaleProvider } from '@/components/locale-provider';
import { ThemeProvider } from '@/components/theme-provider';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </LocaleProvider>
  );
}
