'use client';

import Link from 'next/link';

import { BrandLockup } from '@/components/brand-lockup';
import { useSiteCopy } from '@/components/locale-provider';
import { Eyebrow } from '@/components/site-primitives';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  const copy = useSiteCopy();

  return (
    <div className="page-shell flex min-h-[70vh] items-center py-12 md:py-16">
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent className="space-y-6 px-6 py-8 sm:px-8 sm:py-10">
          <Eyebrow>{copy.notFound.eyebrow}</Eyebrow>
          <BrandLockup size="md" ariaLabel={copy.brand.homeAriaLabel} />
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              {copy.notFound.title}
            </h1>
            <p className="text-base leading-8 text-muted-foreground">{copy.notFound.description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/" className={buttonVariants()}>
              {copy.notFound.primaryCta}
            </Link>
            <Link href="/docs" className={buttonVariants({ variant: 'outline' })}>
              {copy.notFound.secondaryCta}
            </Link>
            <Link href="/faq" className={buttonVariants({ variant: 'outline' })}>
              {copy.notFound.tertiaryCta}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
