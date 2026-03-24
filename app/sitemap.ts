import { MetadataRoute } from 'next';

import { docsPageSlugs } from '@/lib/site-content';
import { absoluteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-03-24T00:00:00.000Z');
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: absoluteUrl('/docs'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/legal/terms'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/legal/privacy'),
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/faq'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const docsEntries: MetadataRoute.Sitemap = docsPageSlugs.map((slug) => ({
    url: absoluteUrl(`/docs/${slug}`),
    lastModified,
    changeFrequency: 'weekly',
    priority: slug === 'api-reference' ? 0.8 : 0.7,
  }));

  return [...staticPages, ...docsEntries];
}
