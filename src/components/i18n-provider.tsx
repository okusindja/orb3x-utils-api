'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { initI18n } from '@/lib/i18n';

const I18nContext = createContext<boolean>(false);

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initI18n();
  }, []);

  return <I18nContext.Provider value={true}>{children}</I18nContext.Provider>;
}

export function useI18nReady() {
  return useContext(I18nContext);
}