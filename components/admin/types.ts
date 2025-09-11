// All TypeScript interfaces for the dashboard data

export interface RSVP {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  week_of: string;
  created_at: string;
}

export interface OnlineCoaching {
  id: number;
  full_name: string;
  email: string;
  whatsapp: string;
  instagram: string;
  age: string;
  fitness_level: string;
  goals: string;
  gym_access: string;
  package: string;
  created_at: string;
  // ✨ New fields
  dietary_restrictions: string;
  start_date: string | null;
  additional_info: string | null;
}

export interface Membership {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  membership_plan: string;
  additional_services: string[];
  start_date: string | null;
  created_at: string;
  // ✨ New fields
  address: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relationship: string;
  medical_conditions: string | null;
  hear_about: string;
}

export interface PersonalTraining {
  id: number;
  full_name: string;
  whatsapp: string;
  age: string;
  goals: string;
  package: string;
  created_at: string;
  // ✨ New field
  additional_info: string | null;
}

// A union type to represent any of the possible items for the details dialog
export type DashboardItem =
  | RSVP
  | OnlineCoaching
  | Membership
  | PersonalTraining;
