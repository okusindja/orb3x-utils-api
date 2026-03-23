'use client';

import Link from 'next/link';

import { useSiteCopy } from '@/components/locale-provider';
import { docsPageSlugs } from '@/lib/site-content';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const copy = useSiteCopy();
  const pathname = usePathname();
  const docsNavigation = [
    {
      label: copy.docsOverview.navLabel,
      href: '/docs',
      description: copy.docsOverview.navDescription,
    },
    ...docsPageSlugs.map((slug) => ({
      label: copy.docsPages[slug].label,
      href: `/docs/${slug}`,
      description: copy.docsPages[slug].description,
    })),
  ];
  const isActive = (href: string) => {
    if (href === '/docs') {
      return pathname === '/docs';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
        {docsNavigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'whitespace-nowrap rounded-md border px-3.5 py-2 text-[0.8125rem] font-medium',
              isActive(item.href)
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border-r border-border pr-4">
          <div className="space-y-2 pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              {copy.docsOverview.eyebrow}
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              {copy.docsOverview.navDescription}
            </p>
          </div>

          <nav className="border-t border-border pt-4">
            <ul className="space-y-2">
              {docsNavigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block rounded-xl px-3 py-2.5 text-sm',
                      isActive(item.href)
                        ? 'bg-secondary font-semibold text-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <span className="block text-sm font-medium">{item.label}</span>
                    {item.description ? (
                      <span className="mt-1 block text-xs leading-5 opacity-80">{item.description}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
}
