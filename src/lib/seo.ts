import type { Metadata } from 'next';

import { type DocsPageSlug } from '@/lib/site-content';
import { enSiteCopy } from '@/locales/site/en';

const DEFAULT_SITE_URL = 'https://orb3x-utils-api.vercel.app';
export const ORGANIZATION_SITE_URL = 'https://www.orb3x.com/';
const DEFAULT_OG_IMAGE_PATH = '/opengraph-image';
const DEFAULT_OG_IMAGE_ALT = 'ORB3X Utils API preview card';

export const SITE_NAME = 'ORB3X Utils API';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, '');
export const SITE_DESCRIPTION = enSiteCopy.metadata.description;
export const SITE_KEYWORDS = enSiteCopy.metadata.keywords;

type PageMetadataInput = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  noIndex?: boolean;
  imagePath?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
};

type BreadcrumbInput = {
  name: string;
  path: string;
};

export function absoluteUrl(path = '/') {
  return new URL(path, `${SITE_URL}/`).toString();
}

function mergeKeywords(keywords: string[] = []) {
  return Array.from(new Set([...SITE_KEYWORDS, ...keywords]));
}

export function createPageMetadata({
  path,
  title,
  description,
  keywords,
  noIndex = false,
  imagePath = DEFAULT_OG_IMAGE_PATH,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
  type = 'website',
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const image = absoluteUrl(imagePath);
  const mergedKeywords = mergeKeywords(keywords);

  return {
    title,
    description,
    keywords: mergedKeywords,
    authors: [{ name: 'ORB3X', url: ORGANIZATION_SITE_URL }],
    creator: 'ORB3X',
    publisher: 'ORB3X',
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_US',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          nocache: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  };
}

export const staticPageMetadata = {
  home: createPageMetadata({
    path: '/',
    title: enSiteCopy.metadata.title,
    description: enSiteCopy.metadata.description,
    keywords: ['Angola API', 'IBAN validation', 'salary calculator', 'developer documentation'],
  }),
  docs: createPageMetadata({
    path: '/docs',
    title: 'Documentation | ORB3X Utils API',
    description: enSiteCopy.docsOverview.description,
    keywords: ['API documentation', 'API reference', 'integration guide', 'developer docs'],
  }),
  faq: createPageMetadata({
    path: '/faq',
    title: 'FAQ | ORB3X Utils API',
    description: enSiteCopy.faq.description,
    keywords: ['API FAQ', 'integration questions', 'request format help'],
  }),
  privacy: createPageMetadata({
    path: '/legal/privacy',
    title: 'Privacy Policy | ORB3X Utils API',
    description: enSiteCopy.legal.privacy.description,
    keywords: ['privacy policy', 'data handling', 'API privacy'],
  }),
  terms: createPageMetadata({
    path: '/legal/terms',
    title: 'Terms of Use | ORB3X Utils API',
    description: enSiteCopy.legal.terms.description,
    keywords: ['terms of use', 'service terms', 'API terms'],
  }),
} as const;

export function getDocsPageMetadata(slug: DocsPageSlug) {
  const page = enSiteCopy.docsPages[slug];

  return createPageMetadata({
    path: `/docs/${slug}`,
    title: `${page.label} | ${SITE_NAME}`,
    description: page.description,
    keywords: [page.label, 'Angola API', 'endpoint reference'],
    type: 'article',
  });
}

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: 'ORB3X',
    url: ORGANIZATION_SITE_URL,
    logo: absoluteUrl('/icons/icon-512x512.png'),
    sameAs: [ORGANIZATION_SITE_URL, SITE_URL],
  };
}

export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'en',
    publisher: {
      '@id': absoluteUrl('/#organization'),
    },
  };
}

export function getWebApiJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebAPI',
    '@id': absoluteUrl('/#webapi'),
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    documentation: absoluteUrl('/docs'),
    provider: {
      '@id': absoluteUrl('/#organization'),
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Developers',
    },
  };
}

export function createBreadcrumbJsonLd(items: BreadcrumbInput[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function createDocsArticleJsonLd(slug: DocsPageSlug) {
  const page = enSiteCopy.docsPages[slug];

  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.title,
    description: page.description,
    url: absoluteUrl(`/docs/${slug}`),
    author: {
      '@id': absoluteUrl('/#organization'),
    },
    publisher: {
      '@id': absoluteUrl('/#organization'),
    },
    about: SITE_NAME,
    isPartOf: {
      '@id': absoluteUrl('/#website'),
    },
  };
}

export function createFaqJsonLd(
  items: {
    question: string;
    answer: string;
  }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
