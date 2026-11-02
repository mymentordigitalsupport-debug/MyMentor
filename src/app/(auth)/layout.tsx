// Auth pages use the root layout directly — no extra shell needed.
// This file exists to define the (auth) route group.
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
