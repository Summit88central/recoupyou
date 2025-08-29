import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"
import emailjs from "@emailjs/nodejs"

function getCurrentWeekStart(): string {
  const now = new Date()
  const saTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // Add 2 hours for SAST

  const dayOfWeek = saTime.getDay()
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(saTime)
  monday.setDate(saTime.getDate() + daysToMonday)
  monday.setHours(0, 0, 0, 0)

  return monday.toISOString().split("T")[0]
}

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const currentWeekStart = getCurrentWeekStart()

    const { data: weekRSVPs } = await supabase
      .from("wednesday_rsvps")
      .select("*")
      .eq("week_of", currentWeekStart)
      .order("created_at", { ascending: true })

    if (!weekRSVPs || weekRSVPs.length === 0) {
      return NextResponse.json({
        message: "No RSVPs for this week",
        week: currentWeekStart,
      })
    }

    // Prepare email content
    const rsvpList = weekRSVPs.map((rsvp, index) => `${index + 1}. ${rsvp.first_name} ${rsvp.last_name}`).join("\n")

    const emailData = {
      to_email: process.env.NEXT_PUBLIC_COACH_EMAIL,
      form_type: "wednesday_rsvp",
      // Wednesday RSVP specific fields
      subject: `Wednesday Class RSVPs - Week of ${currentWeekStart}`,
      week: currentWeekStart,
      participant_count: weekRSVPs.length.toString(),
      participant_list: rsvpList,
      // Empty fields for other form types
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
    }

    // Send email using EmailJS with unified template
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_UNIFIED_TEMPLATE!,
      emailData,
      {
        privateKey: process.env.EMAILJS_PRIVATE_KEY!,
      },
    )

    await supabase.from("wednesday_rsvps").delete().eq("week_of", currentWeekStart)

    return NextResponse.json({
      message: "Weekly RSVP email sent successfully",
      week: currentWeekStart,
      participantCount: weekRSVPs.length,
      emailSent: true,
    })
  } catch (error) {
    console.error("Error sending weekly RSVP email:", error)
    return NextResponse.json(
      {
        message: "Failed to send weekly RSVP email",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Manual trigger endpoint (for testing)
export async function GET() {
  try {
    const supabase = await createClient()
    const currentWeekStart = getCurrentWeekStart()

    const { data: weekRSVPs } = await supabase
      .from("wednesday_rsvps")
      .select("*")
      .eq("week_of", currentWeekStart)
      .order("created_at", { ascending: true })

    return NextResponse.json({
      currentWeek: currentWeekStart,
      rsvpCount: weekRSVPs?.length || 0,
      rsvps:
        weekRSVPs?.map((rsvp) => ({
          name: `${rsvp.first_name} ${rsvp.last_name}`,
          timestamp: rsvp.created_at,
        })) || [],
    })
  } catch (error) {
    console.error("Error fetching weekly RSVPs:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}
