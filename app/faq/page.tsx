import type { Metadata } from 'next';

import { FAQPage } from '@/components/pages/faq-page';
import { JsonLd } from '@/components/seo/json-ld';
import { createFaqJsonLd, staticPageMetadata } from '@/lib/seo';
import { enSiteCopy } from '@/locales/site/en';

export const metadata: Metadata = staticPageMetadata.faq;

export default function FAQ() {
  return (
    <>
      <JsonLd
        data={createFaqJsonLd(
          enSiteCopy.faq.groups.flatMap((group) => group.items.map((item) => ({
            question: item.question,
            answer: item.answer,
          }))),
        )}
      />
      <FAQPage />
    </>
  );
}
