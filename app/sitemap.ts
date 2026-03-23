import { MetadataRoute } from 'next'

import { docsPageSlugs } from '@/lib/site-content'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://orb3x-utils-api.vercel.app'
  const lastModified = new Date('2026-03-22T00:00:00.000Z')

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const docsEntries: MetadataRoute.Sitemap = docsPageSlugs.map((slug) => ({
    url: `${baseUrl}/docs/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: slug === 'api-reference' ? 0.8 : 0.7,
  }))

  return [...staticPages, ...docsEntries]
}
