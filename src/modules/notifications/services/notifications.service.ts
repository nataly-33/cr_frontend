import { apiService } from '@/shared/services/api.service';

export interface INotification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  icon: string;
  color: string;
  related_model: string | null;
  related_id: string | null;
  user_email: string;
  created_at: string;
  read_at: string | null;
}

export interface INotificationPreference {
  document_uploaded_email: boolean;
  record_created_email: boolean;
  record_updated_email: boolean;
  access_granted_email: boolean;
  comment_added_email: boolean;
  max_emails_per_day: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  send_daily_digest: boolean;
}

export const notificationsService = {
  /**
   * Obtener todas las notificaciones del usuario
   */
  getNotifications: async (limit = 10): Promise<INotification[]> => {
    try {
      const response = await apiService.get<{ results: INotification[] } | INotification[]>(`/notifications/?limit=${limit}`);
      const data = response.data as any;
      return data.results || data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  },

  /**
   * Obtener cantidad de notificaciones sin leer
   */
  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await apiService.get<{ unread_count: number }>('/notifications/unread_count/');
      const data = response.data as any;
      return data.unread_count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  },

  /**
   * Obtener solo las notificaciones sin leer (máximo 10)
   */
  getUnreadNotifications: async (): Promise<INotification[]> => {
    try {
      const response = await apiService.get<INotification[]>('/notifications/unread/');
      const data = response.data as any;
      return data || [];
    } catch (error) {
      console.error('Error getting unread notifications:', error);
      throw error;
    }
  },

  /**
   * Marcar una notificación específica como leída
   */
  markAsRead: async (id: string): Promise<INotification> => {
    try {
      const response = await apiService.post<INotification>(`/notifications/${id}/mark_as_read/`);
      return response.data as INotification;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      throw error;
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead: async (): Promise<{ updated: number }> => {
    try {
      const response = await apiService.post<{ updated: number }>('/notifications/mark_all_as_read/');
      return response.data as { updated: number };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Obtener preferencias de notificación del usuario
   */
  getPreferences: async (): Promise<INotificationPreference> => {
    try {
      const response = await apiService.get<INotificationPreference>('/notifications/preferences/my_preferences/');
      return response.data as INotificationPreference;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  },

  /**
   * Actualizar preferencias de notificación del usuario
   */
  updatePreferences: async (data: Partial<INotificationPreference>): Promise<INotificationPreference> => {
    try {
      const response = await apiService.put<INotificationPreference>('/notifications/preferences/my_preferences/', data);
      return response.data as INotificationPreference;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }
};
