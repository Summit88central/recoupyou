// app/api/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const paystackSecret = process.env.PAYSTACK_SECRET_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    console.error("No reference provided");
    return NextResponse.json({ error: "Reference required" }, { status: 400 });
  }

  try {
    const { data: paystackData } = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
        },
      }
    );

    if (paystackData.status && paystackData.data.status === "success") {
      const { metadata, customer, amount } = paystackData.data;
      const guideId = metadata.guide_id;

      const { data: guide, error: guideError } = await supabaseAdmin
        .from("guides")
        .select("file_path")
        .eq("id", guideId)
        .single();

      if (guideError || !guide) {
        console.error("Guide not found:", guideError);
        return NextResponse.json({ error: "Guide not found" }, { status: 404 });
      }

      const { data: signedUrlData, error: urlError } =
        await supabaseAdmin.storage
          .from("guides")
          .createSignedUrl(guide.file_path, 3600);

      if (urlError || !signedUrlData) {
        console.error("Signed URL error:", urlError);
        return NextResponse.json(
          { error: "Failed to generate download URL" },
          { status: 500 }
        );
      }

      // Insert purchase record only after successful URL generation
      const { error: insertError } = await supabaseAdmin
        .from("guide_purchases")
        .insert({
          guide_id: guideId,
          email: customer.email,
          payment_reference: reference,
          amount: amount / 100, // Convert kobo to major units (e.g., Rand)
          status: "completed",
        });

      if (insertError) {
        console.error("Purchase insert error:", insertError);
        // Don't fail the response if insert fails (user still gets URL), but log it
      }

      return NextResponse.json({ url: signedUrlData.signedUrl });
    } else {
      console.error("Payment verification failed:", paystackData);
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
