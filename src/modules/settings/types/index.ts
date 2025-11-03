// Types for Settings Module

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  role_name: string;
  date_joined: string;
  last_login?: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  custom_settings?: Record<string, any>;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: File;
}

export interface UpdatePreferencesData {
  theme?: "light" | "dark" | "system";
  language?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  custom_settings?: Record<string, any>;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  last_password_change?: string;
  active_sessions: number;
}

export const THEMES = {
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
} as const;

export const LANGUAGES = {
  es: "Español",
  en: "English",
  pt: "Português",
} as const;
