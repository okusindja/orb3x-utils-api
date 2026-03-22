import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORB3X Utils API",
  description: "API utilities for taxpayer lookup, translation, and currency conversion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
