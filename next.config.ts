import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/validate/:path*',
        destination: '/api/v1/validate/:path*',
        permanent: false,
      },
      {
        source: '/phone/:path*',
        destination: '/api/v1/phone/:path*',
        permanent: false,
      },
      {
        source: '/address/:path*',
        destination: '/api/v1/address/:path*',
        permanent: false,
      },
      {
        source: '/geo/:path*',
        destination: '/api/v1/geo/:path*',
        permanent: false,
      },
      {
        source: '/calendar/:path*',
        destination: '/api/v1/calendar/:path*',
        permanent: false,
      },
      {
        source: '/finance/:path*',
        destination: '/api/v1/finance/:path*',
        permanent: false,
      },
      {
        source: '/salary/:path*',
        destination: '/api/v1/salary/:path*',
        permanent: false,
      },
      {
        source: '/time/:path*',
        destination: '/api/v1/time/:path*',
        permanent: false,
      },
      {
        source: '/documents/:path*',
        destination: '/api/v1/documents/:path*',
        permanent: false,
      },
      {
        source: '/api/nif/:nif',
        destination: '/api/v1/nif/:nif',
        permanent: false,
      },
      {
        source: '/api/exchange/:base',
        destination: '/api/v1/exchange/:base',
        permanent: false,
      },
      {
        source: '/api/translate',
        destination: '/api/v1/translate',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
