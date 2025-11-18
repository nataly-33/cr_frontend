import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";
import type {
  ClinicalDocument,
  ClinicalDocumentFormData,
  DocumentUploadResponse,
  DocumentAccessLog,
} from "../types";
import type { PaginatedResponse } from "@core/types";

interface GetDocumentsParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  clinical_record?: string;
  document_type?: string;
  status?: string;
  is_signed?: boolean;
}

export const documentsService = {
  /**
   * Get all documents with pagination and filters
   */
  getAll: async (
    params?: GetDocumentsParams
  ): Promise<PaginatedResponse<ClinicalDocument>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.ordering) queryParams.append("ordering", params.ordering);
    if (params?.clinical_record)
      queryParams.append("clinical_record", params.clinical_record);
    if (params?.document_type)
      queryParams.append("document_type", params.document_type);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.is_signed !== undefined)
      queryParams.append("is_signed", params.is_signed.toString());

    const response = await apiService.get<PaginatedResponse<ClinicalDocument>>(
      `${ENDPOINTS.DOCUMENTS.LIST}?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get document by ID
   */
  getById: async (id: string): Promise<ClinicalDocument> => {
    const response = await apiService.get<ClinicalDocument>(
      ENDPOINTS.DOCUMENTS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Create document (without file)
   */
  create: async (data: ClinicalDocumentFormData): Promise<ClinicalDocument> => {
    const response = await apiService.post<ClinicalDocument>(
      ENDPOINTS.DOCUMENTS.LIST,
      data
    );
    return response.data;
  },

  /**
   * Upload document with file
   */
  upload: async (
    data: ClinicalDocumentFormData
  ): Promise<DocumentUploadResponse> => {
    const formData = new FormData();

    // Campos requeridos
    formData.append("clinical_record", data.clinical_record);
    formData.append("document_type", data.document_type);
    formData.append("title", data.title);

    // Campos opcionales - solo agregar si tienen valor
    if (data.description) {
      formData.append("description", data.description);
    }
    if (data.document_date) {
      formData.append("document_date", data.document_date);
    }
    if (data.specialty) {
      formData.append("specialty", data.specialty);
    }
    if (data.doctor_name) {
      formData.append("doctor_name", data.doctor_name);
    }
    if (data.doctor_license) {
      formData.append("doctor_license", data.doctor_license);
    }
    if (data.content) {
      formData.append("content", data.content);
    }
    if (data.tags && data.tags.length > 0) {
      formData.append("tags", JSON.stringify(data.tags));
    }

    // Archivo (requerido para upload)
    if (data.file) {
      formData.append("file", data.file);
    }

    const response = await apiService.post<DocumentUploadResponse>(
      ENDPOINTS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Update document (with optional file replacement)
   */
  update: async (
    id: string,
    data: Partial<ClinicalDocumentFormData>
  ): Promise<ClinicalDocument> => {
    // Si hay archivo, enviar como FormData
    if (data.file) {
      const formData = new FormData();

      // Agregar todos los campos al FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "file" && value instanceof File) {
            formData.append("file", value);
          } else if (key === "tags" && Array.isArray(value)) {
            formData.append("tags", JSON.stringify(value));
          } else if (key === "content" && typeof value === "object") {
            formData.append("content", JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await apiService.put<ClinicalDocument>(
        ENDPOINTS.DOCUMENTS.DETAIL(id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } else {
      // Sin archivo, enviar JSON normal
      const response = await apiService.put<ClinicalDocument>(
        ENDPOINTS.DOCUMENTS.DETAIL(id),
        data
      );
      return response.data;
    }
  },

  /**
   * Delete document
   */
  delete: async (id: string): Promise<void> => {
    await apiService.delete(ENDPOINTS.DOCUMENTS.DETAIL(id));
  },

  /**
   * Download document (get signed URL with forced download)
   */
  download: async (id: string): Promise<{ url: string; file_name: string }> => {
    const response = await apiService.get<{ url: string; file_name: string }>(
      ENDPOINTS.DOCUMENTS.DOWNLOAD(id)
    );
    return response.data;
  },

  /**
   * View document (get signed URL for preview without forcing download)
   */
  view: async (id: string): Promise<{ url: string; file_name: string }> => {
    const response = await apiService.get<{ url: string; file_name: string }>(
      ENDPOINTS.DOCUMENTS.VIEW(id)
    );
    return response.data;
  },

  /**
   * Sign document
   */
  sign: async (id: string): Promise<{ message: string; signed_at: string }> => {
    const response = await apiService.post<{
      message: string;
      signed_at: string;
    }>(ENDPOINTS.DOCUMENTS.SIGN(id));
    return response.data;
  },

  /**
   * Get access logs for a document
   */
  getAccessLogs: async (id: string): Promise<DocumentAccessLog[]> => {
    const response = await apiService.get<DocumentAccessLog[]>(
      ENDPOINTS.DOCUMENTS.ACCESS_LOG(id)
    );
    return response.data;
  },

  /**
   * Search documents
   */
  search: async (
    query: string,
    filters?: Omit<GetDocumentsParams, "search">
  ): Promise<PaginatedResponse<ClinicalDocument>> => {
    return documentsService.getAll({ ...filters, search: query });
  },

  /**
   * Process OCR manually
   */
  processOCR: async (
    id: string
  ): Promise<{ message: string; ocr_status: string }> => {
    const response = await apiService.post<{
      message: string;
      ocr_status: string;
    }>(ENDPOINTS.DOCUMENTS.PROCESS_OCR(id));
    return response.data;
  },

  /**
   * Enhance image using CLAHE
   */
  enhanceImage: async (
    id: string,
    params?: { clip_limit?: number; tile_grid_size?: number }
  ): Promise<{ enhanced_url: string; message: string }> => {
    const response = await apiService.post<{
      enhanced_url: string;
      message: string;
    }>(ENDPOINTS.DOCUMENTS.ENHANCE_IMAGE(id), params || {});
    return response.data;
  },
};
