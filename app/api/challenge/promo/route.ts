import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase (service role) ──────────────────────────────────────────────────

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing.");
  return createClient(url, key);
}

// ─── POST — preview-only promo code check ────────────────────────────────────
//
// This endpoint does NOT consume a use. It only tells the frontend whether the
// code is valid and what discount percentage it would apply, so the user can
// see the discounted total before submitting.
//
// The actual atomic reservation (UPDATE uses_count + 1 WHERE uses_count < max_uses)
// happens inside POST /api/challenge when the form is submitted.

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => null);
    const code =
      raw && typeof raw.code === "string" ? raw.code.trim().toUpperCase() : null;

    if (!code) {
      return NextResponse.json(
        { error: "Promo code is required." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // preview_promo_code() returns (discount_percent, uses_remaining) if the
    // code is valid, active, and not fully used — otherwise zero rows.
    const { data: row, error } = await supabase
      .rpc("preview_promo_code", { p_code: code })
      .maybeSingle();

    if (error) {
      console.error("Promo preview RPC error:", error);
      return NextResponse.json(
        { error: "Unable to check promo code. Please try again." },
        { status: 500 }
      );
    }

    if (!row) {
      return NextResponse.json(
        { valid: false, error: "Promo code is invalid, expired, or fully used." },
        { status: 200 } // 200 so the frontend can display the message without a toast error
      );
    }

    const { discount_percent, uses_remaining } = row as {
      discount_percent: number;
      uses_remaining: number;
    };

    return NextResponse.json({
      valid: true,
      discountPercent: discount_percent,
      usesRemaining: uses_remaining,
    });
  } catch (error) {
    console.error("Promo code preview error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
