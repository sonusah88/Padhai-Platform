import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from "@/components/providers/theme-provider";
import { BandwidthProvider } from "@/components/providers/bandwidth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Padhai — Learn what school teaches. Discover what school doesn't.",
    template: "%s | Padhai",
  },
  description:
    "Live classes, curriculum-based learning, competitions, and future-ready skills for students across Nepal. Quality education should not depend on where you were born.",
  keywords: [
    "Nepal education",
    "online learning Nepal",
    "SEE preparation",
    "NEB curriculum",
    "live classes Nepal",
    "Padhai",
    "पढाइ",
    "नेपाल शिक्षा",
  ],
  authors: [{ name: "Padhai" }],
  creator: "Padhai",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ne_NP",
    siteName: "Padhai",
    title: "Padhai — Quality education for every student in Nepal",
    description:
      "Live classes, curriculum-based learning, competitions, and future-ready skills for students across Nepal.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Padhai — Quality education for every student in Nepal",
    description:
      "Live classes, curriculum-based learning, competitions, and future-ready skills for students across Nepal.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1419" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Padhai" />
      </head>
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <BandwidthProvider>
              {children}
            </BandwidthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
