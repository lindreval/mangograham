import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import { maragsaDisplay } from "@/lib/fonts";
import "./globals.css";
import Providers from "./providers";
import { ConditionalNavBar } from "@/components/ConditionalNavBar";
import { ConditionalFooter } from "@/components/ConditionalFooter";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { DeferredAchievementLoader } from "@/components/achievements/DeferredAchievementLoader";
import { auth } from "@/lib/auth";
import { SkipLink } from "@/components/SkipLink";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    template: "%s | Yung Salita",
    default: "Yung Salita - The Global Urban Dictionary",
  },
  description: "Discover and contribute to the world's largest multilingual urban dictionary. Learn slang, phrases, and expressions from languages around the globe with definitions, examples, and cultural context.",
  keywords: ["slang", "urban dictionary", "multilingual", "phrases", "definitions", "language learning", "cultural expressions"],
  authors: [{ name: "Yung Salita Community" }],
  creator: "Yung Salita",
  publisher: "Yung Salita",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://yungsalita.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Yung Salita - The Global Urban Dictionary",
    description: "Discover and contribute to the world's largest multilingual urban dictionary. Learn slang, phrases, and expressions from languages around the globe.",
    url: "/",
    siteName: "Yung Salita",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/yungsalita.png",
        width: 1200,
        height: 630,
        alt: "Yung Salita - The Global Urban Dictionary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yung Salita - The Global Urban Dictionary",
    description: "Discover and contribute to the world's largest multilingual urban dictionary.",
    images: ["/yungsalita.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    // ① Attach the CSS variables for Geist fonts to <html>
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${maragsaDisplay.variable}`}
    >
      <head>
        {/* Preconnect to Google's image CDN for faster avatar loading */}
        <link rel="preconnect" href="https://lh3.googleusercontent.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />

        {/* Google AdSense */}
        <Script
          id="adsense"
          strategy="lazyOnload"
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8663102741287690"
        />
      </head>
      {/* ② Apply the GeistSans variable via Tailwind's font-sans utility */}
      <body className="min-h-screen font-sans antialiased flex flex-col">
        <SkipLink />
        <Analytics />
        <Providers session={session}>
          {/* ③ Wrap your client-only NavBar in Suspense */}
          <Suspense fallback={null}>
            <ConditionalNavBar />
          </Suspense>
          {/* Header Ad - Replace with your actual ad slot ID */}
          {/* <AdsBanner 
            data-ad-slot="YOUR_HEADER_AD_SLOT_ID"
            data-ad-format="auto"
            data-full-width-responsive="true"
          /> */}
          <main id="main-content" className="flex-1">{children}</main>
          {/* Footer Ad - Replace with your actual ad slot ID */}
          {/* <AdsBanner 
            data-ad-slot="YOUR_FOOTER_AD_SLOT_ID"
            data-ad-format="auto"
            data-full-width-responsive="true"
          /> */}
          <ConditionalFooter />
          <DeferredAchievementLoader />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
