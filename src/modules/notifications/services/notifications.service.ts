import { apiService } from "@shared/services/api.service";
import type {
  Notification,
  NotificationPreferences,
  NotificationStats,
  NotificationUpdatePayload,
  NotificationType,
  NotificationStatus,
  NotificationChannel,
} from "../types";
import type { PaginatedResponse } from "@core/types";

const BASE_URL = "/notifications";

interface GetNotificationsParams {
  page?: number;
  page_size?: number;
  status?: NotificationStatus;
  type?: NotificationType;
  ordering?: string;
}

export const notificationsService = {
  // Listar mis notificaciones
  getAll: async (params?: GetNotificationsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.ordering) queryParams.append("ordering", params.ordering);

    const url = `${BASE_URL}/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await apiService.get<PaginatedResponse<Notification>>(url);
    return response.data;
  },

  // Obtener detalle de una notificación
  getById: async (id: string) => {
    const response = await apiService.get<Notification>(`${BASE_URL}/${id}/`);
    return response.data;
  },

  // Marcar una notificación como leída
  markAsRead: async (id: string) => {
    const response = await apiService.patch<Notification>(
      `${BASE_URL}/${id}/read/`,
      {}
    );
    return response.data;
  },

  // Marcar como no leída
  markAsUnread: async (id: string) => {
    const response = await apiService.patch<Notification>(
      `${BASE_URL}/${id}/unread/`,
      {}
    );
    return response.data;
  },

  // Marcar todas como leídas
  markAllAsRead: async () => {
    const response = await apiService.patch<{ success: boolean; updated: number }>(
      `${BASE_URL}/mark_all_as_read/`,
      {}
    );
    return response.data;
  },

  // Obtener contador de no leídas
  getUnreadCount: async () => {
    const response = await apiService.get<{ unread_count: number }>(
      `${BASE_URL}/unread_count/`
    );
    return response.data.unread_count;
  },

  // Obtener notificaciones no leídas
  getUnreadNotifications: async () => {
    const response = await apiService.get<PaginatedResponse<Notification>>(
      `${BASE_URL}/?status=queued&status=sent&ordering=-created_at`
    );
    return response.data.results || [];
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await apiService.get<NotificationStats>(
      `${BASE_URL}/stats/`
    );
    return response.data;
  },

  // Obtener mis preferencias
  getPreferences: async () => {
    const response = await apiService.get<NotificationPreferences>(
      `${BASE_URL}/preferences/`
    );
    return response.data;
  },

  // Actualizar mis preferencias
  updatePreferences: async (data: NotificationUpdatePayload) => {
    const response = await apiService.put<NotificationPreferences>(
      `${BASE_URL}/preferences/`,
      data
    );
    return response.data;
  },

  // Eliminar una notificación
  delete: async (id: string) => {
    await apiService.delete(`${BASE_URL}/${id}/`);
  },

  // Enviar notificación a usuarios específicos del tenant
  send: async (payload: {
    title: string;
    body: string;
    type?: string;
    channel?: NotificationChannel;
    recipient_ids: string[];
    data?: Record<string, any>;
  }) => {
    const response = await apiService.post<{
      success: boolean;
      notifications_created: number;
      notifications: Array<{
        id: string;
        user_id: string;
        status: string;
      }>;
    }>(`${BASE_URL}/send/`, {
      title: payload.title,
      body: payload.body,
      type: payload.type || "system.alert",
      channel: payload.channel || "in_app",
      recipient_ids: payload.recipient_ids,
      data: payload.data || {},
    });
    return response.data;
  },

  // Obtener lista de usuarios disponibles para enviar notificaciones
  getRecipients: async () => {
    const response = await apiService.get<{
      recipients: Array<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        full_name: string;
      }>;
      count: number;
    }>(`${BASE_URL}/get_recipients/`);
    return response.data;
  },
};
