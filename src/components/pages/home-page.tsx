'use client';

import Link from 'next/link';

import { BrandLockup } from '@/components/brand-lockup';
import { CompanyWebsiteLink } from '@/components/company-website-link';
import { useSiteCopy } from '@/components/locale-provider';
import {
  BookIcon,
  CalendarIcon,
  CalculatorIcon,
  CompassIcon,
  CurrencyIcon,
  FileTextIcon,
  LayersIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldIcon,
  SparkIcon,
  ClockIcon,
  TranslateIcon,
} from '@/components/icons';
import { CodeSampleSwitcher, Eyebrow } from '@/components/site-primitives';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { curlToNodeSnippet } from '@/lib/docs-code';
import { docsPageSlugs } from '@/lib/site-content';

const routeItems = [
  { slug: 'validation', href: '/docs/validation', method: 'GET', path: '/api/v1/validate/*', icon: <ShieldIcon className="size-5" /> },
  { slug: 'phone', href: '/docs/phone', method: 'GET', path: '/api/v1/phone/*', icon: <PhoneIcon className="size-5" /> },
  { slug: 'address-geo', href: '/docs/address-geo', method: 'GET', path: '/api/v1/address/* + /api/v1/geo/*', icon: <MapPinIcon className="size-5" /> },
  { slug: 'calendar', href: '/docs/calendar', method: 'GET', path: '/api/v1/calendar/*', icon: <CalendarIcon className="size-5" /> },
  { slug: 'finance', href: '/docs/finance', method: 'GET', path: '/api/v1/finance/*', icon: <CalculatorIcon className="size-5" /> },
  { slug: 'salary', href: '/docs/salary', method: 'GET', path: '/api/v1/salary/*', icon: <LayersIcon className="size-5" /> },
  { slug: 'time', href: '/docs/time', method: 'GET', path: '/api/v1/time/*', icon: <ClockIcon className="size-5" /> },
  { slug: 'documents', href: '/docs/documents', method: 'POST', path: '/api/v1/documents/*', icon: <FileTextIcon className="size-5" /> },
] as const;

const docsIcons = [
  <BookIcon key="book" className="size-4" />,
  <CompassIcon key="compass" className="size-4" />,
  <LayersIcon key="layers" className="size-4" />,
  <ShieldIcon key="shield" className="size-4" />,
  <PhoneIcon key="phone" className="size-4" />,
  <MapPinIcon key="map" className="size-4" />,
  <CalendarIcon key="calendar" className="size-4" />,
  <CalculatorIcon key="calculator" className="size-4" />,
  <ClockIcon key="clock" className="size-4" />,
  <FileTextIcon key="file" className="size-4" />,
  <TranslateIcon key="translate" className="size-4" />,
  <CurrencyIcon key="currency" className="size-4" />,
  <SparkIcon key="spark" className="size-4" />,
];

const homeQuickRequestCurl = `curl -s "https://utils.api.orb3x.com/api/v1/validate/iban?iban=AO06004000010123456789012"

curl -s "https://utils.api.orb3x.com/api/v1/address/suggest?q=talatona&type=municipality"

curl -s "https://utils.api.orb3x.com/api/v1/salary/net?gross=500000&year=2026"

curl -s -X POST https://utils.api.orb3x.com/api/v1/documents/invoice \\
  -H "Content-Type: application/json" \\
  -d '{"seller":{"name":"Orb3x, Lda"},"buyer":{"name":"Cliente Exemplo"},"items":[{"description":"Service","quantity":1,"unitPrice":100000,"vatRate":14}]}'`;

const homeQuickRequestNode = curlToNodeSnippet(homeQuickRequestCurl);

export function HomePage() {
  const copy = useSiteCopy();

  return (
    <div className="page-shell py-10 sm:py-12 md:py-16">
      <section className="grid gap-12 border-b border-border pb-12 md:pb-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
        <div className="min-w-0 space-y-6">
          <Eyebrow>{copy.home.eyebrow}</Eyebrow>
          <div className="space-y-5">
            <BrandLockup size="lg" />
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {copy.home.title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {copy.home.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/docs/getting-started" className={buttonVariants({ size: 'lg' })}>
              {copy.home.primaryCta}
            </Link>
            <Link href="/docs/examples" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              {copy.home.secondaryCta}
            </Link>
          </div>

          <div className="space-y-2 border-l-2 border-border pl-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {copy.home.ownershipLabel}
            </p>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
              {copy.home.ownershipDescription}
            </p>
            <CompanyWebsiteLink
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              {copy.home.ownershipCta}
              <span aria-hidden="true">→</span>
            </CompanyWebsiteLink>
          </div>

          <div className="grid gap-4 pt-2 sm:grid-cols-3">
            {copy.home.stats.map((item) => (
              <div key={item.label} className="border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <CodeSampleSwitcher
            samples={[
              {
                label: copy.home.quickRequestLabel,
                language: 'bash',
                code: homeQuickRequestCurl,
              },
              {
                label: copy.home.quickRequestNodeLabel,
                language: 'js',
                code: homeQuickRequestNode,
              },
            ]}
          />

          <div className="grid gap-3">
            {copy.home.notes.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-4 text-sm text-card-foreground">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="mt-2 leading-7 text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 border-b border-border py-12 md:py-16 md:grid-cols-2 xl:grid-cols-4">
        {routeItems.map((route) => (
          <div key={route.href} className="space-y-4">
            <div className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
              {route.icon}
            </div>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <span>{route.method}</span>
                <span>{route.path}</span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {copy.docsPages[route.slug].label}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">{copy.docsPages[route.slug].description}</p>
              <Link href={route.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {copy.docsOverview.open}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-10 border-b border-border py-12 md:py-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <Eyebrow>{copy.home.docs.eyebrow}</Eyebrow>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {copy.home.docs.title}
          </h2>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground">
            {copy.home.docs.description}
          </p>
          <div className="space-y-4">
            {copy.home.docs.bullets.map((item) => (
              <div key={item} className="border-l-2 border-border pl-4 text-sm leading-7 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border bg-secondary px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span>{copy.home.docs.tableLabel}</span>
            <span>{copy.home.docs.tableType}</span>
          </div>
          <div className="divide-y divide-border">
            {docsPageSlugs.map((slug, index) => (
              <Link
                key={slug}
                href={`/docs/${slug}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-4 py-4 hover:bg-accent"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {docsIcons[index % docsIcons.length]}
                    <span>{copy.docsPages[slug].label}</span>
                  </div>
                  <p className="mt-1 text-sm leading-7 text-muted-foreground">
                    {copy.docsPages[slug].description}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {copy.home.docs.tableTypeValue}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
