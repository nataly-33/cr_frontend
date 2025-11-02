// Types for Documents Module

export interface ClinicalDocument {
  id: string;
  clinical_record: string;
  clinical_record_number?: string;
  patient_name?: string;
  document_type: string;
  document_type_display?: string;
  title: string;
  description?: string;
  file: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  version: number;
  status: "draft" | "final" | "archived";
  is_signed: boolean;
  signed_by?: string;
  signed_by_name?: string;
  signed_at?: string;
  signature?: string;
  extracted_text?: string;
  ocr_confidence?: number;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicalDocumentFormData {
  clinical_record: string;
  document_type: string;
  title: string;
  description?: string;
  file?: File;
  status?: "draft" | "final" | "archived";
}

export interface DocumentUploadResponse {
  id: string;
  file_url: string;
  message: string;
}

export interface DocumentAccessLog {
  id: string;
  document: string;
  user: string;
  user_name?: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  accessed_at: string;
}

export const DOCUMENT_TYPES = {
  consultation: "Consulta M\u00e9dica",
  lab_result: "Resultado de Laboratorio",
  imaging: "Estudio de Imagen",
  prescription: "Receta M\u00e9dica",
  surgery: "Informe Quir\u00fargico",
  discharge: "Alta M\u00e9dica",
  consent: "Consentimiento Informado",
  referral: "Referencia",
  other: "Otro",
} as const;

export const DOCUMENT_STATUS = {
  draft: "Borrador",
  final: "Final",
  archived: "Archivado",
} as const;

export type DocumentType = keyof typeof DOCUMENT_TYPES;
export type DocumentStatus = keyof typeof DOCUMENT_STATUS;
