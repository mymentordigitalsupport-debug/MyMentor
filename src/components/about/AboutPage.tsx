"use client";

import { PublicNavigation } from "@/components/landing/PublicNavigation";
import { useRouter } from "next/navigation";
import { HeroSection } from "./components/HeroSection";
import { TestimonialSection } from "./components/TestimonialSection";
import { AuthorSection } from "./components/AuthorSection";
import { GiftSection } from "./components/GiftSection";
import { CountdownSection } from "./components/CountdownSection";
import { ScrollExperience } from "./components/ScrollExperience";

export function AboutPage() {
  const router = useRouter();
  const signUp = () => router.push("/register");
  const explore = () => document.getElementById("books")?.scrollIntoView({ behavior: "smooth" });
  return (
    <main className="about-page relative min-h-screen bg-[#FAF0E3] text-[#1F1710] selection:bg-[#E5C175]/30 selection:text-[#181511] overflow-x-hidden font-sans">
      <PublicNavigation />
      <HeroSection onSignUp={signUp} onExploreBooks={explore} />
      <TestimonialSection onSignUp={signUp} onExploreBooks={explore} />
      <AuthorSection onSignUp={signUp} onExploreBooks={explore} />
      <GiftSection onSignUp={signUp} />
      <CountdownSection onSignUp={signUp} onExploreBooks={explore} onSignIn={(role) => router.push(role === "admin" ? "/admin-login" : "/login")} />
      <ScrollExperience onSignUp={signUp} onExploreBooks={explore} />
    </main>
  );
}
