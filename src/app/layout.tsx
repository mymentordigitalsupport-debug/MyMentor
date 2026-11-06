import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { PwaProvider } from "@/components/pwa-provider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { MentorChatPreview } from "@/components/chat/MentorChatPreview";
import { NavigationLoader } from "@/components/ui/NavigationLoader";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PUBLIC_SITE_URL } from "@/lib/public-site";

const siteStructuredData = JSON.stringify([
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "My Mentor",
    url: PUBLIC_SITE_URL,
    description:
      "A guided course of healing, reflection, recovery, and personal growth.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "My Mentor",
    url: PUBLIC_SITE_URL,
  },
]).replace(/</g, "\\u003c");

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_SITE_URL),
  title: {
    default: "My Mentor",
    template: "%s — My Mentor",
  },
  description:
    "A guided course of healing, reflection, recovery, and personal growth. Walk through life's toughest seasons with mentor-led lessons and daily support.",
  applicationName: "My Mentor",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/assets/images/favicon.png",
    apple: "/assets/images/favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Mentor",
  },
  openGraph: {
    title: "My Mentor — We Transform Together",
    description:
      "A guided course of healing, reflection, recovery, and personal growth.",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

export const viewport: Viewport = {
  themeColor: "#F6F3ED",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: siteStructuredData }}
        />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          <SmoothScroll />
          <PwaProvider />
          <Suspense fallback={null}>
            <NavigationLoader />
          </Suspense>
          {children}
          <SiteFooter />
          <MentorChatPreview />
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}

