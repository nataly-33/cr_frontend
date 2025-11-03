import { apiService } from "@shared/services/api.service";
import type {
  UserProfile,
  UserPreferences,
  UpdateProfileData,
  UpdatePreferencesData,
  ChangePasswordData,
  SecuritySettings,
} from "../types";

export const settingsService = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiService.get<UserProfile>("/users/me/");
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await apiService.put<UserProfile>("/users/me/", data);
    return response.data;
  },

  /**
   * Get user preferences
   */
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await apiService.get<UserPreferences>(
      "/users/me/preferences/"
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
      "/users/me/preferences/",
      data
    );
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (
    data: ChangePasswordData
  ): Promise<{ message: string }> => {
    const response = await apiService.post<{ message: string }>(
      "/users/me/change-password/",
      data
    );
    return response.data;
  },

  /**
   * Get security settings
   */
  getSecurity: async (): Promise<SecuritySettings> => {
    const response = await apiService.get<SecuritySettings>(
      "/users/me/security/"
    );
    return response.data;
  },

  /**
   * Enable two-factor authentication
   */
  enable2FA: async (): Promise<{
    qr_code: string;
    secret: string;
    backup_codes: string[];
  }> => {
    const response = await apiService.post<{
      qr_code: string;
      secret: string;
      backup_codes: string[];
    }>("/users/me/security/enable-2fa/");
    return response.data;
  },

  /**
   * Verify and activate two-factor authentication
   */
  verify2FA: async (code: string): Promise<{ message: string }> => {
    const response = await apiService.post<{ message: string }>(
      "/users/me/security/verify-2fa/",
      { code }
    );
    return response.data;
  },

  /**
   * Disable two-factor authentication
   */
  disable2FA: async (password: string): Promise<{ message: string }> => {
    const response = await apiService.post<{ message: string }>(
      "/users/me/security/disable-2fa/",
      { password }
    );
    return response.data;
  },

  /**
   * Get active sessions
   */
  getActiveSessions: async (): Promise<
    Array<{
      id: string;
      device: string;
      location: string;
      ip_address: string;
      last_activity: string;
      is_current: boolean;
    }>
  > => {
    const response = await apiService.get<
      Array<{
        id: string;
        device: string;
        location: string;
        ip_address: string;
        last_activity: string;
        is_current: boolean;
      }>
    >("/users/me/sessions/");
    return response.data;
  },

  /**
   * Revoke session
   */
  revokeSession: async (sessionId: string): Promise<{ message: string }> => {
    const response = await apiService.delete<{ message: string }>(
      `/users/me/sessions/${sessionId}/`
    );
    return response.data;
  },

  /**
   * Revoke all sessions except current
   */
  revokeAllSessions: async (): Promise<{ message: string }> => {
    const response = await apiService.post<{ message: string }>(
      "/users/me/sessions/revoke-all/"
    );
    return response.data;
  },

  /**
   * Upload profile avatar
   */
  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await apiService.post<{ avatar_url: string }>(
      "/users/me/avatar/",
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
   * Delete profile avatar
   */
  deleteAvatar: async (): Promise<{ message: string }> => {
    const response = await apiService.delete<{ message: string }>(
      "/users/me/avatar/"
    );
    return response.data;
  },
};
