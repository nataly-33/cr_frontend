// Types for Users Module

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: string;
  role_name: string;
  is_active: boolean;
  is_tenant_owner: boolean;
  last_login?: string;
  date_joined: string;
  avatar_url?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  custom_settings?: Record<string, any>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  permission_ids?: string[];
  is_system_role: boolean;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: string;
  password?: string;
  password_confirmation?: string;
  is_active?: boolean;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface UpdatePreferencesData {
  theme?: "light" | "dark" | "system";
  language?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  custom_settings?: Record<string, any>;
}
