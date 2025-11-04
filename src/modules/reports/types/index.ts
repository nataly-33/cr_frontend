// Types for Reports Module

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  report_type: ReportType;
  created_by: string;
  created_at: string;
}

export interface ReportExecution {
  id: string;
  template?: string;
  template_name?: string;
  report_type: ReportType;
  output_format: OutputFormat;
  filters?: Record<string, any>;
  file_path?: string;
  file_url?: string;
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string;
  executed_by: string;
  executed_by_name?: string;
  executed_at: string;
  completed_at?: string;
}

export type ReportType = 
  | "documents"
  | "patients"
  | "clinical_records"
  | "analytics"
  | "audit"
  | "users";

export type OutputFormat = "pdf" | "excel" | "csv";

export interface GenerateReportData {
  report_type: ReportType;
  output_format: OutputFormat;
  filters?: ReportFilters;
  title?: string;
  description?: string;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  patient_id?: string;
  document_type?: string;
  status?: string;
  user_id?: string;
  [key: string]: any;
}

export const REPORT_TYPES = {
  documents: "Documentos Clínicos",
  patients: "Pacientes",
  clinical_records: "Historias Clínicas",
  analytics: "Analíticas",
  audit: "Auditoría",
  users: "Usuarios",
} as const;

export const OUTPUT_FORMATS = {
  pdf: "PDF",
  excel: "Excel",
  csv: "CSV",
} as const;

export const REPORT_STATUS = {
  pending: "Pendiente",
  processing: "Procesando",
  completed: "Completado",
  failed: "Fallido",
} as const;

// ====== AI/IA Types ======

export interface AIAnalysisResult {
  id: string;
  report_id: string;
  analysis: string;
  insights: string[];
  key_findings: string[];
  confidence_score: number;
  generated_at: string;
}

export interface AIRecommendation {
  id: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  category: string;
  action_items?: string[];
}

export interface AISummary {
  id: string;
  summary: string;
  key_points: string[];
  length: number;
  generated_at: string;
}

export interface AIInsightsResponse {
  analysis?: AIAnalysisResult;
  summary?: AISummary;
  recommendations?: AIRecommendation[];
  status: "success" | "error" | "pending";
  message?: string;
}
