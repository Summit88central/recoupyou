import { ServicesGrid } from "@/components/services-grid";
import { HeroSection } from "@/components/hero-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <main className="min-h-screen bg-white pt-16">
        <div className="container mx-auto px-4 py-16">
          <ServicesGrid />
        </div>
      </main>
    </>
  );
}
