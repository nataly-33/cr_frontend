export interface Patient {
  id: string;
  identity_document: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth: string;
  gender: "M" | "F";
  phone: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  blood_type?: string;
  allergies?: string;
  chronic_conditions?: string;
  created_at: string;
  updated_at?: string;
}
