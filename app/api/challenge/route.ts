import { NextRequest, NextResponse } from "next/server";
import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import {
  ACTIVITY_OPTIONS,
  CHALLENGE_CONFIG,
  DIETARY_OPTIONS,
  GOAL_OPTIONS,
  getBaseChallengeAmount,
  getDiscountedAmount,
  normalizePromoCode,
  type ChallengeActivityLevel,
  type ChallengeDietaryPreference,
  type ChallengeGoal,
  type ChallengePaymentOption,
} from "@/lib/challenge";

let cachedSupabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (cachedSupabase) return cachedSupabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  cachedSupabase = createClient(supabaseUrl, serviceRoleKey);
  return cachedSupabase;
}

type ChallengeStatus = {
  maxParticipants: number;
  participantsSignedUp: number;
  spotsRemaining: number;
  isSoldOut: boolean;
  discountCode: string;
  discountMaxUses: number;
  discountUses: number;
  discountRemaining: number;
};

type ChallengeRegistrationBody = {
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
  paymentReference: string;
  amountPaid: number;
  promoCode?: string;
};

async function getChallengeStatus(): Promise<ChallengeStatus> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase environment variables are missing.");
  }

  const [{ count: participantsSignedUp, error: participantsError }, { count: discountUses, error: discountError }] =
    await Promise.all([
      supabase
        .from("challenge_registrations")
        .select("*", { count: "exact", head: true })
        .eq("payment_status", "paid"),
      supabase
        .from("challenge_registrations")
        .select("*", { count: "exact", head: true })
        .eq("payment_status", "paid")
        .eq("discount_applied", true),
    ]);

  if (participantsError || discountError) {
    throw new Error(
      participantsError?.message || discountError?.message || "Unknown error"
    );
  }

  const signedUp = participantsSignedUp ?? 0;
  const discounted = discountUses ?? 0;
  const spotsRemaining = Math.max(0, CHALLENGE_CONFIG.maxParticipants - signedUp);
  const discountRemaining = Math.max(
    0,
    CHALLENGE_CONFIG.discount.maxUses - discounted
  );

  return {
    maxParticipants: CHALLENGE_CONFIG.maxParticipants,
    participantsSignedUp: signedUp,
    spotsRemaining,
    isSoldOut: spotsRemaining <= 0,
    discountCode: CHALLENGE_CONFIG.discount.code,
    discountMaxUses: CHALLENGE_CONFIG.discount.maxUses,
    discountUses: discounted,
    discountRemaining,
  };
}

function isValidPaymentOption(value: string): value is ChallengePaymentOption {
  return value === "member" || value === "non_member";
}

function isValidChallengeGoal(value: string): value is ChallengeGoal {
  return (GOAL_OPTIONS as string[]).includes(value);
}

function isValidActivityLevel(value: string): value is ChallengeActivityLevel {
  return (ACTIVITY_OPTIONS as string[]).includes(value);
}

function isValidDietaryPreference(
  value: string
): value is ChallengeDietaryPreference {
  return (DIETARY_OPTIONS as string[]).includes(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseRegistrationBody(raw: unknown): ChallengeRegistrationBody | null {
  if (!raw || typeof raw !== "object") return null;

  const body = raw as Partial<ChallengeRegistrationBody>;

  if (
    !isNonEmptyString(body.fullName) ||
    !isNonEmptyString(body.whatsappNumber) ||
    !isNonEmptyString(body.email) ||
    typeof body.age !== "number" ||
    !isNonEmptyString(body.paymentOption) ||
    !isNonEmptyString(body.emergencyContactName) ||
    !isNonEmptyString(body.emergencyContactNumber) ||
    !isNonEmptyString(body.challengeGoal) ||
    !Array.isArray(body.dietaryPreferences) ||
    typeof body.foodsDisliked !== "string" ||
    typeof body.medicalConditions !== "string" ||
    !isNonEmptyString(body.activityLevel) ||
    !isNonEmptyString(body.alcoholFrequency) ||
    typeof body.instagramHandle !== "string" ||
    typeof body.guardianName !== "undefined" &&
      typeof body.guardianName !== "string" ||
    body.termsAccepted !== true ||
    body.liabilityAccepted !== true ||
    !isNonEmptyString(body.agreementSignature) ||
    !isNonEmptyString(body.agreementDate) ||
    !isNonEmptyString(body.paymentReference) ||
    typeof body.amountPaid !== "number"
  ) {
    return null;
  }

  if (
    !isValidPaymentOption(body.paymentOption) ||
    !isValidChallengeGoal(body.challengeGoal) ||
    !isValidActivityLevel(body.activityLevel) ||
    body.dietaryPreferences.some((item) => !isValidDietaryPreference(item))
  ) {
    return null;
  }

  return body as ChallengeRegistrationBody;
}

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

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const rawBody = await request.json();
    const body = parseRegistrationBody(rawBody);

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

    if (body.age < 18 && !isNonEmptyString(body.guardianName)) {
      return NextResponse.json(
        { error: "Guardian name is required for applicants under 18." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(body.amountPaid) || body.amountPaid <= 0) {
      return NextResponse.json(
        { error: "Invalid amount paid." },
        { status: 400 }
      );
    }

    const status = await getChallengeStatus();
    if (status.isSoldOut) {
      return NextResponse.json(
        {
          error: "Challenge is sold out. Please contact the gym to join a waitlist.",
        },
        { status: 409 }
      );
    }

    const baseAmount = getBaseChallengeAmount(body.paymentOption);
    const normalizedPromoCode = normalizePromoCode(body.promoCode || "");
    const discountAmount = getDiscountedAmount(baseAmount);
    const discountEligible =
      normalizedPromoCode === CHALLENGE_CONFIG.discount.code &&
      status.discountRemaining > 0;
    const validAmounts = discountEligible
      ? [baseAmount, discountAmount]
      : [baseAmount];

    if (!validAmounts.includes(body.amountPaid)) {
      return NextResponse.json(
        {
          error: "Unexpected payment amount for the selected payment option.",
          expectedAmounts: validAmounts,
        },
        { status: 400 }
      );
    }

    const discountApplied = discountEligible && body.amountPaid === discountAmount;

    const { data, error } = await supabase
      .from("challenge_registrations")
      .insert({
        full_name: body.fullName.trim(),
        whatsapp_number: body.whatsappNumber.trim(),
        email: body.email.trim().toLowerCase(),
        age: body.age,
        payment_option: body.paymentOption,
        base_price: baseAmount,
        amount_paid: body.amountPaid,
        discount_code: normalizedPromoCode || null,
        discount_applied: discountApplied,
        discount_amount: discountApplied ? baseAmount - body.amountPaid : 0,
        payment_reference: body.paymentReference.trim(),
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
        payment_status: "paid",
      })
      .select("id")
      .single();

    if (error) {
      const isDuplicateReference =
        error.code === "23505" || error.message.toLowerCase().includes("unique");
      return NextResponse.json(
        {
          error: isDuplicateReference
            ? "This payment reference was already registered."
            : "Failed to save challenge registration.",
        },
        { status: isDuplicateReference ? 409 : 500 }
      );
    }

    const updatedStatus = await getChallengeStatus();

    return NextResponse.json(
      {
        registrationId: data.id,
        status: updatedStatus,
        discountApplied,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating challenge registration:", error);
    return NextResponse.json(
      { error: "Internal server error while registering for challenge." },
      { status: 500 }
    );
  }
}
