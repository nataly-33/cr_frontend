import type { Patient } from "@modules/patients/types";

export type ClinicalRecordStatus = "active" | "archived" | "closed";

export interface Allergy {
  allergen: string;
  severity: string;
  reaction: string;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
}

export interface ClinicalRecord {
  id: string;
  patient: string;
  patient_info?: Patient;
  record_number: string;
  status: ClinicalRecordStatus;
  blood_type?: string;
  allergies: Allergy[];
  chronic_conditions: string[];
  medications: Medication[];
  family_history?: string;
  social_history?: string;
  documents_count: number;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
}

export interface ClinicalRecordFormData {
  patient: string;
  blood_type?: string;
  allergies: Allergy[];
  chronic_conditions: string[];
  medications: Medication[];
  family_history?: string;
  social_history?: string;
}

export interface TimelineEvent {
  type: "document";
  date: string;
  title: string;
  document_type: string;
  specialty?: string;
  doctor_name?: string;
  id: string;
}
