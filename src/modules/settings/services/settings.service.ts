import { apiService } from "../../../shared/services/api.service";
import { ENDPOINTS } from "../../../core/config/api.config";
import type { UserPreferences } from "../../../core/store/settings.store";

class SettingsService {
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiService.get<UserPreferences>(
      ENDPOINTS.USERS.PREFERENCES
    );
    return response.data;
  }

  async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const response = await apiService.put<UserPreferences>(
      ENDPOINTS.USERS.PREFERENCES,
      preferences
    );
    return response.data;
  }
}

export const settingsService = new SettingsService();
