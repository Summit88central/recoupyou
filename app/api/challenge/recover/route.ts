import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  ACTIVITY_OPTIONS,
  CHALLENGE_CONFIG,
  CHALLENGE_RECOVERY_LOCK,
  DIETARY_OPTIONS,
  GOAL_OPTIONS,
  getBaseChallengeAmount,
  getDiscountedAmount,
  type ChallengeActivityLevel,
  type ChallengeDietaryPreference,
  type ChallengeGoal,
  type ChallengePaymentOption,
} from "@/lib/challenge";

type ChallengeRegistrationBody = {
  paymentReference: string;
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
  termsAccepted: boolean;
  liabilityAccepted: boolean;
  agreementSignature: string;
  agreementDate: string;
};

type ChallengeStatus = {
  maxParticipants: number;
  participantsSignedUp: number;
  spotsRemaining: number;
  isSoldOut: boolean;
  discountLabel: string;
  discountMaxUses: number;
  discountUses: number;
  discountRemaining: number;
};

function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
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

function isValidRegistrationBody(
  raw: unknown
): ChallengeRegistrationBody | null {
  if (!raw || typeof raw !== "object") return null;

  const body = raw as Partial<ChallengeRegistrationBody>;

  if (
    !isNonEmptyString(body.paymentReference) ||
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
    body.termsAccepted !== true ||
    body.liabilityAccepted !== true ||
    !isNonEmptyString(body.agreementSignature) ||
    !isNonEmptyString(body.agreementDate)
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

async function getChallengeStatus(supabase: SupabaseClient): Promise<ChallengeStatus> {
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
  const discountRemaining = Math.max(0, CHALLENGE_CONFIG.discount.maxUses - discounted);

  return {
    maxParticipants: CHALLENGE_CONFIG.maxParticipants,
    participantsSignedUp: signedUp,
    spotsRemaining,
    isSoldOut: spotsRemaining <= 0,
    discountLabel: CHALLENGE_CONFIG.discount.label,
    discountMaxUses: CHALLENGE_CONFIG.discount.maxUses,
    discountUses: discounted,
    discountRemaining,
  };
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

    const rawBody = await request.json().catch(() => null);
    const body = isValidRegistrationBody(rawBody);

    if (!body) {
      return NextResponse.json(
        { error: "Invalid recovery payload." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(body.age) || body.age < 16 || body.age > 100) {
      return NextResponse.json(
        { error: "Age must be between 16 and 100." },
        { status: 400 }
      );
    }

    const paymentReference = body.paymentReference.trim();

    const { data: existingRecord } = await supabase
      .from("challenge_registrations")
      .select("id,payment_status")
      .eq("payment_reference", paymentReference)
      .maybeSingle();

    if (existingRecord) {
      return NextResponse.json(
        { error: "That payment reference is already linked to an application." },
        { status: 409 }
      );
    }

    const status = await getChallengeStatus(supabase);
    const baseAmount = getBaseChallengeAmount(body.paymentOption);
    const discountAmount = getDiscountedAmount(baseAmount);
    const isRecoveryReference =
      CHALLENGE_RECOVERY_LOCK.isActive &&
      CHALLENGE_RECOVERY_LOCK.paidRecoveryReferences.includes(
        paymentReference
      );
    const discountApplied = status.discountRemaining > 0;
    const recoveredAmount = discountApplied ? discountAmount : baseAmount;
    const paymentStatus =
      status.isSoldOut && !isRecoveryReference ? "waitlist" : "paid";

    const { data, error } = await supabase
      .from("challenge_registrations")
      .insert({
        full_name: body.fullName.trim(),
        whatsapp_number: body.whatsappNumber.trim(),
        email: body.email.trim().toLowerCase(),
        age: body.age,
        payment_option: body.paymentOption,
        base_price: baseAmount,
        amount_paid: recoveredAmount,
        discount_code: discountApplied ? "AUTO_FIRST_3_20_OFF" : null,
        discount_applied: discountApplied,
        discount_amount: discountApplied ? baseAmount - recoveredAmount : 0,
        payment_reference: paymentReference,
        emergency_contact_name: body.emergencyContactName.trim(),
        emergency_contact_number: body.emergencyContactNumber.trim(),
        challenge_goal: body.challengeGoal,
        dietary_preferences: body.dietaryPreferences,
        foods_disliked: body.foodsDisliked.trim() || null,
        medical_conditions: body.medicalConditions.trim() || null,
        activity_level: body.activityLevel,
        alcohol_frequency: body.alcoholFrequency.trim(),
        instagram_handle: body.instagramHandle.trim() || null,
        guardian_name: null,
        terms_accepted: true,
        liability_accepted: true,
        agreement_signature: body.agreementSignature.trim(),
        agreement_date: body.agreementDate,
        payment_status: paymentStatus,
        registration_payload: {
          recovered: true,
          paidRecovery: isRecoveryReference,
          manual_recovery: true,
          processed_at: new Date().toISOString(),
        },
      })
      .select("id,payment_status")
      .single();

    if (error) {
      const isDuplicateReference =
        error.code === "23505" || error.message.toLowerCase().includes("unique");
      return NextResponse.json(
        {
          error: isDuplicateReference
            ? "This payment reference was already recovered."
            : "Failed to save recovered registration.",
        },
        { status: isDuplicateReference ? 409 : 500 }
      );
    }

    const updatedStatus = await getChallengeStatus(supabase);

    return NextResponse.json(
      {
        registrationId: data.id,
        status: updatedStatus,
        paymentStatus: data.payment_status,
        discountApplied,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recovering challenge registration:", error);
    return NextResponse.json(
      { error: "Internal server error while recovering challenge registration." },
      { status: 500 }
    );
  }
}
