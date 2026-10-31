import type { Metadata } from "next";
import { AboutPage } from "@/components/about/AboutPage";
import "./about.css";

export const metadata: Metadata = { title: "About Us", description: "Discover the mission and people behind My Mentor." };

export default function Page() { return <AboutPage />; }
