import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaProvider } from "@/components/pwa-provider";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
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
          <PwaProvider />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

