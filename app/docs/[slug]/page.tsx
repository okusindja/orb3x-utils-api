import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocsDetailContent } from '@/components/docs-detail-content';
import { JsonLd } from '@/components/seo/json-ld';
import { getLocalizedDocsPage } from '@/lib/site-copy';
import { docsPageSlugs, isDocsPageSlug } from '@/lib/site-content';
import { createBreadcrumbJsonLd, createDocsArticleJsonLd, getDocsPageMetadata } from '@/lib/seo';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return docsPageSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isDocsPageSlug(slug)) {
    return {};
  }

  return getDocsPageMetadata(slug);
}

export default async function DocsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const docsSlug = isDocsPageSlug(slug) ? slug : null;
  const page = docsSlug ? getLocalizedDocsPage('en', docsSlug) : null;

  if (!page || !docsSlug) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          createBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Documentation', path: '/docs' },
            { name: page.label, path: `/docs/${slug}` },
          ]),
          createDocsArticleJsonLd(docsSlug),
        ]}
      />
      <DocsDetailContent slug={slug} />
    </>
  );
}
