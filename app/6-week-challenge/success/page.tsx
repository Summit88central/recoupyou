"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Loader2, MapPin, CalendarDays, Clock3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CHALLENGE_CONFIG } from "@/lib/challenge";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConfirmResult =
  | { found: true; name: string; email: string; paymentOption: string; amountPaid: number; promoCodeUsed: string | null; status: string }
  | { found: false };

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_POLLS = 15;       // 15 × 2 s = 30 s maximum wait
const POLL_INTERVAL_MS = 2000;

const formatPrice = (v: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(v);

// ─── Component ────────────────────────────────────────────────────────────────

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? "";

  const [state, setState] = useState<"polling" | "confirmed" | "timeout" | "error">("polling");
  const [registration, setRegistration] = useState<Extract<ConfirmResult, { found: true }> | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!reference) {
      setState("error");
      return;
    }

    let cancelled = false;
    let count = 0;

    async function poll() {
      if (cancelled) return;

      try {
        const res = await fetch(
          `/api/challenge/confirm?reference=${encodeURIComponent(reference)}`
        );
        const data: ConfirmResult = await res.json();

        if (cancelled) return;

        if (data.found) {
          setRegistration(data);
          setState("confirmed");
          return;
        }

        count++;
        setPollCount(count);

        if (count >= MAX_POLLS) {
          setState("timeout");
          return;
        }

        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) {
          count++;
          setPollCount(count);
          if (count >= MAX_POLLS) {
            setState("timeout");
          } else {
            timerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          }
        }
      }
    }

    void poll();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reference]);

  // ── Polling state ────────────────────────────────────────────────────────────
  if (state === "polling") {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-[#fc9dca]/30 shadow-lg">
          <CardContent className="p-8 text-center space-y-5">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-[#fc9dca]/10 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-[#fc9dca] animate-pulse" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Received</h1>
              <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                Confirming your registration&hellip; This usually takes a few seconds.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Check {pollCount + 1} of {MAX_POLLS}</span>
            </div>
            {reference && (
              <p className="text-xs text-gray-400">
                Reference:{" "}
                <span className="font-mono text-gray-600">{reference}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    );
  }

  // ── Confirmed state ──────────────────────────────────────────────────────────
  if (state === "confirmed" && registration) {
    return (
      <main className="min-h-screen bg-white pt-20 pb-12">
        <div className="mx-auto max-w-2xl px-4">
          <Card className="border-green-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#fc9dca] to-rose-400 px-8 py-10 text-center text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <CheckCircle2 className="h-9 w-9 text-white" />
              </div>
              <h1 className="text-3xl font-bold">You&apos;re In!</h1>
              <p className="mt-2 text-white/80 text-sm">
                Your challenge spot is confirmed. We can&apos;t wait to see you crush it.
              </p>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Registration summary */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Registration Summary
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-900">{registration.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{registration.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Membership type</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {registration.paymentOption === "member" ? "Current Member" : "Non-Member"}
                    </span>
                  </div>
                  {registration.promoCodeUsed && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Promo code</span>
                      <span className="font-mono font-medium text-green-700">
                        {registration.promoCodeUsed}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="font-semibold text-gray-700">Amount paid</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(registration.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payment reference</span>
                    <span className="font-mono text-xs text-gray-600 break-all text-right max-w-[50%]">
                      {reference}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kickoff details */}
              <div className="rounded-xl border border-[#fc9dca]/20 bg-[#fc9dca]/5 p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#fc9dca]">
                  Kickoff Details
                </p>
                <div className="space-y-3">
                  {[
                    { icon: CalendarDays, label: "Starting date", value: CHALLENGE_CONFIG.kickoff.startDate },
                    { icon: Clock3, label: "Time", value: CHALLENGE_CONFIG.kickoff.time },
                    { icon: MapPin, label: "Location", value: CHALLENGE_CONFIG.kickoff.location },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 text-sm">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#fc9dca]" />
                      <div>
                        <p className="font-medium text-gray-900">{label}</p>
                        <p className="text-gray-600">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Link href="/" className="block">
                <Button className="w-full bg-[#fc9dca] hover:bg-rose-400 text-white">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // ── Timeout state — payment went through but webhook hasn't fired yet ─────────
  if (state === "timeout") {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-amber-200 shadow-lg">
          <CardContent className="p-8 text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Received</h1>
              <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                Your payment went through successfully. Your registration is being
                finalised.
              </p>
            </div>
            {reference && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-left space-y-1">
                <p className="text-xs text-gray-500 font-medium">Your reference number</p>
                <p className="font-mono text-sm text-gray-800 break-all">{reference}</p>
                <p className="text-xs text-gray-400">
                  Keep this for your records.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="border-[#fc9dca] text-[#fc9dca] hover:bg-[#fc9dca] hover:text-white"
                onClick={() => {
                  setState("polling");
                  setPollCount(0);
                  // Re-trigger the useEffect by resetting state
                  window.location.reload();
                }}
              >
                Check Again
              </Button>
              <Link href="/">
                <Button variant="ghost" className="w-full text-gray-500">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ── Error state — no reference in URL ────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-red-200 shadow-lg">
        <CardContent className="p-8 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="mt-2 text-gray-500 text-sm">
              No payment reference was found in this URL. If you completed a
              payment, please contact us.
            </p>
          </div>
          <Link href="/6-week-challenge">
            <Button className="w-full bg-[#fc9dca] hover:bg-rose-400 text-white">
              Back to Registration
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

// Wrap in Suspense — required by Next.js 14 when using useSearchParams() in a
// page component, otherwise the build fails with a prerender error.
export default function ChallengeSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading&hellip;</span>
          </div>
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
