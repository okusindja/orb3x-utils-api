'use client';

import Link from 'next/link';

import { useSiteCopy } from '@/components/locale-provider';
import { CodeBlock, DataTable, Eyebrow } from '@/components/site-primitives';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { docsPageSlugs } from '@/lib/site-content';
import {
  CalendarIcon,
  CalculatorIcon,
  ClockIcon,
  FileTextIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldIcon,
} from '@/components/icons';

const routeItems = [
  { slug: 'validation', href: '/docs/validation', method: 'GET', path: '/api/v1/validate/*', icon: <ShieldIcon className="size-4" /> },
  { slug: 'phone', href: '/docs/phone', method: 'GET', path: '/api/v1/phone/*', icon: <PhoneIcon className="size-4" /> },
  { slug: 'address-geo', href: '/docs/address-geo', method: 'GET', path: '/api/v1/address/* + /api/v1/geo/*', icon: <MapPinIcon className="size-4" /> },
  { slug: 'calendar', href: '/docs/calendar', method: 'GET', path: '/api/v1/calendar/*', icon: <CalendarIcon className="size-4" /> },
  { slug: 'finance', href: '/docs/finance', method: 'GET', path: '/api/v1/finance/*', icon: <CalculatorIcon className="size-4" /> },
  { slug: 'salary', href: '/docs/salary', method: 'GET', path: '/api/v1/salary/*', icon: <CalculatorIcon className="size-4" /> },
  { slug: 'time', href: '/docs/time', method: 'GET', path: '/api/v1/time/*', icon: <ClockIcon className="size-4" /> },
  { slug: 'documents', href: '/docs/documents', method: 'POST', path: '/api/v1/documents/*', icon: <FileTextIcon className="size-4" /> },
] as const;

const onPageIds = ['start-here', 'routes', 'shared-behavior', 'quickstart'] as const;

export default function DocsPage() {
  const copy = useSiteCopy();

  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_14rem]">
      <article className="min-w-0">
        <header className="border-b border-border pb-8 md:pb-10">
          <Eyebrow>{copy.docsOverview.eyebrow}</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {copy.docsOverview.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
            {copy.docsOverview.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/docs/getting-started" className={buttonVariants()}>
              {copy.docsOverview.primaryCta}
            </Link>
            <Link href="/docs/examples" className={buttonVariants({ variant: 'outline' })}>
              {copy.docsOverview.secondaryCta}
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {copy.docsOverview.stats.map((item) => (
              <div key={item.label} className="border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </header>

        <section id="start-here" className="scroll-mt-28 border-b border-border py-10">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{copy.docsOverview.startHereTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {copy.docsOverview.startHereDescription}
          </p>

          <Card className="mt-6 overflow-hidden">
            {docsPageSlugs.map((slug, index) => (
              <Link
                key={slug}
                href={`/docs/${slug}`}
                className={`block px-4 py-4 hover:bg-accent ${index !== docsPageSlugs.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground">
                      {copy.docsPages[slug].label}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">
                      {copy.docsPages[slug].description}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-primary">{copy.docsOverview.open}</span>
                </div>
              </Link>
            ))}
          </Card>
        </section>

        <section id="routes" className="scroll-mt-28 border-b border-border py-10">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{copy.docsOverview.routesTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {copy.docsOverview.routesDescription}
          </p>

          <Card className="mt-6 overflow-hidden">
            {routeItems.map((route, index) => (
              <Link
                key={route.href}
                href={route.href}
                className={`block px-4 py-4 hover:bg-accent ${index !== routeItems.length - 1 ? 'border-b border-border' : ''}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                      {route.icon}
                      <span>{copy.docsPages[route.slug].label}</span>
                    </div>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">{copy.docsPages[route.slug].description}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    <span>{route.method}</span>
                    <span>{route.path}</span>
                  </div>
                </div>
              </Link>
            ))}
          </Card>
        </section>

        <section id="shared-behavior" className="scroll-mt-28 border-b border-border py-10">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {copy.docsOverview.sharedBehaviorTitle}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {copy.docsOverview.sharedBehaviorDescription}
          </p>
          <div className="mt-6">
            <DataTable columns={copy.docsOverview.sharedBehaviorColumns} rows={copy.docsOverview.sharedBehaviorRows} />
          </div>
        </section>

        <section id="quickstart" className="scroll-mt-28 py-10">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{copy.docsOverview.quickstartTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
            {copy.docsOverview.quickstartDescription}
          </p>
          <div className="mt-6">
            <CodeBlock
              label={copy.docsOverview.quickstartLabel}
              language="bash"
              code={`curl -s "https://orb3x-utils-api.vercel.app/api/v1/validate/bank-account?account=004000010123456789012"

curl -s "https://orb3x-utils-api.vercel.app/api/v1/phone/validate?phone=%2B244923456789"

curl -s "https://orb3x-utils-api.vercel.app/api/v1/finance/vat?amount=114000&inclusive=true"

curl -s -X POST https://orb3x-utils-api.vercel.app/api/v1/documents/receipt \\
  -H "Content-Type: application/json" \\
  -d '{"receivedFrom":{"name":"Cliente Exemplo"},"amount":100000}'`}
            />
          </div>
        </section>
      </article>

      <aside className="hidden xl:block">
        <div className="sticky top-24 space-y-6 border-l border-border pl-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {copy.docsOverview.onPageLabel}
            </p>
            <nav className="mt-4 space-y-1.5">
              {copy.docsOverview.onPageItems.map((item) => (
                <a
                  key={item}
                  href={`#${onPageIds[copy.docsOverview.onPageItems.indexOf(item)]}`}
                  className="block text-sm text-muted-foreground hover:text-foreground"
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </div>
  );
}
