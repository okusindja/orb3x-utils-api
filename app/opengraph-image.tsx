import { createOgImageResponse, ogImageContentType, ogImageSize } from '@/lib/og-image';

export const alt = 'ORB3X Utils API preview card';
export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function OpenGraphImage() {
  return createOgImageResponse({
    eyebrow: 'Angola-first API',
    title: 'Validation, geo, finance, salary, and document APIs for Angola.',
    description: 'Developer documentation and reference pages for /api/v1 validation, phone, geo, calendar, finance, salary, time, and document routes.',
  });
}
