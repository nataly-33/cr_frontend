import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";
import type { LoginCredentials, LoginResponse } from "../types";
import type { User } from "@core/types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiService.post<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiService.post(ENDPOINTS.AUTH.LOGOUT);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiService.get<User>(ENDPOINTS.AUTH.ME);
    return response.data;
  },
};
