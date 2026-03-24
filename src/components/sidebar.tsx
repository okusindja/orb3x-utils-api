'use client';

import Link from 'next/link';

import { useSiteCopy } from '@/components/locale-provider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { docsPageSlugs } from '@/lib/site-content';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const copy = useSiteCopy();
  const pathname = usePathname();
  const router = useRouter();
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
  const versionOptions = [
    {
      value: 'v1',
      label: copy.docsOverview.versionCurrent,
      href: pathname.startsWith('/docs') ? pathname : '/docs',
    },
  ];
  const activeVersion = versionOptions[0]?.value ?? 'v1';

  return (
    <>
      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
        {docsNavigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? 'page' : undefined}
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

      <aside className="sticky top-24 hidden self-start lg:block">
        <div className="h-[calc(100svh-7rem)] border-r border-border pr-2">
          <ScrollArea className="h-full">
            <div className="space-y-5 pb-5 pr-3">
              <div className="space-y-2 border-b border-border pb-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    {copy.docsOverview.versionLabel}
                  </p>
                  <Badge variant="secondary" className="px-2.5 py-1 text-[0.65rem] tracking-[0.18em]">
                    {copy.docsOverview.versionLatest}
                  </Badge>
                </div>
                <div className="relative">
                  <Select
                    value={activeVersion}
                    onValueChange={(value) => {
                      const selectedVersion = versionOptions.find((option) => option.value === value);

                      if (selectedVersion) {
                        router.push(selectedVersion.href);
                      }
                    }}
                  >
                    <SelectTrigger aria-label={copy.docsOverview.versionSelectorLabel}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {versionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">
                  {copy.docsOverview.versionDescription}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  {copy.docsOverview.eyebrow}
                </p>
                <p className="text-sm leading-7 text-muted-foreground">
                  {copy.docsOverview.navDescription}
                </p>
              </div>
            </div>

            <nav aria-label={copy.docsOverview.eyebrow} className="border-t border-border pt-4 pr-3">
              <ul className="space-y-2 pb-6">
                {docsNavigation.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
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
          </ScrollArea>
        </div>
      </aside>
    </>
  );
}
