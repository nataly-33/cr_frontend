import { apiService } from "@shared/services/api.service";
import { API_CONFIG, ENDPOINTS } from "@core/config/api.config";
import type {
  DicomStudy,
  DicomSeries,
  DicomInstance,
  StudyViewerConfig,
  SeriesViewerConfig,
  DicomIngestResponse,
  DicomStudyListParams,
  DicomSeriesListParams,
  PreloadHints,
  DicomAccessLog,
  PatientMatchingStrategy,
} from "../types";
import type { PaginatedResponse } from "@core/types";

export const dicomService = {
  // ==================== STUDIES ====================

  /**
   * Lista estudios DICOM con paginación y filtros
   */
  getStudies: async (
    params?: DicomStudyListParams
  ): Promise<PaginatedResponse<DicomStudy>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.patient_id) queryParams.append("patient_id", params.patient_id);
    if (params?.modality) queryParams.append("modality", params.modality);
    if (params?.study_date_from)
      queryParams.append("study_date_from", params.study_date_from);
    if (params?.study_date_to)
      queryParams.append("study_date_to", params.study_date_to);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.ordering) queryParams.append("ordering", params.ordering);

    const url = queryParams.toString()
      ? `${ENDPOINTS.DICOM.STUDIES.LIST}?${queryParams.toString()}`
      : ENDPOINTS.DICOM.STUDIES.LIST;

    const response = await apiService.get<PaginatedResponse<DicomStudy>>(url);
    return response.data;
  },

  /**
   * Obtiene un estudio por ID
   */
  getStudy: async (id: string): Promise<DicomStudy> => {
    const response = await apiService.get<DicomStudy>(
      ENDPOINTS.DICOM.STUDIES.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Obtiene estudios de un paciente específico
   */
  getPatientStudies: async (patientId: string): Promise<DicomStudy[]> => {
    const response = await apiService.get<DicomStudy[]>(
      ENDPOINTS.DICOM.PATIENT_STUDIES(patientId)
    );
    return response.data;
  },

  /**
   * Sube archivos DICOM (ingestión)
   */
  ingestFiles: async (
    files: File[],
    options?: {
      patient_id?: string;
      clinical_record_id?: string;
      matching_strategy?: PatientMatchingStrategy;
    }
  ): Promise<DicomIngestResponse> => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    if (options?.patient_id) {
      formData.append("patient_id", options.patient_id);
    }
    if (options?.clinical_record_id) {
      formData.append("clinical_record_id", options.clinical_record_id);
    }
    if (options?.matching_strategy) {
      formData.append("matching_strategy", options.matching_strategy);
    }

    const response = await apiService.post<DicomIngestResponse>(
      ENDPOINTS.DICOM.STUDIES.INGEST,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 minutos para archivos grandes
      }
    );
    return response.data;
  },

  /**
   * Sube un archivo DICOM temporal (sin BD) para visualización rápida
   */
  tempUpload: async (file: File): Promise<{ stream_url: string; metadata: any }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiService.post<{ stream_url: string; metadata: any }>(
      "/dicom/temp/upload/",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  /**
   * Sube un archivo ZIP con DICOM
   */
  uploadZip: async (
    file: File,
    options?: {
      patient_id?: string;
      clinical_record_id?: string;
      matching_strategy?: PatientMatchingStrategy;
    }
  ): Promise<DicomIngestResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    if (options?.patient_id) {
      formData.append("patient_id", options.patient_id);
    }
    if (options?.clinical_record_id) {
      formData.append("clinical_record_id", options.clinical_record_id);
    }
    if (options?.matching_strategy) {
      formData.append("matching_strategy", options.matching_strategy);
    }

    const response = await apiService.post<DicomIngestResponse>(
      ENDPOINTS.DICOM.STUDIES.UPLOAD_ZIP,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 600000, // 10 minutos para ZIP grandes
      }
    );
    return response.data;
  },

  /**
   * Elimina un estudio
   */
  deleteStudy: async (id: string): Promise<void> => {
    await apiService.delete(ENDPOINTS.DICOM.STUDIES.DETAIL(id));
  },

  /**
   * Obtiene configuración del visor para un estudio completo
   */
  getStudyViewerConfig: async (id: string): Promise<StudyViewerConfig> => {
    const response = await apiService.get<StudyViewerConfig>(
      ENDPOINTS.DICOM.STUDIES.VIEWER_CONFIG(id)
    );
    return response.data;
  },

  /**
   * Obtiene metadata del estudio para el visor
   */
  getStudyMetadata: async (id: string): Promise<Record<string, unknown>> => {
    const response = await apiService.get<Record<string, unknown>>(
      ENDPOINTS.DICOM.STUDIES.METADATA(id)
    );
    return response.data;
  },

  /**
   * Obtiene log de accesos de un estudio
   */
  getStudyAccessLog: async (id: string): Promise<DicomAccessLog[]> => {
    const response = await apiService.get<DicomAccessLog[]>(
      ENDPOINTS.DICOM.STUDIES.ACCESS_LOG(id)
    );
    return response.data;
  },

  // ==================== SERIES ====================

  /**
   * Lista series con filtros
   */
  getSeries: async (
    params?: DicomSeriesListParams
  ): Promise<PaginatedResponse<DicomSeries>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.study_id) queryParams.append("study_id", params.study_id);

    const url = queryParams.toString()
      ? `${ENDPOINTS.DICOM.SERIES.LIST}?${queryParams.toString()}`
      : ENDPOINTS.DICOM.SERIES.LIST;

    const response = await apiService.get<PaginatedResponse<DicomSeries>>(url);
    return response.data;
  },

  /**
   * Obtiene una serie por ID
   */
  getSeriesById: async (id: string): Promise<DicomSeries> => {
    const response = await apiService.get<DicomSeries>(
      ENDPOINTS.DICOM.SERIES.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Obtiene configuración del visor para una serie
   */
  getSeriesViewerConfig: async (id: string): Promise<SeriesViewerConfig> => {
    const response = await apiService.get<SeriesViewerConfig>(
      ENDPOINTS.DICOM.SERIES.VIEWER_CONFIG(id)
    );
    return response.data;
  },

  /**
   * Obtiene ImageIds para Cornerstone3D
   */
  getSeriesImageIds: async (id: string): Promise<{ image_ids: string[] }> => {
    const response = await apiService.get<{ image_ids: string[] }>(
      ENDPOINTS.DICOM.SERIES.IMAGE_IDS(id)
    );
    return response.data;
  },

  /**
   * Obtiene hints de precarga para una serie
   */
  getSeriesPreloadHints: async (id: string): Promise<PreloadHints> => {
    const response = await apiService.get<PreloadHints>(
      ENDPOINTS.DICOM.SERIES.PRELOAD_HINTS(id)
    );
    return response.data;
  },

  /**
   * Obtiene instancias de una serie
   */
  getSeriesInstances: async (id: string): Promise<DicomInstance[]> => {
    const response = await apiService.get<DicomInstance[]>(
      ENDPOINTS.DICOM.SERIES.INSTANCES(id)
    );
    return response.data;
  },

  // ==================== INSTANCES ====================

  /**
   * Obtiene una instancia por ID
   */
  getInstance: async (id: string): Promise<DicomInstance> => {
    const response = await apiService.get<DicomInstance>(
      ENDPOINTS.DICOM.INSTANCES.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Obtiene metadata de una instancia
   */
  getInstanceMetadata: async (id: string): Promise<Record<string, unknown>> => {
    const response = await apiService.get<Record<string, unknown>>(
      ENDPOINTS.DICOM.INSTANCES.METADATA(id)
    );
    return response.data;
  },

  /**
   * Genera URL de streaming para una instancia
   * Incluye token de autenticación
   */
  getInstanceStreamUrl: (id: string): string => {
    const token = localStorage.getItem("access_token");
    const baseUrl = API_CONFIG.BASE_URL;
    return `${baseUrl}${ENDPOINTS.DICOM.INSTANCES.STREAM(id)}?token=${token}`;
  },

  /**
   * Genera imageId para Cornerstone3D (wadouri)
   */
  getImageId: (instanceId: string): string => {
    const streamUrl = dicomService.getInstanceStreamUrl(instanceId);
    return `wadouri:${streamUrl}`;
  },
};
