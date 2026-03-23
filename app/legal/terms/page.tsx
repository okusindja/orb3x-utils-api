'use client';

import { useSiteCopy } from '@/components/locale-provider';
import { Eyebrow, PageIntro } from '@/components/site-primitives';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfUse() {
  const copy = useSiteCopy();
  const { legal } = copy;
  const sectionCopy = legal.terms;
  const lastUpdated = legal.updatedOn;

  return (
    <div className="page-shell py-10 md:py-14">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageIntro
          eyebrow={<Eyebrow>{legal.eyebrow}</Eyebrow>}
          title={sectionCopy.title}
          description={sectionCopy.description}
          aside={
            <>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{legal.lastUpdated}</p>
                  <p className="mt-3 text-base font-semibold tracking-tight text-foreground">{lastUpdated}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{legal.appliesTo}</p>
                  <p className="mt-3 text-base font-semibold tracking-tight text-foreground">{sectionCopy.appliesToValue}</p>
                </CardContent>
              </Card>
            </>
          }
        />

        {sectionCopy.sections.map((section) => (
          <section key={section.title} className="space-y-4 border-t border-border pt-8">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-7 text-muted-foreground">
                {paragraph}
              </p>
            ))}
            {'bullets' in section && section.bullets ? (
              <ul className="grid gap-3 text-sm leading-7 text-muted-foreground md:grid-cols-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Card>
                      <CardContent className="px-4 py-3">{bullet}</CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
