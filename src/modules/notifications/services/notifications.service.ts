import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";
import type {
  Notification,
  NotificationPreferences,
  NotificationStats,
  UnreadCount,
  NotificationUpdatePayload,
  NotificationType,
  NotificationStatus,
  NotificationChannel,
} from "../types";
import type { PaginatedResponse } from "@core/types";

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
    if (params?.page_size)
      queryParams.append("page_size", params.page_size.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.ordering) queryParams.append("ordering", params.ordering);

    const url = `${ENDPOINTS.NOTIFICATIONS.LIST}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiService.get<PaginatedResponse<Notification>>(url);
    return response.data;
  },

  // Obtener detalle de una notificación
  getById: async (id: string) => {
    const response = await apiService.get<Notification>(
      ENDPOINTS.NOTIFICATIONS.DETAIL(id)
    );
    return response.data;
  },

  // Marcar una notificación como leída
  markAsRead: async (id: string) => {
    const response = await apiService.patch<Notification>(
      ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id),
      {}
    );
    return response.data;
  },

  // Marcar como no leída
  markAsUnread: async (id: string) => {
    const response = await apiService.patch<Notification>(
      ENDPOINTS.NOTIFICATIONS.MARK_AS_UNREAD(id),
      {}
    );
    return response.data;
  },

  // Marcar todas como leídas
  markAllAsRead: async () => {
    const response = await apiService.patch<{
      success: boolean;
      updated: number;
    }>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ, {});
    return response.data;
  },

  // Obtener contador de no leídas
  getUnreadCount: async () => {
    const response = await apiService.get<UnreadCount>(
      ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return response.data;
  },

  // Obtener notificaciones no leídas (lista plana)
  getUnreadNotifications: async () => {
    // We'll request a reasonable page_size and filter client-side by read_at === null
    const response = await apiService.get<PaginatedResponse<Notification>>(
      `${ENDPOINTS.NOTIFICATIONS.LIST}?page_size=50`
    );
    const data = response.data;
    return (data.results || []).filter((n) => !n.read_at);
  },

  // Obtener estadísticas
  getStats: async () => {
    const response = await apiService.get<NotificationStats>(
      ENDPOINTS.NOTIFICATIONS.STATS
    );
    return response.data;
  },

  // Obtener mis preferencias
  getPreferences: async () => {
    const response = await apiService.get<NotificationPreferences>(
      ENDPOINTS.NOTIFICATIONS.PREFERENCES
    );
    return response.data;
  },

  // Actualizar mis preferencias
  updatePreferences: async (data: NotificationUpdatePayload) => {
    const response = await apiService.put<NotificationPreferences>(
      ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      data
    );
    return response.data;
  },

  // Eliminar una notificación
  delete: async (id: string) => {
    await apiService.delete(ENDPOINTS.NOTIFICATIONS.DETAIL(id));
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
    }>(ENDPOINTS.NOTIFICATIONS.SEND, {
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
    }>(ENDPOINTS.NOTIFICATIONS.GET_RECIPIENTS);
    return response.data;
  },
};

// Type aliases for historical I-prefixed imports elsewhere in the codebase
export type INotification = Notification;
export type INotificationPreference = NotificationPreferences;
