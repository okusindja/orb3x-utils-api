import type { Metadata } from 'next';

import { PrivacyPolicyPage } from '@/components/pages/privacy-policy-page';
import { staticPageMetadata } from '@/lib/seo';

export const metadata: Metadata = staticPageMetadata.privacy;

export default function PrivacyPolicy() {
  return <PrivacyPolicyPage />;
}
