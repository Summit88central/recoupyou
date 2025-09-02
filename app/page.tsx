import { ServicesGrid } from "@/components/services-grid";
import { HeroSection } from "@/components/hero-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <main className="min-h-screen bg-white">
        <div className="container mx-auto py-16">
          <ServicesGrid />
        </div>
      </main>
    </>
  );
}
