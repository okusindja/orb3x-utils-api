import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocsDetailContent } from '@/components/docs-detail-content';
import { getLocalizedDocsPage } from '@/lib/site-copy';
import { docsPageSlugs, isDocsPageSlug } from '@/lib/site-content';

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
  const page = isDocsPageSlug(slug) ? getLocalizedDocsPage('en', slug) : null;

  if (!page) {
    return {};
  }

  return {
    title: `${page.label} | ORB3X Utils API`,
    description: page.description,
  };
}

export default async function DocsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = isDocsPageSlug(slug) ? getLocalizedDocsPage('en', slug) : null;

  if (!page) {
    notFound();
  }

  return <DocsDetailContent slug={slug} />;
}
