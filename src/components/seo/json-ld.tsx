import { serializeJsonLd } from '@/lib/seo';

export function JsonLd({ data }: { data: unknown }) {
  if (Array.isArray(data)) {
    return (
      <>
        {data.map((entry, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(entry) }}
          />
        ))}
      </>
    );
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
