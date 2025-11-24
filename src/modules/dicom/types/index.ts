/**
 * Tipos para el módulo DICOM
 */

// Enums
export type Modality = 'CT' | 'MRI' | 'CR' | 'US' | 'DX' | 'MG' | 'NM' | 'PT' | 'XA' | 'RF' | 'OT';

export type PatientMatchingStrategy =
  | 'REQUIRE_EXISTING'
  | 'MATCH_OR_FAIL'
  | 'MATCH_OR_CREATE'
  | 'ALWAYS_USE_PROVIDED';

// Entidades base
export interface DicomStudy {
  id: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    document_number: string;
  } | null;
  study_instance_uid: string;
  study_date: string | null;
  study_time: string | null;
  study_description: string;
  accession_number: string;
  referring_physician_name: string;
  modality: Modality;
  institution_name: string;
  body_part_examined: string;
  has_contrast: boolean;
  contrast_agent: string;
  series_count: number;
  instances_count: number;
  created_at: string;
  updated_at: string;
}

export interface DicomSeries {
  id: string;
  study_id: string;
  series_instance_uid: string;
  series_number: number | null;
  series_description: string;
  modality: Modality;
  body_part_examined: string;
  patient_position: string;
  protocol_name: string;
  has_contrast: boolean;
  contrast_agent: string;
  slice_thickness: number | null;
  spacing_between_slices: number | null;
  instances_count: number;
  created_at: string;
}

export interface DicomInstance {
  id: string;
  series_id: string;
  sop_instance_uid: string;
  sop_class_uid: string;
  instance_number: number | null;
  slice_location: number | null;
  image_position: [number, number, number] | null;
  image_orientation: [number, number, number, number, number, number] | null;
  rows: number;
  columns: number;
  bits_allocated: number;
  bits_stored: number;
  pixel_spacing: [number, number] | null;
  window_center: number | null;
  window_width: number | null;
  rescale_intercept: number;
  rescale_slope: number;
  photometric_interpretation: string;
  file_size: number;
  stream_url: string;
}

// Configuración del visor (respuesta del backend)
export interface SeriesViewerConfig {
  series_id: string;
  series_uid: string;
  modality: Modality;
  description: string;
  instances_count: number;
  image_ids: string[];
  dicom_urls: string[];
  volume_config: {
    spacing: [number, number, number];
    dimensions: [number, number, number];
    origin: [number, number, number];
    direction: number[];
    is_volumetric: boolean;
  };
  window_presets: Array<{
    name: string;
    window_width: number;
    window_center: number;
  }>;
  default_window: {
    window_width: number;
    window_center: number;
  };
  tools_config: {
    available_tools: string[];
    default_tool: string;
  };
}

export interface StudyViewerConfig {
  study_id: string;
  study_uid: string;
  study_date: string | null;
  study_description: string;
  patient: {
    id: string;
    name: string;
    document_number: string;
  } | null;
  modality: Modality;
  series: SeriesViewerConfig[];
  total_instances: number;
}

// DTOs para requests
export interface DicomIngestRequest {
  files: File[];
  patient_id?: string;
  clinical_record_id?: string;
  matching_strategy?: PatientMatchingStrategy;
}

export interface DicomUploadZipRequest {
  file: File;
  patient_id?: string;
  clinical_record_id?: string;
  matching_strategy?: PatientMatchingStrategy;
}

// DTOs para responses
export interface DicomIngestResponse {
  message: string;
  study_id: string;
  study_instance_uid: string;
  series_created: number;
  instances_created: number;
  patient_matched: boolean;
  patient_id: string | null;
}

export interface DicomStudyListParams {
  page?: number;
  page_size?: number;
  patient_id?: string;
  modality?: Modality;
  study_date_from?: string;
  study_date_to?: string;
  search?: string;
  ordering?: string;
}

export interface DicomSeriesListParams {
  page?: number;
  page_size?: number;
  study_id?: string;
}

// Preload hints
export interface PreloadHints {
  series_id: string;
  total_instances: number;
  estimated_size_mb: number;
  recommended_batch_size: number;
  priority_instances: string[];
  preload_strategy: 'sequential' | 'center_out' | 'random';
}

// Access log
export interface DicomAccessLog {
  id: string;
  user_email: string;
  user_name: string;
  action: string;
  ip_address: string;
  accessed_at: string;
  details: Record<string, unknown>;
}

// Estado del visor
export interface ViewerState {
  currentStudyId: string | null;
  currentSeriesIndex: number;
  currentInstanceIndex: number;
  zoom: number;
  pan: { x: number; y: number };
  rotation: number;
  windowWidth: number;
  windowCenter: number;
  activeTool: string;
  isLoading: boolean;
  error: string | null;
}

// Herramientas disponibles
export type ViewerTool =
  | 'Pan'
  | 'Zoom'
  | 'WindowLevel'
  | 'Length'
  | 'Angle'
  | 'Rectangle'
  | 'Ellipse'
  | 'Crosshairs'
  | 'StackScroll';
