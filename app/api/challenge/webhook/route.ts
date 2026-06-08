import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

// ─── Node.js runtime required for crypto and raw body reading ────────────────
export const runtime = "nodejs";

// ─── Helpers to parse Paystack metadata (values come back as strings) ────────

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

// ─── Supabase (service role) ──────────────────────────────────────────────────

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing.");
  return createClient(url, key);
}

// ─── HMAC verification ────────────────────────────────────────────────────────

function verifyPaystackSignature(
  rawBody: Buffer,
  receivedSig: string | null
): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || !receivedSig) return false;

  const expected = createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  try {
    // timingSafeEqual requires same-length buffers
    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(receivedSig, "hex");
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

// ─── Paystack verify API ──────────────────────────────────────────────────────

async function verifyPaystackTransaction(reference: string): Promise<{
  status: string;
  amount: number; // in Rands (divided from kobo)
  metadata: Record<string, unknown>;
}> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is missing.");

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Cache-Control": "no-cache",
      },
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
    throw new Error(
      payload?.message || "Failed to verify Paystack transaction."
    );
  }

  const { data } = payload;

  if (data.currency !== "ZAR") {
    throw new Error(`Unexpected currency: ${data.currency}`);
  }

  return {
    status: data.status,
    amount: data.amount / 100, // kobo → Rands
    metadata: data.metadata ?? {},
  };
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 1 — Read raw bytes (required for correct HMAC computation)
  const rawBodyArrayBuffer = await request.arrayBuffer();
  const rawBody = Buffer.from(rawBodyArrayBuffer);
  const receivedSig = request.headers.get("x-paystack-signature");

  // 2 — Verify HMAC-SHA512 signature
  if (!verifyPaystackSignature(rawBody, receivedSig)) {
    // Log first 20 chars of received sig alongside expected prefix to aid
    // misconfiguration debugging — never log the full secret key.
    const secretKey = process.env.PAYSTACK_SECRET_KEY ?? "";
    const expectedPrefix = createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex")
      .slice(0, 20);
    const receivedPrefix = (receivedSig ?? "").slice(0, 20);

    console.error(
      `[webhook] HMAC mismatch. ` +
        `received_sig_prefix="${receivedPrefix}" ` +
        `expected_sig_prefix="${expectedPrefix}"`
    );

    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  // 3 — Parse JSON payload
  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody.toString("utf-8"));
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  // 4 — Only process charge.success; acknowledge everything else immediately
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference =
    typeof event.data.reference === "string" ? event.data.reference : null;

  if (!reference) {
    console.error("[webhook] charge.success event has no reference field.");
    return NextResponse.json(
      { error: "Missing payment reference." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseClient();

  // 5 — Idempotency check: attempt to insert into payment_events.
  //     If the reference already exists (ON CONFLICT DO NOTHING), no row is
  //     returned and we bail — this was already processed (Paystack retry).
  const { data: eventRow, error: eventInsertError } = await supabase
    .from("payment_events")
    .insert({
      paystack_reference: reference,
      event_type: event.event,
    })
    .select("id")
    .maybeSingle();

  if (eventInsertError) {
    // A conflict error (code 23505) means already processed — return 200 so
    // Paystack stops retrying. Any other error is a real failure.
    const isConflict =
      eventInsertError.code === "23505" ||
      eventInsertError.message?.toLowerCase().includes("unique");

    if (isConflict) {
      console.log(
        `[webhook] Reference ${reference} already processed. Skipping.`
      );
      return NextResponse.json({ received: true });
    }

    console.error("[webhook] payment_events insert error:", eventInsertError);
    return NextResponse.json(
      { error: "Database error during idempotency check." },
      { status: 500 }
    );
  }

  if (!eventRow) {
    // Duplicate reference — already processed
    console.log(
      `[webhook] Reference ${reference} already processed (no row). Skipping.`
    );
    return NextResponse.json({ received: true });
  }

  // 6 — Verify payment via Paystack API
  //     Do NOT trust the webhook payload alone — always call the verify endpoint.
  let verifiedTx: Awaited<ReturnType<typeof verifyPaystackTransaction>>;
  try {
    verifiedTx = await verifyPaystackTransaction(reference);
  } catch (err) {
    console.error("[webhook] Paystack verify failed:", err);
    return NextResponse.json(
      { error: "Payment verification failed." },
      { status: 500 }
    );
  }

  if (verifiedTx.status !== "success") {
    console.warn(
      `[webhook] Reference ${reference} verified status is "${verifiedTx.status}", not "success". Skipping save.`
    );
    return NextResponse.json({ received: true });
  }

  // 7 — Extract user data from metadata
  const m = verifiedTx.metadata;

  // Paystack returns all metadata values as strings — use toStr/toNum helpers
  const fullName = toStr(m.full_name);
  const email = toStr(m.email);
  const whatsappNumber = toStr(m.whatsapp_number);
  const age = toNum(m.age);
  const paymentOption =
    m.payment_option === "member" || m.payment_option === "non_member"
      ? (m.payment_option as string)
      : null;
  const baseAmount = toNum(m.base_amount);
  const finalAmount = toNum(m.final_amount) ?? verifiedTx.amount;
  const discountAmount = toNum(m.discount_amount) ?? 0;
  const discountPercent = toNum(m.discount_percent) ?? 0;
  const promoCodeUsed =
    typeof m.promo_code_used === "string" && m.promo_code_used.trim().length > 0
      ? m.promo_code_used.trim()
      : null;

  if (
    !fullName ||
    !email ||
    !whatsappNumber ||
    !age ||
    !paymentOption ||
    !baseAmount
  ) {
    console.error(
      `[webhook] Reference ${reference} metadata is incomplete. Cannot save registration.`,
      m
    );
    return NextResponse.json(
      { error: "Incomplete metadata — registration not saved." },
      { status: 400 }
    );
  }

  // 8 — Verify amount matches what was expected (guards against metadata tampering)
  if (Math.abs(verifiedTx.amount - (finalAmount ?? verifiedTx.amount)) > 1) {
    console.error(
      `[webhook] Amount mismatch for ${reference}: ` +
        `expected ${finalAmount}, got ${verifiedTx.amount}`
    );
    return NextResponse.json(
      { error: "Payment amount does not match expected amount." },
      { status: 400 }
    );
  }

  // 9 — Save registration to database
  const { error: insertError } = await supabase
    .from("challenge_registrations")
    .insert({
      full_name: fullName,
      whatsapp_number: whatsappNumber,
      email,
      age,
      payment_option: paymentOption,
      base_price: baseAmount,
      amount_paid: verifiedTx.amount,
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

    if (isDuplicate) {
      // Already saved (e.g. recover route ran first) — not an error
      console.warn(
        `[webhook] Registration for ${reference} already exists. Skipping duplicate insert.`
      );
      return NextResponse.json({ received: true });
    }

    console.error("[webhook] Registration insert error:", insertError);
    return NextResponse.json(
      { error: "Failed to save registration." },
      { status: 500 }
    );
  }

  console.log(`[webhook] Registration saved for reference ${reference}.`);

  // 10 — Return 200 to Paystack
  return NextResponse.json({ received: true });
}
