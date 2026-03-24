import type { Metadata } from 'next';

import { DocsOverviewPage } from '@/components/pages/docs-overview-page';
import { JsonLd } from '@/components/seo/json-ld';
import { createBreadcrumbJsonLd, staticPageMetadata } from '@/lib/seo';

export const metadata: Metadata = staticPageMetadata.docs;

export default function DocsPage() {
  return (
    <>
      <JsonLd
        data={createBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Documentation', path: '/docs' },
        ])}
      />
      <DocsOverviewPage />
    </>
  );
}
