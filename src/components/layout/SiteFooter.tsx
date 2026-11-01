"use client";

import { usePathname } from "next/navigation";
import PushpinTearFooter from "@/components/layout/PushpinFooter";

const MEMBER_AREAS = ["/today", "/course", "/journal", "/journey", "/progress", "/resources", "/settings"];

export function SiteFooter() {
  const pathname = usePathname();
  const isMemberArea = MEMBER_AREAS.some((area) => pathname === area || pathname.startsWith(`${area}/`));

  if (isMemberArea) return null;

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
      copyright={`© ${new Date().getFullYear()} MyMentor`}
      credit="Walk with purpose. Build with clarity."
      chat={{ label: "say hi", href: "mailto:hello@mymentor.digital" }}
    />
  );
}
