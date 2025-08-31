import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/server";

function getCurrentWeekStart(): string {
  const now = new Date();
  const saTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours for SAST

  const dayOfWeek = saTime.getDay();
  const hour = saTime.getHours();
  const minute = saTime.getMinutes();

  let targetMonday: Date;

  // If it's Tuesday after 8:30 PM or Wednesday onwards,
  // RSVPs are for NEXT week's Wednesday
  if (
    (dayOfWeek === 2 && (hour > 20 || (hour === 20 && minute >= 30))) || // Tuesday after 8:30 PM
    dayOfWeek >= 3 // Wednesday onwards
  ) {
    // Get Monday of NEXT week
    const daysToNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    targetMonday = new Date(saTime);
    targetMonday.setDate(saTime.getDate() + daysToNextMonday);
  } else {
    // Monday, Tuesday before 8:30 PM - RSVPs for THIS week
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    targetMonday = new Date(saTime);
    targetMonday.setDate(saTime.getDate() + daysToMonday);
  }

  targetMonday.setHours(0, 0, 0, 0);
  return targetMonday.toISOString().split("T")[0]; // Return YYYY-MM-DD format
}

function isRSVPOpen(): boolean {
  const now = new Date();
  const saTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Convert to SAST

  const dayOfWeek = saTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = saTime.getHours();
  const minute = saTime.getMinutes();

  // RSVPs are ONLY closed on Tuesday after 8:30 PM
  if (dayOfWeek === 2 && (hour > 20 || (hour === 20 && minute >= 30))) {
    return false;
  }

  // RSVPs are open all other times (Monday, Tuesday before 8:30 PM, Wednesday-Sunday)
  return true;
}

function getNextWednesdayDate(): string {
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
    // Check if RSVP is still open
    if (!isRSVPOpen()) {
      return NextResponse.json(
        {
          message:
            "RSVP deadline has passed. RSVPs close every Tuesday at 8:30 PM (South African time).",
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, phoneNumber } = await request.json();

    if (!firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { message: "First name, last name, and phone number are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const currentWeekStart = getCurrentWeekStart();

    // Check if person already RSVPed for this week
    const { data: existingRSVP } = await supabase
      .from("wednesday_rsvps")
      .select("id")
      .eq("week_of", currentWeekStart)
      .ilike("first_name", firstName.trim())
      .ilike("last_name", lastName.trim())
      .single();

    if (existingRSVP) {
      return NextResponse.json(
        { message: "You have already RSVPed for this week's class." },
        { status: 400 }
      );
    }

    // No capacity limit - Coach Dee will manage class size

    // Add new RSVP to database (NO EMAIL SENT HERE)
    const { data: newRSVP, error } = await supabase
      .from("wednesday_rsvps")
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phoneNumber.trim(),
        week_of: currentWeekStart,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { message: "Failed to save RSVP. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "RSVP confirmed successfully!",
      rsvp: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        weekOf: getNextWednesdayDate(),
        submittedAt: new Date().toLocaleString("en-ZA", {
          timeZone: "Africa/Johannesburg",
        }),
      },
    });
  } catch (error) {
    console.error("RSVP submission error:", error);
    return NextResponse.json(
      { message: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

// Get current week's RSVPs (for admin dashboard or testing)
export async function GET() {
  try {
    const supabase = await createClient();
    const currentWeekStart = getCurrentWeekStart();

    const { data: weekRSVPs, count } = await supabase
      .from("wednesday_rsvps")
      .select("*", { count: "exact" })
      .eq("week_of", currentWeekStart)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      currentWeek: currentWeekStart,
      nextWednesday: getNextWednesdayDate(),
      rsvpCount: count || 0,
      isOpen: isRSVPOpen(),
      rsvps:
        weekRSVPs?.map((rsvp) => ({
          name: `${rsvp.first_name} ${rsvp.last_name}`,
          phone: rsvp.phone_number,
          timestamp: rsvp.created_at,
        })) || [],
    });
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
