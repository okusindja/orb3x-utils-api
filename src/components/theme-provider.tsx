'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

function resolveThemePreference(): Theme {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Theme preference is applied after mount so the server and first client render stay aligned.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(resolveThemePreference());
    setIsReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;

    if (!isReady) {
      return;
    }

    localStorage.setItem('theme', theme);
  }, [isReady, theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
