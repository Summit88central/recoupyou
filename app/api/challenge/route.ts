import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  ACTIVITY_OPTIONS,
  CHALLENGE_CONFIG,
  CHALLENGE_REGISTRATION,
  CHALLENGE_RECOVERY_LOCK,
  DIETARY_OPTIONS,
  GOAL_OPTIONS,
  getBaseChallengeAmount,
  type ChallengeActivityLevel,
  type ChallengeDietaryPreference,
  type ChallengeGoal,
  type ChallengePaymentOption,
} from "@/lib/challenge";

// ─── Supabase (service role — server-side only) ───────────────────────────────

let cachedSupabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (cachedSupabase) return cachedSupabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  cachedSupabase = createClient(url, key);
  return cachedSupabase;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ChallengeStatus = {
  maxParticipants: number;
  participantsSignedUp: number;
  spotsRemaining: number;
  isSoldOut: boolean;
  isRegistrationOpen: boolean;
  closedMessage: string | null;
  earlyBirdLabel: string;
  earlyBirdPercent: number;
  earlyBirdMaxUses: number;
  earlyBirdUses: number;
  earlyBirdRemaining: number;
};

type InitBody = {
  fullName: string;
  whatsappNumber: string;
  email: string;
  age: number;
  paymentOption: ChallengePaymentOption;
  emergencyContactName: string;
  emergencyContactNumber: string;
  challengeGoal: ChallengeGoal;
  dietaryPreferences: ChallengeDietaryPreference[];
  foodsDisliked: string;
  medicalConditions: string;
  activityLevel: ChallengeActivityLevel;
  alcoholFrequency: string;
  instagramHandle: string;
  guardianName?: string;
  termsAccepted: boolean;
  liabilityAccepted: boolean;
  agreementSignature: string;
  agreementDate: string;
  promoCode?: string;
};

// ─── Validators ───────────────────────────────────────────────────────────────

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function parseInitBody(raw: unknown): InitBody | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Partial<InitBody>;

  if (
    !isNonEmptyString(b.fullName) ||
    !isNonEmptyString(b.whatsappNumber) ||
    !isNonEmptyString(b.email) ||
    typeof b.age !== "number" ||
    !isNonEmptyString(b.paymentOption) ||
    !isNonEmptyString(b.emergencyContactName) ||
    !isNonEmptyString(b.emergencyContactNumber) ||
    !isNonEmptyString(b.challengeGoal) ||
    !Array.isArray(b.dietaryPreferences) ||
    typeof b.foodsDisliked !== "string" ||
    typeof b.medicalConditions !== "string" ||
    !isNonEmptyString(b.activityLevel) ||
    !isNonEmptyString(b.alcoholFrequency) ||
    typeof b.instagramHandle !== "string" ||
    (typeof b.guardianName !== "undefined" &&
      typeof b.guardianName !== "string") ||
    b.termsAccepted !== true ||
    b.liabilityAccepted !== true ||
    !isNonEmptyString(b.agreementSignature) ||
    !isNonEmptyString(b.agreementDate)
  ) {
    return null;
  }

  const validPaymentOption = b.paymentOption === "member" || b.paymentOption === "non_member";
  const validGoal = (GOAL_OPTIONS as string[]).includes(b.challengeGoal);
  const validActivity = (ACTIVITY_OPTIONS as string[]).includes(b.activityLevel);
  const validDietary = b.dietaryPreferences.every((d) =>
    (DIETARY_OPTIONS as string[]).includes(d)
  );

  if (!validPaymentOption || !validGoal || !validActivity || !validDietary) {
    return null;
  }

  return b as InitBody;
}

// ─── Challenge status ─────────────────────────────────────────────────────────

async function getPendingRecoverySpotCount(
  supabase: SupabaseClient
): Promise<number> {
  const refs = CHALLENGE_RECOVERY_LOCK.paidRecoveryReferences;
  if (refs.length === 0) return 0;
  const { count, error } = await supabase
    .from("challenge_registrations")
    .select("*", { count: "exact", head: true })
    .in("payment_reference", refs);
  if (error) throw new Error(error.message);
  return Math.max(0, refs.length - (count ?? 0));
}

async function getChallengeStatus(): Promise<ChallengeStatus> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase environment variables are missing.");

  const [
    { count: signedUp, error },
    { count: discountUses, error: discountError },
    pendingRecovery,
  ] = await Promise.all([
    supabase
      .from("challenge_registrations")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "paid"),
    supabase
      .from("challenge_registrations")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "paid")
      .eq("discount_applied", true),
    getPendingRecoverySpotCount(supabase),
  ]);

  if (error) throw new Error(error.message);
  if (discountError) throw new Error(discountError.message);

  const count = signedUp ?? 0;
  const discounted = discountUses ?? 0;
  const publicCapacity = Math.max(
    0,
    CHALLENGE_CONFIG.maxParticipants - pendingRecovery
  );
  const spotsRemaining = Math.max(0, publicCapacity - count);
  const isSoldOut = !CHALLENGE_REGISTRATION.isOpen || spotsRemaining <= 0;
  const earlyBirdRemaining = Math.max(
    0,
    CHALLENGE_CONFIG.discount.maxUses - discounted
  );

  return {
    maxParticipants: CHALLENGE_CONFIG.maxParticipants,
    participantsSignedUp: count,
    spotsRemaining: isSoldOut ? 0 : spotsRemaining,
    isSoldOut,
    isRegistrationOpen: CHALLENGE_REGISTRATION.isOpen,
    closedMessage: CHALLENGE_REGISTRATION.isOpen
      ? null
      : CHALLENGE_REGISTRATION.closedMessage,
    earlyBirdLabel: CHALLENGE_CONFIG.discount.label,
    earlyBirdPercent: CHALLENGE_CONFIG.discount.percent,
    earlyBirdMaxUses: CHALLENGE_CONFIG.discount.maxUses,
    earlyBirdUses: discounted,
    earlyBirdRemaining,
  };
}

