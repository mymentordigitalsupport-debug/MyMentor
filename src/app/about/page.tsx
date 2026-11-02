import type { Metadata } from "next";
import { AboutPage } from "@/components/about/AboutPage";
import "./about.css";

export const metadata: Metadata = {
  title: "About My Mentor",
  description: "Discover the mission and people behind My Mentor.",
  alternates: { canonical: "/about" },
};

export default function Page() { return <AboutPage />; }
