import { apiService } from "@shared/services/api.service";
import type {
  User,
  UserFormData,
  Role,
  Permission,
  ChangePasswordData,
  UpdatePreferencesData,
} from "../types";
import type { PaginatedResponse } from "@core/types";

interface GetUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  role?: string;
  is_active?: boolean;
}

export const usersService = {
  /**
   * Get all users with pagination and filters
   */
  getAll: async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.ordering) queryParams.append("ordering", params.ordering);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());

    const response = await apiService.get<PaginatedResponse<User>>(
      `/auth/users/?${queryParams.toString()}`
    );
    return response.data;
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User> => {
    const response = await apiService.get<User>(`/auth/users/${id}/`);
    return response.data;
  },

  /**
   * Get current user
   */
  getMe: async (): Promise<User> => {
    const response = await apiService.get<User>("/auth/users/me/");
    return response.data;
  },

  /**
   * Create new user
   */
  create: async (data: UserFormData): Promise<User> => {
    const response = await apiService.post<User>("/auth/users/", data);
    return response.data;
  },

  /**
   * Update user
   */
  update: async (id: string, data: Partial<UserFormData>): Promise<User> => {
    const response = await apiService.put<User>(`/auth/users/${id}/`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<void> => {
    await apiService.delete(`/auth/users/${id}/`);
  },

  /**
   * Toggle user active status
   */
  toggleActive: async (id: string): Promise<User> => {
    const response = await apiService.post<User>(
      `/auth/users/${id}/toggle-active/`
    );
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (
    id: string,
    data: ChangePasswordData
  ): Promise<{ message: string }> => {
    const response = await apiService.post<{ message: string }>(
      `/auth/users/${id}/change-password/`,
      data
    );
    return response.data;
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (
    data: UpdatePreferencesData
  ): Promise<{ message: string }> => {
    const response = await apiService.put<{ message: string }>(
      "/auth/users/preferences/",
      data
    );
    return response.data;
  },

  /**
   * Get all roles
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await apiService.get<PaginatedResponse<Role>>("/auth/roles/");
    return response.data.results;
  },

  /**
   * Get role by ID
   */
  getRoleById: async (id: string): Promise<Role> => {
    const response = await apiService.get<Role>(`/auth/roles/${id}/`);
    return response.data;
  },

  /**
   * Create role
   */
  createRole: async (data: Partial<Role>): Promise<Role> => {
    const response = await apiService.post<Role>("/auth/roles/", data);
    return response.data;
  },

  /**
   * Update role
   */
  updateRole: async (id: string, data: Partial<Role>): Promise<Role> => {
    const response = await apiService.put<Role>(`/auth/roles/${id}/`, data);
    return response.data;
  },

  /**
   * Delete role
   */
  deleteRole: async (id: string): Promise<void> => {
    await apiService.delete(`/auth/roles/${id}/`);
  },

  /**
   * Get all permissions
   */
  getPermissions: async (): Promise<Permission[]> => {
    const response = await apiService.get<PaginatedResponse<Permission>>("/auth/permissions/");
    return response.data.results;
  },
};
