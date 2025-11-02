import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";
import type { Patient } from "../types";
import type { PaginatedResponse } from "@core/types";

interface GetPatientsParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export const patientsService = {
  getAll: async (params?: GetPatientsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.ordering) queryParams.append("ordering", params.ordering);

    const url = `${ENDPOINTS.PATIENTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await apiService.get<PaginatedResponse<Patient>>(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiService.get<Patient>(
      ENDPOINTS.PATIENTS.DETAIL(id)
    );
    return response.data;
  },

  create: async (data: Partial<Patient>) => {
    const response = await apiService.post<Patient>(
      ENDPOINTS.PATIENTS.CREATE,
      data
    );
    return response.data;
  },

  update: async (id: string, data: Partial<Patient>) => {
    const response = await apiService.put<Patient>(
      ENDPOINTS.PATIENTS.DETAIL(id),
      data
    );
    return response.data;
  },

  delete: async (id: string) => {
    await apiService.delete(ENDPOINTS.PATIENTS.DETAIL(id));
  },
};
