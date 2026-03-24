import type { Metadata } from 'next';

import { HomePage } from '@/components/pages/home-page';
import { staticPageMetadata } from '@/lib/seo';

export const metadata: Metadata = staticPageMetadata.home;

export default function Home() {
  return <HomePage />;
}
