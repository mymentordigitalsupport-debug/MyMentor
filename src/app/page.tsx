import { HeroSection } from "@/components/landing/HeroSection";
import { LandingSections } from "@/components/landing/LandingSections";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-cream">
      <PublicNavigation />
      <HeroSection />
      <LandingSections />
    </main>
  );
}
import { PublicNavigation } from "@/components/landing/PublicNavigation";
