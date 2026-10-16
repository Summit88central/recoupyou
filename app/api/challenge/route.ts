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
  // Only reserve recovery spots when the lock is explicitly active.
  // When isActive is false (new round), skip this entirely so stale
  // references from the previous round don't reduce visible capacity.
  if (!CHALLENGE_RECOVERY_LOCK.isActive) return 0;
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
    // Count both paid AND pending — pending = manual EFT submitted, spot is reserved
    supabase
      .from("challenge_registrations")
      .select("*", { count: "exact", head: true })
      .in("payment_status", ["paid", "pending"]),
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

// ─── POST — save application for manual payment ────────────────────────────────

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

    // 3 — Save the application as awaiting manual bank transfer.
    const baseAmount = getBaseChallengeAmount(body.paymentOption);
    const reference = `challenge_${Date.now()}`;
    const { error: insertError } = await supabase
      .from("challenge_registrations")
      .insert({
        full_name: body.fullName.trim(),
        whatsapp_number: body.whatsappNumber.trim(),
        email: body.email.trim().toLowerCase(),
        age: body.age,
        payment_option: body.paymentOption,
        base_price: baseAmount,
        amount_paid: 0,
        discount_code: null,
        discount_applied: false,
        discount_amount: 0,
        payment_reference: reference,
        emergency_contact_name: body.emergencyContactName.trim(),
        emergency_contact_number: body.emergencyContactNumber.trim(),
        challenge_goal: body.challengeGoal,
        dietary_preferences: body.dietaryPreferences,
        foods_disliked: body.foodsDisliked.trim() || null,
        medical_conditions: body.medicalConditions.trim() || null,
        activity_level: body.activityLevel,
        alcohol_frequency: body.alcoholFrequency.trim(),
        instagram_handle: body.instagramHandle.trim() || null,
        guardian_name: body.age < 18 ? body.guardianName?.trim() || null : null,
        terms_accepted: true,
        liability_accepted: true,
        agreement_signature: body.agreementSignature.trim(),
        agreement_date: body.agreementDate,
        payment_status: "pending",
      });

    if (insertError) throw new Error(insertError.message);

    return NextResponse.json({
      submitted: true,
      reference,
    });
  } catch (error) {
    console.error("Error submitting challenge registration:", error);
    return NextResponse.json(
      { error: "Internal server error while submitting your application." },
      { status: 500 }
    );
  }
}
