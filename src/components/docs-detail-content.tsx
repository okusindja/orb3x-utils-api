'use client';

import Link from 'next/link';

import { useSiteCopy } from '@/components/locale-provider';
import { CodeBlock, CodeSampleSwitcher, DataTable, Eyebrow } from '@/components/site-primitives';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { isDocsPageSlug } from '@/lib/site-content';

function splitUsageSamples(
  snippets: {
    label: string;
    language: string;
    content: string;
  }[],
) {
  if (snippets.length >= 2 && snippets[0]?.language === 'bash' && snippets[1]?.language === 'js') {
    return {
      usageSamples: snippets.slice(0, 2).map((snippet) => ({
        label: snippet.label,
        language: snippet.language,
        code: snippet.content,
      })),
      remainingSamples: snippets.slice(2),
    };
  }

  return {
    usageSamples: null,
    remainingSamples: snippets,
  };
}

export function DocsDetailContent({ slug }: { slug: string }) {
  const copy = useSiteCopy();
  const page = isDocsPageSlug(slug) ? copy.docsPages[slug] : null;

  if (!page) {
    return null;
  }

  return (
    <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_14rem]">
      <article className="min-w-0">
        <header className="border-b border-border pb-8 md:pb-10">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>{page.eyebrow}</Eyebrow>
            {page.endpoint ? (
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <span>{page.endpoint.method}</span>
                <span>{page.endpoint.path}</span>
              </div>
            ) : null}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">{page.intro}</p>
          {page.endpoint ? (
            <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">{page.endpoint.detail}</p>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {page.summaryCards.map((card) => (
              <div key={card.label} className="border-t border-border pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{card.label}</p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{card.value}</p>
              </div>
            ))}
          </div>
        </header>

        {page.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28 border-b border-border py-10">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{section.title}</h2>
                <a
                  href={`#${section.id}`}
                  aria-label={`Jump to ${section.title}`}
                  className="hidden text-sm font-semibold text-primary sm:inline"
                >
                  #
                </a>
              </div>
              {section.description ? (
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{section.description}</p>
              ) : null}
            </div>

            {section.paragraphs ? (
              <div className="mt-5 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-8 text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}

            {section.bullets ? (
              <ul className="mt-6 space-y-3">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="border-l-2 border-border pl-4 text-sm leading-7 text-muted-foreground">
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}

            {section.table ? (
              <div className="mt-6">
                <DataTable columns={section.table.columns} rows={section.table.rows} />
              </div>
            ) : null}

            {section.code ? (
              <div className="mt-6">
                <CodeBlock
                  label={section.code.label}
                  language={section.code.language}
                  code={section.code.content}
                />
              </div>
            ) : null}

            {section.codes ? (
              <div className="mt-6 grid gap-4">
                {(() => {
                  const { usageSamples, remainingSamples } = splitUsageSamples(section.codes);

                  return (
                    <>
                      {usageSamples ? <CodeSampleSwitcher samples={usageSamples} /> : null}
                      {remainingSamples.map((snippet) => (
                        <CodeBlock
                          key={`${section.id}-${snippet.label}`}
                          label={snippet.label}
                          language={snippet.language}
                          code={snippet.content}
                        />
                      ))}
                    </>
                  );
                })()}
              </div>
            ) : null}

            {section.note ? (
              <Card className="mt-6 bg-secondary text-secondary-foreground">
                <CardContent className="px-4 py-4 text-sm leading-7">{section.note}</CardContent>
              </Card>
            ) : null}
          </section>
        ))}

        <section id="related" className="scroll-mt-28 py-10">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{copy.docsDetail.relatedPages}</h2>
          <Card className="mt-6 overflow-hidden">
            {page.relatedSlugs.map((relatedSlug, index) => {
              const relatedPage = copy.docsPages[relatedSlug];

              return (
                <Link
                  key={relatedSlug}
                  href={`/docs/${relatedSlug}`}
                  className={`block px-4 py-4 hover:bg-accent ${index !== page.relatedSlugs.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-foreground">{relatedPage.label}</p>
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">{relatedPage.description}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-primary">{copy.docsDetail.open}</span>
                  </div>
                </Link>
              );
            })}
          </Card>
        </section>
      </article>

      <aside className="sticky top-24 hidden self-start xl:block">
        <div className="h-[calc(100svh-7rem)] border-l border-border pl-4">
          <ScrollArea className="h-full">
            <div className="space-y-6 pl-2 pr-3">
              {page.endpoint ? (
                <Card className="bg-secondary text-secondary-foreground">
                  <CardContent className="px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      {copy.docsDetail.endpoint}
                    </p>
                    <p className="mt-2 text-sm font-semibold">
                      {page.endpoint.method} {page.endpoint.path}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              <div className="pb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {copy.docsDetail.onPage}
                </p>
                <nav aria-label={copy.docsDetail.onPage} className="mt-4 space-y-1.5">
                  {page.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm text-muted-foreground hover:text-foreground"
                    >
                      {section.title}
                    </a>
                  ))}
                  <a href="#related" className="block text-sm text-muted-foreground hover:text-foreground">
                    {copy.docsDetail.relatedPages}
                  </a>
                </nav>
              </div>
            </div>
          </ScrollArea>
        </div>
      </aside>
    </div>
  );
}
