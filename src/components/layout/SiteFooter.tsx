"use client";

import { usePathname } from "next/navigation";
import PushpinTearFooter from "@/components/layout/PushpinFooter";

const MEMBER_AREAS = ["/today", "/course", "/journal", "/journey", "/progress", "/resources", "/settings", "/admin", "/author"];
const AUTH_AREAS = ["/login", "/register", "/admin-login", "/authors-login", "/authors-register"];

export function SiteFooter() {
  const pathname = usePathname();
  const isMemberArea = MEMBER_AREAS.some((area) => pathname === area || pathname.startsWith(`${area}/`));
  const isAuthArea = AUTH_AREAS.some((area) => pathname === area || pathname.startsWith(`${area}/`));

  if (isMemberArea || isAuthArea) return null;

  return (
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
      socials={[
        { icon: "facebook", label: "Facebook", href: "https://www.facebook.com/mymentordigitalsupportsystem" },
        { icon: "ig", label: "Instagram", href: "https://www.instagram.com/mymentordigitalsupportsystem/" },
        { icon: "x", label: "X", href: "https://x.com/mymentordigital" },
      ]}
      copyright={`© ${new Date().getFullYear()} MyMentor`}
      credit="Walk with purpose. Build with clarity."
      chat={{ label: "say hi", href: "/threads" }}
    />
  );
}
