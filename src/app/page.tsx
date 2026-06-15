import { HeroSection } from "@/components/landing/HeroSection";
import { LandingSections } from "@/components/landing/LandingSections";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-cream">
      <HeroSection />
      <LandingSections />
    </main>
  );
}
