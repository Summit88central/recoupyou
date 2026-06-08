import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Force dynamic rendering — this route reads query params from request.url
export const dynamic = "force-dynamic";

// ─── Supabase (service role) ──────────────────────────────────────────────────

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing.");
  return createClient(url, key);
}

// ─── GET /api/challenge/confirm?reference=xxx ─────────────────────────────────
//
// Read-only endpoint polled by the /success page to check whether the webhook
// has saved the registration yet. No DB writes happen here under any circumstances.

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

    if (!data) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      name: data.full_name,
      email: data.email,
      paymentOption: data.payment_option,
      amountPaid: data.amount_paid,
      promoCodeUsed: data.promo_code_used ?? null,
      status: data.status,
    });
  } catch (error) {
    console.error("confirm endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
