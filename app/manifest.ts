import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ORB3X Utils API',
    short_name: 'ORB3X API',
    description: 'API documentation and utilities for Angola validation, geo, finance, salary, time, and document generation.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1745b1',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

