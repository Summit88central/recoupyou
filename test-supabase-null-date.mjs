import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase
    .from("membership_applications")
    .insert({
      full_name: "Test User",
      date_of_birth: "2000-01-01",
      address: "123 Test St",
      phone: "1234567890",
      email: "test@example.com",
      emergency_name: "Emergency Contact",
      emergency_phone: "0987654321",
      emergency_relationship: "Friend",
      medical_conditions: "None",
      membership_plan: "Month to Month - R500",
      additional_services: [],
      start_date: null,
      hear_about: "Online Search",
    });

  if (error) {
    console.error("Error inserting null date:", error);
  } else {
    console.log("Success with null date:", data);
  }
}

test();
