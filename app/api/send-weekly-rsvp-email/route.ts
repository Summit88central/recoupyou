import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import emailjs from "@emailjs/nodejs";

function getCurrentWeekStart(): string {
  const now = new Date();
  const saTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours for SAST

  // For the cron job, we want THIS week's Monday (the week ending)
  const dayOfWeek = saTime.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(saTime);
  monday.setDate(saTime.getDate() + daysToMonday);
  monday.setHours(0, 0, 0, 0);

  return monday.toISOString().split("T")[0];
}

function getThisWednesdayDate(): string {
  const now = new Date();
  const saTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // SAST

  // Get Monday of current week
  const dayOfWeek = saTime.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(saTime);
  monday.setDate(saTime.getDate() + daysToMonday);

  // Get Wednesday (2 days after Monday)
  const wednesday = new Date(monday);
  wednesday.setDate(monday.getDate() + 2);

  return wednesday.toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const currentWeekStart = getCurrentWeekStart();

    // Get all RSVPs for this week
    const { data: weekRSVPs } = await supabase
      .from("wednesday_rsvps")
      .select("*")
      .eq("week_of", currentWeekStart)
      .order("created_at", { ascending: true });

    // Prepare email content
    let participantList = "";
    let participantCount = 0;

    if (weekRSVPs && weekRSVPs.length > 0) {
      participantCount = weekRSVPs.length;
      participantList = weekRSVPs
        .map(
          (rsvp, index) =>
            `${index + 1}. ${rsvp.first_name} ${rsvp.last_name} - ${
              rsvp.phone_number
            }`
        )
        .join("\n");
    } else {
      participantList = "No RSVPs received for this week.";
    }

    // Only send email if there are RSVPs (optional - remove this if you want email even with 0 RSVPs)
    if (participantCount > 0) {
      const emailData = {
        to_email: process.env.NEXT_PUBLIC_COACH_EMAIL,
        form_type: "wednesday_rsvp_summary",
        subject: `Wednesday Class RSVPs - ${getThisWednesdayDate()}`,

        // Wednesday RSVP summary fields
        week: getThisWednesdayDate(),
        participant_count: participantCount.toString(),
        participant_list: participantList,

        // Empty fields for other form types (required by unified template)
        full_name: "",
        email: "",
        whatsapp: "",
        instagram: "",
        age: "",
        fitness_level: "",
        goals: "",
        gym_access: "",
        dietary_restrictions: "",
        package: "",
        start_date: "",
        additional_info: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        rsvp_time: "",
        next_wednesday: "",
        week_range: "",
      };

      // Send summary email to Coach Dee
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_UNIFIED_TEMPLATE!,
        emailData,
        {
          privateKey: process.env.EMAILJS_PRIVATE_KEY!,
        }
      );
    }

    // Clear RSVPs for this week after processing
    await supabase
      .from("wednesday_rsvps")
      .delete()
      .eq("week_of", currentWeekStart);

    return NextResponse.json({
      message:
        participantCount > 0
          ? "Weekly RSVP summary sent successfully"
          : "No RSVPs to send this week",
      week: getThisWednesdayDate(),
      participantCount: participantCount,
      emailSent: participantCount > 0,
    });
  } catch (error) {
    console.error("Error sending weekly RSVP summary:", error);
    return NextResponse.json(
      {
        message: "Failed to send weekly RSVP summary",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Manual trigger endpoint (for testing)
export async function GET() {
  try {
    const supabase = await createClient();
    const currentWeekStart = getCurrentWeekStart();

    const { data: weekRSVPs, count } = await supabase
      .from("wednesday_rsvps")
      .select("*")
      .eq("week_of", currentWeekStart)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      currentWeek: currentWeekStart,
      thisWednesday: getThisWednesdayDate(),
      rsvpCount: count || 0,
      rsvps:
        weekRSVPs?.map((rsvp) => ({
          name: `${rsvp.first_name} ${rsvp.last_name}`,
          phone: rsvp.phone_number,
          timestamp: rsvp.created_at,
        })) || [],
    });
  } catch (error) {
    console.error("Error fetching weekly RSVPs:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
