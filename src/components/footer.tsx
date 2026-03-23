'use client';

import Link from 'next/link';

import { useSiteCopy } from '@/components/locale-provider';
import { BrandLockup } from '@/components/brand-lockup';
import { docsPageSlugs } from '@/lib/site-content';

export function Footer() {
  const copy = useSiteCopy();
  const productLinks = [
    { label: copy.navigation.docs, href: '/docs' },
    { label: copy.navigation.apiReference, href: '/docs/api-reference' },
    { label: copy.navigation.examples, href: '/docs/examples' },
    { label: copy.navigation.faq, href: '/faq' },
  ];
  const docsLinks = docsPageSlugs.map((slug) => ({
    label: copy.docsPages[slug].label,
    href: `/docs/${slug}`,
  }));
  const policyLinks = [
    { label: copy.footer.privacy, href: '/legal/privacy' },
    { label: copy.footer.terms, href: '/legal/terms' },
    { label: copy.footer.faq, href: '/faq' },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="wide-shell py-8 sm:py-10 md:py-14">
        <div className="grid gap-8 border-t border-border pt-8 sm:gap-10 lg:grid-cols-[minmax(0,1.25fr)_repeat(3,minmax(0,0.8fr))]">
          <div className="space-y-4">
            <BrandLockup href="/" size="md" ariaLabel={copy.brand.homeAriaLabel} />
            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              {copy.footer.description}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{copy.footer.explore}</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {productLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{copy.footer.documentation}</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {docsLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{copy.footer.policies}</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {policyLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{copy.footer.copyright}</p>
          <p>{copy.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
