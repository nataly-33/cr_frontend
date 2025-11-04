/**
 * Tipos para Formularios Clínicos
 * Incluye: Triaje, Consultas, Recetas, Órdenes de laboratorio, etc.
 */

// Tipos de formularios disponibles
export type FormType =
  | 'triage'
  | 'consultation'
  | 'evolution'
  | 'prescription'
  | 'lab_order'
  | 'imaging_order'
  | 'procedure'
  | 'discharge'
  | 'referral'
  | 'other';

// Interface principal del formulario clínico
export interface ClinicalForm {
  id: string;
  clinical_record: string;
  record_number: string;
  patient_name: string;
  form_type: FormType;
  form_type_display: string;
  form_template_id?: string;
  form_data: Record<string, any>;
  filled_by: string;
  filled_by_name: string;
  doctor_name: string;
  doctor_specialty: string;
  form_date: string;
  created_at: string;
  updated_at: string;
}

// Datos para crear/editar formulario
export interface ClinicalFormFormData {
  clinical_record: string;
  form_type: FormType;
  form_template_id?: string;
  form_data: Record<string, any>;
  filled_by?: string;
  doctor_name?: string;
  doctor_specialty?: string;
  form_date: string;
}

// Tipo de formulario con label
export interface FormTypeOption {
  value: FormType;
  label: string;
}

// Datos específicos de Triaje
export interface TriageFormData {
  vital_signs: {
    temperature: number;
    blood_pressure_systolic: number;
    blood_pressure_diastolic: number;
    heart_rate: number;
    respiratory_rate: number;
    oxygen_saturation: number;
    weight: number;
    height: number;
  };
  chief_complaint: string;
  initial_assessment: string;
  triage_level: {
    level: number;
    name: string;
    color: string;
  };
}

// Datos específicos de Consulta Médica
export interface ConsultationFormData {
  subjective: {
    chief_complaint: string;
    history_present_illness: string;
    review_of_systems: Record<string, string>;
  };
  objective: {
    physical_exam: Record<string, string>;
  };
  assessment: {
    diagnoses: Array<{
      code: string;
      description: string;
      type: 'principal' | 'secundario';
    }>;
    differential_diagnosis?: string;
  };
  plan: {
    medications: Array<{
      name: string;
      dose: string;
      frequency: string;
      duration: string;
    }>;
    lab_orders: string[];
    follow_up: string;
  };
}

// Datos específicos de Receta Médica
export interface PrescriptionFormData {
  medications: Array<{
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
    quantity: number;
  }>;
  diagnosis: string;
  notes?: string;
}

// Datos específicos de Orden de Laboratorio
export interface LabOrderFormData {
  tests: string[];
  diagnosis: string;
  urgency: 'routine' | 'urgent' | 'stat';
  fasting_required: boolean;
  notes?: string;
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Parámetros de consulta
export interface ClinicalFormQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  form_type?: FormType;
  clinical_record?: string;
  filled_by?: string;
}
