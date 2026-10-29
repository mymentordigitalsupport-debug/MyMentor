import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { PwaProvider } from "@/components/pwa-provider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { MentorChatPreview } from "@/components/chat/MentorChatPreview";
import { NavigationLoader } from "@/components/ui/NavigationLoader";
import { Analytics } from "@vercel/analytics/next";
import PushpinTearFooter from "@/components/layout/PushpinFooter";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://mymentor.digital"
  ),
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
    apple: "/assets/icons/apple-icon.svg",
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
      <body suppressHydrationWarning>
        <ToastProvider>
          <SmoothScroll />
          <PwaProvider />
          <Suspense fallback={null}>
            <NavigationLoader />
          </Suspense>
          {children}
          <PushpinTearFooter
            brand="MyMentor"
            name="MyMentor community"
            email="hello@mymentor.digital"
            sheet="#1F3527"
            paper="#f6f3ed"
            sheetInk="#ffffff"
            paperInk="#1F3527"
            timeZone="Asia/Singapore"
            timeLabel="SGT"
            copyright={`© ${new Date().getFullYear()} MyMentor`}
            credit="Walk with purpose. Build with clarity."
            chat={{ label: "say hi", href: "mailto:hello@mymentor.digital" }}
          />
          <MentorChatPreview />
          <Analytics />
        </ToastProvider>
      </body>
    </html>
  );
}

