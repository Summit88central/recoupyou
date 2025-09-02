import emailjs from "@emailjs/browser";

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";

const TEMPLATES = {
  UNIFIED: process.env.NEXT_PUBLIC_EMAILJS_UNIFIED_TEMPLATE || "",
  MEMBERSHIP: process.env.NEXT_PUBLIC_EMAILJS_MEMBERSHIP_TEMPLATE || "",
};

// Initialize EmailJS
if (typeof window !== "undefined" && EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// Simplified helper to define all variables for the UNIFIED template
const createUnifiedTemplateParams = () => ({
  // Conditional flags (as strings: "true" for truthy, "" for falsy)
  is_online_coaching: "",
  is_personal_training: "",

  // All possible fields from the remaining blocks
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
});

export const sendPersonalTrainingEmail = async (formData: any) => {
  try {
    if (!EMAILJS_SERVICE_ID || !TEMPLATES.UNIFIED) {
      throw new Error(
        "Missing EmailJS environment variables for UNIFIED template."
      );
    }

    const templateParams = {
      ...createUnifiedTemplateParams(),
      to_email: String(
        process.env.NEXT_PUBLIC_COACH_EMAIL || "coach@example.com"
      ),

      // Set the flag to "true" for this form (string value)
      is_personal_training: "true",

      // Populate data for this form, ensuring strings
      full_name: String(formData.fullName || ""),
      whatsapp: String(formData.whatsapp || ""),
      age: String(formData.age || ""),
      goals: String(formData.goals || ""),
      package: String(formData.package || ""),
      additional_info: String(formData.additionalInfo || ""),
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.UNIFIED,
      templateParams
    );
    return { success: true, response };
  } catch (error) {
    console.error("Personal Training EmailJS Error:", error);
    return { success: false, error };
  }
};

export const sendOnlineCoachingEmail = async (formData: any) => {
  try {
    if (!EMAILJS_SERVICE_ID || !TEMPLATES.UNIFIED) {
      throw new Error(
        "Missing EmailJS environment variables for UNIFIED template."
      );
    }

    const templateParams = {
      ...createUnifiedTemplateParams(),
      to_email: String(
        process.env.NEXT_PUBLIC_COACH_EMAIL || "coach@example.com"
      ),

      // Set the flag to "true" for this form (string value)
      is_online_coaching: "true",

      // Populate data for this form, ensuring strings
      full_name: String(formData.fullName || ""),
      email: String(formData.email || ""),
      whatsapp: String(formData.whatsapp || ""),
      instagram: String(formData.instagram || ""),
      age: String(formData.age || ""),
      fitness_level: String(formData.fitnessLevel || ""),
      goals: String(formData.goals || ""),
      gym_access: String(formData.gymAccess || ""),
      dietary_restrictions: String(formData.dietaryRestrictions || ""),
      package: String(formData.package || ""),
      start_date: String(formData.startDate || ""),
      additional_info: String(formData.additionalInfo || ""),
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.UNIFIED,
      templateParams
    );
    return { success: true, response };
  } catch (error) {
    console.error("Online Coaching EmailJS Error:", error);
    return { success: false, error };
  }
};

// The membership function remains unchanged, but apply similar string conversions if numeric or boolean fields are added in the future.
export const sendMembershipEmail = async (formData: any) => {
  try {
    if (!EMAILJS_SERVICE_ID || !TEMPLATES.MEMBERSHIP) {
      throw new Error(
        "Missing EmailJS environment variables for MEMBERSHIP template."
      );
    }

    const templateParams = {
      to_email: String(
        process.env.NEXT_PUBLIC_COACH_EMAIL || "recoupyou@gmail.com"
      ),
      fullName: String(formData.fullName || ""),
      email: String(formData.email || ""),
      phone: String(formData.phone || ""), // Aligned to match {{phone}}
      dateOfBirth: String(formData.dateOfBirth || ""),
      address: String(formData.address || ""),
      emergencyName: String(formData.emergencyName || ""), // Aligned to match {{emergencyName}}
      emergencyPhone: String(formData.emergencyPhone || ""), // Aligned to match {{emergencyPhone}}
      emergencyRelationship: String(formData.emergencyRelationship || ""), // Aligned to match {{emergencyRelationship}}
      medicalConditions: String(formData.medicalConditions || "Not specified"),
      medications: String(formData.medications || "None specified"), // Retained; add to template if needed
      injuries: String(formData.injuries || "None specified"), // Retained; add to template if needed
      fitnessGoals: String(formData.goals || "Not specified"), // Retained; add to template if needed
      membershipPlan: String(formData.membershipPlan || ""), // Aligned to match {{membershipPlan}}
      additionalServices: String(
        formData.additionalServices?.join(", ") || "None"
      ),
      startDate: String(formData.startDate || ""), // Added to match {{startDate}}
      hearAbout: String(formData.hearAbout || ""), // Added to match {{hearAbout}}
    };

    console.log("Sending membership email with params:", templateParams);
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.MEMBERSHIP,
      templateParams
    );
    console.log("Membership email sent successfully:", response);
    return { success: true, response };
  } catch (error) {
    console.error("Membership EmailJS Error:", error);
    return { success: false, error };
  }
};
