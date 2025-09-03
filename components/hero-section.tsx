import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HeroSection() {
  return (
    <main className="overflow-x-hidden">
      <section className="relative w-full min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <Image
          src="/fullhero.jpg"
          alt="Hero background"
          fill
          priority
          className="absolute inset-0 object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/25 z-10"></div>

        {/* Oversized background wordmark */}
        <h1
          aria-hidden="true"
          className="pointer-events-none select-none absolute 
             left-1/2 -translate-x-1/2 text-center
             lg:left-0 lg:-translate-x-0 lg:text-left
             top-1/2 -translate-y-1/2
             text-[16vw] lg:text-[12vw] xl:text-[10vw]
             leading-none tracking-tight font-black z-30 drop-shadow-lg whitespace-nowrap"
          style={{ color: "#fc9dca" }}
        >
          RecoupYou
        </h1>

        {/* CTA */}
        <div className="relative z-20 mt-120 flex justify-center">
          <a href="/#programs">
            <Button className="bg-[#fc9dca] text-white font-semibold text-base px-12 py-6 rounded-full shadow-[0_0_30px_rgba(252,157,202,0.75)] hover:shadow-[0_0_50px_rgba(252,157,202,0.95)] hover:bg-gray-900 transition min-w-[280px] min-h-[70px]">
              JOIN MEMBERSHIP <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </a>
        </div>
      </section>
    </main>
  );
}
