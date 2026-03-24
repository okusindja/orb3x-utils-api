import type { Metadata } from 'next';

import { TermsOfUsePage } from '@/components/pages/terms-of-use-page';
import { staticPageMetadata } from '@/lib/seo';

export const metadata: Metadata = staticPageMetadata.terms;

export default function TermsOfUse() {
  return <TermsOfUsePage />;
}
