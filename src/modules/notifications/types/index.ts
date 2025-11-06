export type NotificationType =
  | "appointment.created"
  | "appointment.canceled"
  | "appointment.reminder"
  | "clinical_record.result"
  | "document.uploaded"
  | "inventory.low_stock"
  | "user.added"
  | "system.alert";

export type NotificationChannel = "in_app" | "email" | "push";

export type NotificationStatus = "queued" | "sent" | "delivered" | "failed" | "read";

export interface Notification {
  id: string;
  user: string;
  type: NotificationType;
  type_display: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  channel: NotificationChannel;
  status: NotificationStatus;
  status_display: string;
  read_at: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user: string;
  preferences: Record<NotificationType, Record<NotificationChannel, boolean>>;
  all_preferences: Record<NotificationType, Record<NotificationChannel, boolean>>;
  quiet_hours_enabled: boolean;
  quiet_hours_from: string;
  quiet_hours_to: string;
  email_digest_enabled: boolean;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  queued: number;
  sent: number;
  failed: number;
  by_type: Record<NotificationType, number>;
  by_channel: Record<NotificationChannel, number>;
}

export interface UnreadCount {
  unread_count: number;
}

export interface NotificationUpdatePayload {
  preferences?: Record<NotificationType, Record<NotificationChannel, boolean>>;
  quiet_hours_enabled?: boolean;
  quiet_hours_from?: string;
  quiet_hours_to?: string;
  email_digest_enabled?: boolean;
}
