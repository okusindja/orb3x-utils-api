import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

import { ClientProviders } from "@/components/client-providers";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from '@/components/seo/json-ld';
import {
  ORGANIZATION_SITE_URL,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  getOrganizationJsonLd,
  getWebApiJsonLd,
  getWebSiteJsonLd,
} from '@/lib/seo';
import { enSiteCopy } from '@/locales/site/en';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: enSiteCopy.metadata.description,
  applicationName: SITE_NAME,
  keywords: enSiteCopy.metadata.keywords,
  authors: [{ name: 'ORB3X', url: ORGANIZATION_SITE_URL }],
  creator: 'ORB3X',
  publisher: 'ORB3X',
  category: 'developer tools',
  manifest: '/manifest.webmanifest',
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  referrer: 'origin-when-cross-origin',
  icons: {
    icon: [
      { url: '/icons/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: ['/icons/favicon.ico'],
    apple: [{ url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
  },
  openGraph: {
    title: SITE_NAME,
    description: enSiteCopy.metadata.description,
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [
      {
        url: absoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: 'ORB3X Utils API preview card',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: enSiteCopy.metadata.description,
    images: [absoluteUrl('/opengraph-image')],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#040b21' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[70] -translate-y-24 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Skip to content
        </a>
        <JsonLd data={[getOrganizationJsonLd(), getWebSiteJsonLd(), getWebApiJsonLd()]} />
        <ClientProviders>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1 outline-none">
              {children}
            </main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
