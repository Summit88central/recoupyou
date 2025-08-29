import emailjs from "@emailjs/browser";

// EmailJS configuration - these will be set via environment variables
// NOTE: NEXT_PUBLIC_EMAILJS_PUBLIC_KEY is INTENTIONALLY exposed to the client
// This is the correct and secure way to use EmailJS - the "public key" is designed
// to be client-accessible and is required for browser-side email sending
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ""; // This is safe to expose - it's a PUBLIC key

// Template IDs for the 2-template approach
const TEMPLATES = {
  UNIFIED: process.env.NEXT_PUBLIC_EMAILJS_UNIFIED_TEMPLATE || "", // For Personal Training, Online Coaching, Wednesday RSVP
  MEMBERSHIP: process.env.NEXT_PUBLIC_EMAILJS_MEMBERSHIP_TEMPLATE || "", // For Gym Membership only
};

console.log("[v0] EmailJS Environment Variables Check:");
console.log("[v0] Service ID:", EMAILJS_SERVICE_ID ? "✓ Set" : "✗ Missing");
console.log("[v0] Public Key:", EMAILJS_PUBLIC_KEY ? "✓ Set" : "✗ Missing");
console.log(
  "[v0] Unified Template:",
  TEMPLATES.UNIFIED ? "✓ Set" : "✗ Missing"
);
console.log(
  "[v0] Membership Template:",
  TEMPLATES.MEMBERSHIP ? "✓ Set" : "✗ Missing"
);

// Initialize EmailJS with public key (this is the standard EmailJS implementation)
if (typeof window !== "undefined") {
  if (!EMAILJS_PUBLIC_KEY) {
    console.error(
      "[v0] EmailJS Error: Public key is missing from environment variables"
    );
  } else {
    console.log("[v0] Initializing EmailJS with public key");
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
}

export const sendPersonalTrainingEmail = async (formData: any) => {
  try {
    // Check if all required environment variables are present
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !TEMPLATES.UNIFIED) {
      throw new Error(
        "Missing EmailJS environment variables. Please check your project settings."
      );
    }

    // Re-initialize EmailJS to ensure it's properly set up
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      to_email: process.env.NEXT_PUBLIC_COACH_EMAIL || "coach@example.com",
      form_type: "personal_training",
      // Personal Training specific fields
      full_name: formData.fullName,
      whatsapp: formData.whatsapp,
      age: formData.age,
      goals: formData.goals,
      package: formData.package,
      additional_info: formData.additionalInfo,
      // Empty fields for other form types
      email: "",
      instagram: "",
      fitness_level: "",
      gym_access: "",
      dietary_restrictions: "",
      start_date: "",
      participant_count: "",
      participant_list: "",
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.UNIFIED,
      templateParams
    );
    return { success: true, response };
  } catch (error) {
    console.error("EmailJS Error:", error);
    return { success: false, error };
  }
};

export const sendOnlineCoachingEmail = async (formData: any) => {
  try {
    // Check if all required environment variables are present
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY || !TEMPLATES.UNIFIED) {
      throw new Error(
        "Missing EmailJS environment variables. Please check your project settings."
      );
    }

    // Re-initialize EmailJS to ensure it's properly set up
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const templateParams = {
      to_email: process.env.NEXT_PUBLIC_COACH_EMAIL || "coach@example.com",
      form_type: "online_coaching",
      // Online Coaching specific fields
      full_name: formData.fullName,
      email: formData.email,
      whatsapp: formData.whatsapp,
      instagram: formData.instagram,
      age: formData.age,
      fitness_level: formData.fitnessLevel,
      goals: formData.goals,
      gym_access: formData.gymAccess,
      dietary_restrictions: formData.dietaryRestrictions,
      package: formData.package,
      start_date: formData.startDate,
      additional_info: formData.additionalInfo,
      // Empty fields for other form types
      participant_count: "",
      participant_list: "",
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.UNIFIED,
      templateParams
    );
    return { success: true, response };
  } catch (error) {
    console.error("EmailJS Error:", error);
    return { success: false, error };
  }
};

export const sendMembershipEmail = async (formData: any) => {
  try {
    console.log("[v0] Attempting to send membership email...");
    console.log("[v0] Service ID:", EMAILJS_SERVICE_ID ? "✓ Set" : "✗ Missing");
    console.log("[v0] Public Key:", EMAILJS_PUBLIC_KEY ? "✓ Set" : "✗ Missing");
    console.log(
      "[v0] Template ID:",
      TEMPLATES.MEMBERSHIP ? "✓ Set" : "✗ Missing"
    );

    // Check if all required environment variables are present
    if (!EMAILJS_SERVICE_ID) {
      throw new Error(
        "NEXT_PUBLIC_EMAILJS_SERVICE_ID is not set in environment variables"
      );
    }
    if (!EMAILJS_PUBLIC_KEY) {
      throw new Error(
        "NEXT_PUBLIC_EMAILJS_PUBLIC_KEY is not set in environment variables"
      );
    }
    if (!TEMPLATES.MEMBERSHIP) {
      throw new Error(
        "NEXT_PUBLIC_EMAILJS_MEMBERSHIP_TEMPLATE is not set in environment variables"
      );
    }

    // Re-initialize EmailJS to ensure it's properly set up
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const coachEmail =
      process.env.NEXT_PUBLIC_COACH_EMAIL || "recoupyou@gmail.com";

    // DEBUG: Log the actual email being used
    console.log("[v0] DEBUG: Coach email being used:", coachEmail);
    console.log(
      "[v0] DEBUG: Environment COACH_EMAIL:",
      process.env.NEXT_PUBLIC_COACH_EMAIL
    );

    const templateParams = {
      // Recipient email - matching template expectations
      to_email: coachEmail,

      // Form data - MUST match the template variables exactly
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
      emergencyContactName: formData.emergencyName,
      emergencyContactPhone: formData.emergencyPhone,
      emergencyContactRelationship: formData.emergencyRelationship,
      medicalConditions: formData.medicalConditions,
      medications: formData.medications || "None specified",
      injuries: formData.injuries || "None specified",
      fitnessGoals: formData.goals || "Not specified",
      membershipType: formData.membershipPlan,
      additionalServices: formData.additionalServices?.join(", ") || "None",
    };

    console.log("[v0] Sending email with params:", templateParams);
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.MEMBERSHIP,
      templateParams
    );
    console.log("[v0] Email sent successfully:", response);
    return { success: true, response };
  } catch (error) {
    console.error("[v0] EmailJS Error:", error);
    return { success: false, error };
  }
};
