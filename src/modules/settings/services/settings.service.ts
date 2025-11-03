import { apiService } from '../../../shared/services/api.service';
import type { UserPreferences } from '../../../core/store/settings.store';

class SettingsService {
  private readonly baseUrl = '/auth/users/preferences/';

  async getPreferences(): Promise<UserPreferences> {
    const response = await apiService.get<UserPreferences>(this.baseUrl);
    return response.data;
  }

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiService.put<UserPreferences>(this.baseUrl, preferences);
    return response.data;
  }
}

export const settingsService = new SettingsService();
