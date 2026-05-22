'use client';

import { ReactNode } from 'react';
import { LocaleProvider } from '@/components/locale-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Analytics } from "@vercel/analytics/next"

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <ThemeProvider>
        <Analytics />
        {children}
      </ThemeProvider>
    </LocaleProvider>
  );
}
