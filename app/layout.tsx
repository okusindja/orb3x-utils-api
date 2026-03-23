import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "@/components/client-providers";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { enSiteCopy } from "@/locales/site/en";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: enSiteCopy.metadata.title,
  description: enSiteCopy.metadata.description,
  metadataBase: new URL("https://orb3x-utils-api.vercel.app"),
  keywords: enSiteCopy.metadata.keywords,
  authors: [{ name: "ORB3X" }],
  openGraph: {
    title: enSiteCopy.metadata.openGraphTitle,
    description: enSiteCopy.metadata.openGraphDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: enSiteCopy.metadata.openGraphTitle,
    description: enSiteCopy.metadata.openGraphDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ClientProviders>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
