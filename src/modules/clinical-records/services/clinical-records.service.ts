import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";
import type {
  ClinicalRecord,
  ClinicalRecordFormData,
  TimelineEvent,
} from "../types";
import type { PaginatedResponse } from "@core/types";

interface GetClinicalRecordsParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  status?: string;
  patient?: string;
}

export const clinicalRecordsService = {
  getAll: async (
    params?: GetClinicalRecordsParams
  ): Promise<PaginatedResponse<ClinicalRecord>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.ordering) queryParams.append("ordering", params.ordering);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.patient) queryParams.append("patient", params.patient);

    const response = await apiService.get<PaginatedResponse<ClinicalRecord>>(
      `${ENDPOINTS.CLINICAL_RECORDS.LIST}?${queryParams.toString()}`
    );
    return response.data;
  },

  getById: async (id: string): Promise<ClinicalRecord> => {
    const response = await apiService.get<ClinicalRecord>(
      ENDPOINTS.CLINICAL_RECORDS.DETAIL(id)
    );
    return response.data;
  },

  create: async (data: ClinicalRecordFormData): Promise<ClinicalRecord> => {
    const response = await apiService.post<ClinicalRecord>(
      ENDPOINTS.CLINICAL_RECORDS.CREATE,
      data
    );
    return response.data;
  },

  update: async (
    id: string,
    data: Partial<ClinicalRecordFormData>
  ): Promise<ClinicalRecord> => {
    const response = await apiService.put<ClinicalRecord>(
      ENDPOINTS.CLINICAL_RECORDS.DETAIL(id),
      data
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiService.delete(ENDPOINTS.CLINICAL_RECORDS.DETAIL(id));
  },

  getTimeline: async (id: string): Promise<TimelineEvent[]> => {
    const response = await apiService.get<TimelineEvent[]>(
      ENDPOINTS.CLINICAL_RECORDS.TIMELINE(id)
    );
    return response.data;
  },

  archive: async (id: string): Promise<{ message: string; status: string }> => {
    const response = await apiService.post<{ message: string; status: string }>(
      ENDPOINTS.CLINICAL_RECORDS.ARCHIVE(id)
    );
    return response.data;
  },

  close: async (id: string): Promise<{ message: string; status: string }> => {
    const response = await apiService.post<{ message: string; status: string }>(
      ENDPOINTS.CLINICAL_RECORDS.CLOSE(id)
    );
    return response.data;
  },
};
