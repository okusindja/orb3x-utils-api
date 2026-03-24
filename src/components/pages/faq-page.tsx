'use client';

import Link from 'next/link';

import { useSiteCopy } from '@/components/locale-provider';
import { Eyebrow, PageIntro } from '@/components/site-primitives';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function FAQPage() {
  const copy = useSiteCopy();

  return (
    <div className="page-shell py-10 md:py-14">
      <div className="mx-auto max-w-5xl space-y-10">
        <PageIntro
          eyebrow={<Eyebrow>{copy.faq.eyebrow}</Eyebrow>}
          title={copy.faq.title}
          description={copy.faq.description}
          aside={
            <>
              {copy.faq.cards.map((card) => (
                <Card key={card.label}>
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{card.label}</p>
                    <p className="mt-3 text-base font-semibold tracking-tight text-foreground">{card.value}</p>
                  </CardContent>
                </Card>
              ))}
            </>
          }
        />

        <div className="grid gap-8 xl:grid-cols-2">
          {copy.faq.groups.map((group) => (
            <section key={group.title} className="space-y-4">
              <div className="border-b border-border pb-4">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{group.title}</h2>
              </div>
              <Card className="overflow-hidden">
                {group.items.map((item, index) => (
                  <div
                    key={item.question}
                    className={`px-5 py-5 ${index !== group.items.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.question}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </Card>
            </section>
          ))}
        </div>

        <section className="flex flex-col gap-5 border-t border-border pt-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{copy.faq.ctaTitle}</h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{copy.faq.ctaDescription}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/docs/getting-started" className={buttonVariants()}>
              {copy.faq.primaryCta}
            </Link>
            <Link href="/docs/api-reference" className={buttonVariants({ variant: 'outline' })}>
              {copy.faq.secondaryCta}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

