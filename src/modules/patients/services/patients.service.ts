import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";
import type { Patient } from "../types";
import type { PaginatedResponse } from "@core/types";

export const patientsService = {
  getAll: async (page = 1) => {
    const response = await apiService.get<PaginatedResponse<Patient>>(
      `${ENDPOINTS.PATIENTS.LIST}?page=${page}`
    );
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
};
