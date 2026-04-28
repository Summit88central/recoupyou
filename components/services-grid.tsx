import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { CHALLENGE_CONFIG, CHALLENGE_REGISTRATION } from "@/lib/challenge";

export function ServicesGrid() {
  return (
    <section id="programs" className="min-h-full mt-8">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pb-10 md:pb-14">
        {/* Free Class - Top Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 px-6 py-4 rounded-2xl bg-[#fc9dca]/10">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
              Free Class
            </h3>
            <p className="text-sm text-gray-600">
              Join us every Wednesday for a free session !
            </p>
          </div>
          <a
            href="/wednesday-class"
            className="mt-3 sm:mt-0 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#fc9dca] font-medium text-sm text-white shadow-sm hover:bg-rose-400 transition"
          >
            RSVP Now
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 px-6 py-4 rounded-2xl bg-[#2a2a2a] text-white">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
              SCULPT SERIES: Glutes &amp; Core Reloaded
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {CHALLENGE_REGISTRATION.isOpen
                  ? "Enrolling Now"
                  : "Registration Closed"}
              </p>
              <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                🔥 Previous round sold out in 4 days
              </p>
            </div>
            <p className="mt-2 text-sm text-gray-200">
              Limited to {CHALLENGE_CONFIG.maxParticipants} people. Starts{" "}
              {CHALLENGE_CONFIG.kickoff.startDate} at {CHALLENGE_CONFIG.kickoff.time}.
            </p>
            <p className="text-sm text-gray-300">
              {CHALLENGE_CONFIG.kickoff.location}
            </p>
          </div>
          <a
            href="/6-week-challenge"
            className="mt-3 sm:mt-0 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#fc9dca] font-medium text-sm text-white shadow-sm hover:bg-rose-400 transition"
          >
            {CHALLENGE_REGISTRATION.isOpen ? "Apply Now" : "View Details"}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Glass Container */}
        <div className="bg-white backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-12 gap-3 sm:gap-4 auto-rows-[200px] md:auto-rows-[260px] xl:auto-rows-[300px]">
              {/* RY Gym Membership */}
              <article className="col-span-12 md:col-span-6 xl:col-span-5 row-span-1">
                <div className="relative h-full w-full rounded-2xl overflow-hidden text-white shadow-lg ring-1 ring-black/10 p-6 sm:p-8 flex flex-col justify-between">
                  <Image
                    src="/services.jpg"
                    alt="RY Gym Membership Application"
                    fill
                    quality={85}
                    className="absolute inset-0 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="relative">
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                      RY Gym Membership
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-white/90">
                      Apply now and start training yourself at our gym.
                    </p>
                  </div>
                  <a
                    href="/membership-application"
                    className="relative mt-6 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-white hover:text-pink-200"
                  >
                    <span className="underline underline-offset-4 decoration-white/50 hover:decoration-white">
                      Apply Now
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>

              {/* Downloadable Guides */}
              <article className="col-span-12 md:col-span-3 xl:col-span-4 row-span-1">
                <div className="relative h-full w-full rounded-2xl overflow-hidden ring-1 ring-white/20 group bg-black/20 backdrop-blur-md">
                  <Image
                    src="/guides.jpg"
                    alt="Downloadable fitness guides"
                    fill
                    quality={85}
                    className="absolute inset-0 object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="relative h-full w-full p-5 sm:p-6 flex flex-col justify-end text-white">
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight drop-shadow">
                      Downloadable Guides
                    </h3>
                    <div className="mt-3">
                      <a
                        href="/guides"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fc9dca] font-medium text-sm shadow-sm hover:bg-rose-400 transition"
                      >
                        Explore
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>

              {/* In-Person Training */}
              <article className="col-span-12 md:col-span-3 xl:col-span-3 row-span-2">
                <div className="relative h-full w-full rounded-2xl overflow-hidden ring-1 ring-white/20 group bg-black/20 backdrop-blur-md">
                  <Image
                    src="/1on1.jpg"
                    alt="Personal training session"
                    fill
                    quality={85}
                    className="absolute inset-0 object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="relative h-full w-full p-5 sm:p-6 flex flex-col justify-end text-white">
                    <h3 className="text-2xl font-semibold tracking-tight drop-shadow">
                      In-Person Personal Training
                    </h3>
                    <div className="mt-3">
                      <a
                        href="/personal-training"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fc9dca] font-medium text-sm shadow-sm hover:bg-rose-400 transition"
                      >
                        Explore
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>

              {/* Online Coaching (same row height as others) */}
              <article className="col-span-12 md:col-span-9 xl:col-span-9 row-span-1">
                <div className="relative h-full w-full rounded-2xl overflow-hidden ring-1 ring-white/20 group bg-black/20 backdrop-blur-md">
                  <Image
                    src="/online.jpg"
                    alt="Online coaching session"
                    fill
                    quality={85}
                    className="absolute inset-0 object-cover transition duration-500 group-hover:scale-[1.03] group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="relative h-full w-full p-5 sm:p-6 flex flex-col justify-end text-white">
                    <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight drop-shadow">
                      Online 1:1 Coaching
                    </h3>
                    <div className="mt-3">
                      <a
                        href="/online-coaching"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fc9dca] font-medium text-sm shadow-sm hover:bg-rose-400 transition"
                      >
                        Explore
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
