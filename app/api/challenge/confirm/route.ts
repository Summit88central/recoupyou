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

// ─── Helpers to parse Paystack metadata (values come back as strings) ────────

// Paystack serialises all metadata values as strings in the verify response.
// These helpers safely coerce to the expected type.
function toStr(v: unknown): string | null {
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return null;
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (isFinite(n)) return n;
  }
  return null;
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

  // Paystack returns all metadata values as strings — use toStr/toNum helpers
  const fullName = toStr(m.full_name);
  const email = toStr(m.email);
  const whatsappNumber = toStr(m.whatsapp_number);
  const age = toNum(m.age);
  const paymentOption =
    m.payment_option === "member" || m.payment_option === "non_member"
      ? (m.payment_option as string)
      : null;
  const baseAmount = toNum(m.base_amount) ?? amountRands;
  const discountAmount = toNum(m.discount_amount) ?? 0;
  const discountPercent = toNum(m.discount_percent) ?? 0;
  // Treat empty string promo code as null
  const promoCodeUsed =
    typeof m.promo_code_used === "string" && m.promo_code_used.trim().length > 0
      ? m.promo_code_used.trim()
      : null;

  if (!fullName || !email || !whatsappNumber || !age || !paymentOption) {
    console.error("[confirm] Incomplete metadata fields:", { fullName, email, whatsappNumber, age, paymentOption }, "raw:", m);
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
      emergency_contact_name: toStr(m.emergency_contact_name) ?? "",
      emergency_contact_number: toStr(m.emergency_contact_number) ?? "",
      challenge_goal: toStr(m.challenge_goal) ?? "lose_body_fat",
      dietary_preferences: Array.isArray(m.dietary_preferences) ? m.dietary_preferences : [],
      foods_disliked: toStr(m.foods_disliked),
      medical_conditions: toStr(m.medical_conditions),
      activity_level: toStr(m.activity_level) ?? "sedentary",
      alcohol_frequency: toStr(m.alcohol_frequency) ?? "",
      instagram_handle: toStr(m.instagram_handle),
      guardian_name: toStr(m.guardian_name),
      terms_accepted: true,
      liability_accepted: true,
      agreement_signature: toStr(m.agreement_signature) ?? fullName,
      agreement_date:
        toStr(m.agreement_date) ?? new Date().toISOString().split("T")[0],
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