// ─── Paystack initialise ──────────────────────────────────────────────────────

async function initialisePaystack(params: {
  reference: string;
  email: string;
  amountKobo: number;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<{ authorization_url: string; reference: string }> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is missing.");

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reference: params.reference,
      email: params.email,
      amount: params.amountKobo,
      currency: "ZAR",
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
    cache: "no-store",
  });

  const payload = (await res.json().catch(() => null)) as {
    status: boolean;
    message?: string;
    data?: { authorization_url: string; reference: string };
  } | null;

  if (!res.ok || !payload?.status || !payload.data) {
    throw new Error(
      payload?.message || "Failed to initialise Paystack transaction."
    );
  }

  return payload.data;
}

// ─── GET — challenge status ───────────────────────────────────────────────────

export async function GET() {
  try {
    const status = await getChallengeStatus();
    return NextResponse.json({ status });
  } catch (error) {
    console.error("Error loading challenge status:", error);
    return NextResponse.json(
      {
        error:
          "Unable to load challenge availability. Check that challenge_registrations exists in Supabase.",
      },
      { status: 500 }
    );
  }
}

// ─── POST — initialise Paystack transaction ───────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    if (!CHALLENGE_REGISTRATION.isOpen) {
      return NextResponse.json(
        { error: CHALLENGE_REGISTRATION.closedMessage },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    // 1 — Validate form body
    const rawBody = await request.json().catch(() => null);
    const body = parseInitBody(rawBody);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid challenge registration payload." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(body.age) || body.age < 16 || body.age > 100) {
      return NextResponse.json(
        { error: "Age must be between 16 and 100." },
        { status: 400 }
      );
    }

    // 2 — Spot availability check (informational; the webhook won't double-save)
    const challengeStatus = await getChallengeStatus();
    if (challengeStatus.isSoldOut) {
      return NextResponse.json(
        {
          error:
            "Challenge is sold out. Please contact the gym to join a waitlist.",
        },
        { status: 409 }
      );
    }

    // 3 — Apply automatic early bird discount (first N registrations get X% off)
    //     Discount is applied automatically — no promo code needed.
    //     Re-fetch status here so the count is fresh at submit time.
    const freshStatus = await getChallengeStatus();
    const earlyBirdAvailable =
      CHALLENGE_CONFIG.discount.maxUses > 0 &&
      freshStatus.earlyBirdRemaining > 0;
    const discountPercent = earlyBirdAvailable
      ? CHALLENGE_CONFIG.discount.percent
      : 0;
    const promoCodeId: string | null = null;

    // 4 — Compute final amount
    const baseAmount = getBaseChallengeAmount(body.paymentOption);
    const discountAmount = discountPercent
      ? Math.round(baseAmount * (discountPercent / 100))
      : 0;
    const finalAmount = baseAmount - discountAmount;
    const amountKobo = Math.round(finalAmount * 100);

    // 5 — Generate reference and callback URL
    const reference = `challenge_${Date.now()}`;
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://recoupyou.co.za";
    const callbackUrl = `${baseUrl}/6-week-challenge/success`;

    // 6 — Build Paystack metadata
    //     The webhook reconstructs the full registration from this object alone —
    //     no session or frontend state is relied upon.
    const metadata: Record<string, unknown> = {
      // Challenge identifiers
      challenge_name: CHALLENGE_CONFIG.title,

      // Discount info
      promo_code_used: null,
      promo_code_id: promoCodeId,
      discount_percent: discountPercent,
      discount_amount: discountAmount,
      base_amount: baseAmount,
      final_amount: finalAmount,

      // Personal details
      full_name: body.fullName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.whatsappNumber.trim(),
      whatsapp_number: body.whatsappNumber.trim(),
      age: body.age,
      payment_option: body.paymentOption,

      // Emergency contact
      emergency_contact_name: body.emergencyContactName.trim(),
      emergency_contact_number: body.emergencyContactNumber.trim(),

      // Health & nutrition
      challenge_goal: body.challengeGoal,
      dietary_preferences: body.dietaryPreferences,
      foods_disliked: body.foodsDisliked.trim() || null,
      medical_conditions: body.medicalConditions.trim() || null,
      activity_level: body.activityLevel,
      alcohol_frequency: body.alcoholFrequency.trim(),
      instagram_handle: body.instagramHandle.trim() || null,

      // Guardian (minors)
      guardian_name:
        body.age < 18 ? body.guardianName?.trim() || null : null,

      // Agreement
      terms_accepted: true,
      liability_accepted: true,
      agreement_signature: body.agreementSignature.trim(),
      agreement_date: body.agreementDate,
    };

    // 7 — Initialise Paystack transaction
    const paystack = await initialisePaystack({
      reference,
      email: body.email.trim().toLowerCase(),
      amountKobo,
      callbackUrl,
      metadata,
    });

    return NextResponse.json({
      authorizationUrl: paystack.authorization_url,
      reference: paystack.reference,
    });
  } catch (error) {
    console.error("Error initialising challenge payment:", error);
    return NextResponse.json(
      { error: "Internal server error while initialising payment." },
      { status: 500 }
    );
  }
}
