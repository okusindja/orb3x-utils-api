'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getSiteCopy, isSiteLocale, supportedLocales, type SiteLocale } from '@/lib/site-copy';

type LocaleContextType = {
  locale: SiteLocale;
  setLocale: (locale: SiteLocale) => void;
};

const DEFAULT_LOCALE: SiteLocale = 'en';

const LocaleContext = createContext<LocaleContextType>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

function resolveLocalePreference(): SiteLocale {
  const stored = localStorage.getItem('locale');

  if (stored && isSiteLocale(stored)) {
    return stored;
  }

  const cookieValue = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith('locale='))
    ?.split('=')[1];

  if (cookieValue && isSiteLocale(cookieValue)) {
    return cookieValue;
  }

  const browserLocale = window.navigator.language.slice(0, 2);

  if (isSiteLocale(browserLocale)) {
    return browserLocale;
  }

  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SiteLocale>(DEFAULT_LOCALE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Preferences are resolved after mount so SSR and hydration start from the same locale.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(resolveLocalePreference());
    setIsReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;

    if (!isReady) {
      return;
    }

    localStorage.setItem('locale', locale);
    document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [isReady, locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (nextLocale: SiteLocale) => {
        if (supportedLocales.includes(nextLocale)) {
          setLocaleState(nextLocale);
        }
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useSiteCopy() {
  const { locale } = useLocale();
  return getSiteCopy(locale);
}
