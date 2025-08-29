import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/server"

function getCurrentWeekStart(): string {
  // Get current date in South African timezone (UTC+2)
  const now = new Date()
  const saTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // Add 2 hours for SAST

  // Get Monday of current week
  const dayOfWeek = saTime.getDay()
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(saTime)
  monday.setDate(saTime.getDate() + daysToMonday)
  monday.setHours(0, 0, 0, 0)

  return monday.toISOString().split("T")[0] // Return YYYY-MM-DD format
}

function isRSVPOpen(): boolean {
  const now = new Date()
  const saTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // Convert to SAST

  const dayOfWeek = saTime.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = saTime.getHours()
  const minute = saTime.getMinutes()

  // If it's Wednesday (3) or later, RSVPs are closed for this week
  if (dayOfWeek >= 3) {
    return false
  }

  // If it's Tuesday (2) after 8:30 PM, RSVPs are closed
  if (dayOfWeek === 2 && (hour > 20 || (hour === 20 && minute >= 30))) {
    return false
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    // Check if RSVP is still open
    if (!isRSVPOpen()) {
      return NextResponse.json(
        { message: "RSVP deadline has passed. RSVPs close every Tuesday at 8:30 PM (South African time)." },
        { status: 400 },
      )
    }

    const { firstName, lastName } = await request.json()

    if (!firstName || !lastName) {
      return NextResponse.json({ message: "First name and last name are required." }, { status: 400 })
    }

    const supabase = await createClient()
    const currentWeekStart = getCurrentWeekStart()

    // Check if person already RSVPed for this week
    const { data: existingRSVP } = await supabase
      .from("wednesday_rsvps")
      .select("id")
      .eq("week_of", currentWeekStart)
      .ilike("first_name", firstName.trim())
      .ilike("last_name", lastName.trim())
      .single()

    if (existingRSVP) {
      return NextResponse.json({ message: "You have already RSVPed for this week's class." }, { status: 400 })
    }

    // Check capacity (limit to 15 people per week)
    const { count } = await supabase
      .from("wednesday_rsvps")
      .select("*", { count: "exact", head: true })
      .eq("week_of", currentWeekStart)

    if (count && count >= 15) {
      return NextResponse.json({ message: "This week's class is full. Please try again next week." }, { status: 400 })
    }

    // Add new RSVP
    const { data: newRSVP, error } = await supabase
      .from("wednesday_rsvps")
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        week_of: currentWeekStart,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ message: "Failed to save RSVP. Please try again." }, { status: 500 })
    }

    return NextResponse.json({
      message: "RSVP confirmed successfully!",
      rsvp: newRSVP,
    })
  } catch (error) {
    console.error("RSVP submission error:", error)
    return NextResponse.json({ message: "Internal server error. Please try again." }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const currentWeekStart = getCurrentWeekStart()

    const { data: weekRSVPs, count } = await supabase
      .from("wednesday_rsvps")
      .select("*", { count: "exact" })
      .eq("week_of", currentWeekStart)
      .order("created_at", { ascending: true })

    return NextResponse.json({
      currentWeek: currentWeekStart,
      rsvpCount: count || 0,
      isOpen: isRSVPOpen(),
      rsvps: weekRSVPs || [],
    })
  } catch (error) {
    console.error("Error fetching RSVPs:", error)
    return NextResponse.json({ message: "Internal server error." }, { status: 500 })
  }
}
