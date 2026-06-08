import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering — this route reads query params from request.url
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Supabase (service role) ──────────────────────────────────────────────────

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing.");
  return createClient(url, key);
}

// ─── Paystack verify ──────────────────────────────────────────────────────────

async function verifyAndSave(reference: string): Promise<{
  saved: boolean;
  name?: string;
  email?: string;
  paymentOption?: string;
  amountPaid?: number;
  status?: string;
  error?: string;
}> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return { saved: false, error: "PAYSTACK_SECRET_KEY missing." };

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey}`, "Cache-Control": "no-cache" },
      cache: "no-store",
    }
  );

  const payload = (await res.json().catch(() => null)) as {
    status: boolean;
    message?: string;
    data?: {
      status: string;
      amount: number;
      currency: string;
      metadata: Record<string, unknown>;
    };
  } | null;

  if (!res.ok || !payload?.status || !payload.data) {
    return { saved: false, error: payload?.message || "Paystack verify failed." };
  }

  const { data } = payload;

  if (data.status !== "success") {
    return { saved: false, error: `Payment status is "${data.status}", not "success".` };
  }

  const m = data.metadata ?? {};
  const amountRands = data.amount / 100;

  const fullName = typeof m.full_name === "string" ? m.full_name : null;
  const email = typeof m.email === "string" ? m.email : null;
  const whatsappNumber = typeof m.whatsapp_number === "string" ? m.whatsapp_number : null;
  const age = typeof m.age === "number" ? m.age : null;
  const paymentOption =
    m.payment_option === "member" || m.payment_option === "non_member"
      ? m.payment_option
      : null;
  const baseAmount = typeof m.base_amount === "number" ? m.base_amount : amountRands;
  const discountAmount = typeof m.discount_amount === "number" ? m.discount_amount : 0;
  const discountPercent = typeof m.discount_percent === "number" ? m.discount_percent : 0;
  const promoCodeUsed = typeof m.promo_code_used === "string" ? m.promo_code_used : null;

  if (!fullName || !email || !whatsappNumber || !age || !paymentOption) {
    return { saved: false, error: "Incomplete metadata — cannot save registration." };
  }

  const supabase = getSupabaseClient();

  // Idempotency: try insert; ignore duplicate conflict
  const { error: insertError } = await supabase
    .from("challenge_registrations")
    .insert({
      full_name: fullName,
      whatsapp_number: whatsappNumber,
      email,
      age,
      payment_option: paymentOption,
      base_price: baseAmount,
      amount_paid: amountRands,
      discount_code: promoCodeUsed,
      discount_applied: discountPercent > 0,
      discount_amount: discountAmount,
      payment_reference: reference,
      emergency_contact_name:
        typeof m.emergency_contact_name === "string" ? m.emergency_contact_name : "",
      emergency_contact_number:
        typeof m.emergency_contact_number === "string" ? m.emergency_contact_number : "",
      challenge_goal:
        typeof m.challenge_goal === "string" ? m.challenge_goal : "lose_body_fat",
      dietary_preferences: Array.isArray(m.dietary_preferences) ? m.dietary_preferences : [],
      foods_disliked:
        typeof m.foods_disliked === "string" ? m.foods_disliked : null,
      medical_conditions:
        typeof m.medical_conditions === "string" ? m.medical_conditions : null,
      activity_level:
        typeof m.activity_level === "string" ? m.activity_level : "sedentary",
      alcohol_frequency:
        typeof m.alcohol_frequency === "string" ? m.alcohol_frequency : "",
      instagram_handle:
        typeof m.instagram_handle === "string" ? m.instagram_handle : null,
      guardian_name:
        typeof m.guardian_name === "string" ? m.guardian_name : null,
      terms_accepted: true,
      liability_accepted: true,
      agreement_signature:
        typeof m.agreement_signature === "string" ? m.agreement_signature : fullName,
      agreement_date:
        typeof m.agreement_date === "string"
          ? m.agreement_date
          : new Date().toISOString().split("T")[0],
      payment_status: "paid",
      promo_code_used: promoCodeUsed,
      status: "confirmed",
    });

  if (insertError) {
    const isDuplicate =
      insertError.code === "23505" ||
      insertError.message?.toLowerCase().includes("unique");
    if (!isDuplicate) {
      console.error("[confirm] Registration insert error:", insertError);
      return { saved: false, error: "Failed to save registration." };
    }
    // Duplicate — was already saved (possibly by webhook arriving late)
  }

  return {
    saved: true,
    name: fullName,
    email,
    paymentOption: paymentOption ?? undefined,
    amountPaid: amountRands,
    status: "confirmed",
  };
}

// ─── GET /api/challenge/confirm?reference=xxx ─────────────────────────────────
//
// 1. Check if the registration is already in the DB.
// 2. If not, call Paystack verify API and save the registration directly.
//    This handles the case where the Paystack webhook hasn't fired yet or
//    isn't configured.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference")?.trim();

    if (!reference) {
      return NextResponse.json(
        { error: "reference query param is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1 — Check DB first
    const { data, error } = await supabase
      .from("challenge_registrations")
      .select("id, full_name, email, payment_option, amount_paid, promo_code_used, status")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (error) {
      console.error("confirm lookup error:", error);
      return NextResponse.json(
        { error: "Unable to look up registration." },
        { status: 500 }
      );
    }

    if (data) {
      // Already saved — return immediately
      return NextResponse.json({
        found: true,
        name: data.full_name,
        email: data.email,
        paymentOption: data.payment_option,
        amountPaid: data.amount_paid,
        promoCodeUsed: data.promo_code_used ?? null,
        status: data.status,
      });
    }

    // 2 — Not in DB yet — verify with Paystack and save now
    const result = await verifyAndSave(reference);

    if (!result.saved) {
      // Not saved — could still be processing or payment failed
      return NextResponse.json({ found: false, pendingReason: result.error });
    }

    return NextResponse.json({
      found: true,
      name: result.name,
      email: result.email,
      paymentOption: result.paymentOption,
      amountPaid: result.amountPaid,
      promoCodeUsed: null,
      status: result.status,
    });
  } catch (error) {
    console.error("confirm endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
