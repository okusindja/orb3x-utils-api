'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useEffectEvent, useState } from 'react';

import { BrandLockup } from '@/components/brand-lockup';
import {
  CloseIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
} from '@/components/icons';
import LanguageSelector from '@/components/language-selector';
import { useSiteCopy } from '@/components/locale-provider';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const copy = useSiteCopy();
  const pathname = usePathname();
  const isDark = theme === 'dark';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const navigationItems = [
    { href: '/docs', label: copy.navigation.docs },
    { href: '/docs/api-reference', label: copy.navigation.apiReference },
    { href: '/docs/examples', label: copy.navigation.examples },
    { href: '/faq', label: copy.navigation.faq },
  ];
  const toggleLabel = isDark ? copy.header.themeToLight : copy.header.themeToDark;
  const menuLabel = isMenuOpen ? copy.header.closeMenu : copy.header.openMenu;

  const syncCompactState = useEffectEvent(() => {
    setIsCompact(window.scrollY > 18);
  });

  useEffect(() => {
    syncCompactState();
    window.addEventListener('scroll', syncCompactState, { passive: true });

    return () => {
      window.removeEventListener('scroll', syncCompactState);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/docs') {
      return pathname === '/docs';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <motion.header
      layout
      className="sticky top-0 z-50 border-b border-border backdrop-blur-xl"
      style={{
        backgroundColor: 'var(--header-background)',
        boxShadow: 'var(--header-shadow)',
      }}
    >
      <div
        className={cn(
          'wide-shell transition-[padding] duration-200 ease-out',
          isCompact ? 'py-2.5 sm:py-3' : 'py-3.5 sm:py-4',
        )}
      >
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <BrandLockup
            href="/"
            size={isCompact ? 'xs' : 'sm'}
            ariaLabel={copy.brand.homeAriaLabel}
          />

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <nav className="hidden items-center gap-2 lg:flex">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-4 py-2 text-sm font-medium',
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            <div className="hidden lg:block">
              <Button
                type="button"
                onClick={toggleTheme}
                aria-label={toggleLabel}
                title={toggleLabel}
                variant="secondary"
                size="icon"
                className="rounded-full"
              >
                {isDark ? (
                  <SunIcon className="size-4.5" />
                ) : (
                  <MoonIcon className="size-4.5" />
                )}
                <span className="sr-only">{toggleLabel}</span>
              </Button>
            </div>

            <Button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              aria-label={menuLabel}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              title={menuLabel}
              variant="outline"
              size="icon"
              className="rounded-full lg:hidden"
            >
              {isMenuOpen ? (
                <CloseIcon className="size-4.5" />
              ) : (
                <MenuIcon className="size-4.5" />
              )}
              <span className="sr-only">{menuLabel}</span>
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isMenuOpen ? (
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 lg:hidden"
            >
              <Card className="overflow-hidden">
                <CardContent className="space-y-5 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      {copy.header.navigation}
                    </p>
                    <Button
                      type="button"
                      onClick={toggleTheme}
                      aria-label={toggleLabel}
                      title={toggleLabel}
                      variant="secondary"
                      size="icon"
                      className="rounded-full"
                    >
                      {isDark ? (
                        <SunIcon className="size-4.5" />
                      ) : (
                        <MoonIcon className="size-4.5" />
                      )}
                      <span className="sr-only">{toggleLabel}</span>
                    </Button>
                  </div>

                  <nav className="grid gap-2">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          'rounded-lg border px-4 py-3 text-sm font-medium',
                          isActive(item.href)
                            ? 'border-transparent bg-primary text-primary-foreground'
                            : 'border-border bg-card text-foreground hover:bg-secondary',
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Link
                      href="/legal/privacy"
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary"
                    >
                      {copy.navigation.privacy}
                    </Link>
                  </nav>

                  <div className="border-t border-border pt-4">
                    <LanguageSelector />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
