export const docsPageSlugs = [
  'getting-started',
  'api-reference',
  'validation',
  'phone',
  'address-geo',
  'calendar',
  'finance',
  'salary',
  'time',
  'documents',
  'nif-verification',
  'translation',
  'currency-exchange',
  'examples',
] as const;

export type DocsPageSlug = (typeof docsPageSlugs)[number];

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type DocsTable = {
  columns: string[];
  rows: string[][];
};

export type DocsCodeSample = {
  label: string;
  language: 'bash' | 'json' | 'js' | 'ts';
  content: string;
};

export type DocsSection = {
  id: string;
  title: string;
  description?: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: DocsTable;
  code?: DocsCodeSample;
  codes?: DocsCodeSample[];
  note?: string;
};

export type DocsPage = {
  slug: DocsPageSlug;
  label: string;
  description: string;
  eyebrow: string;
  title: string;
  intro: string;
  endpoint?: {
    method: 'GET' | 'POST';
    path: string;
    detail: string;
  };
  summaryCards: Array<{
    label: string;
    value: string;
  }>;
  sections: DocsSection[];
  relatedSlugs: DocsPageSlug[];
};

export type DocsPageMap = Record<DocsPageSlug, DocsPage>;

export function isDocsPageSlug(value: string): value is DocsPageSlug {
  return docsPageSlugs.includes(value as DocsPageSlug);
}
