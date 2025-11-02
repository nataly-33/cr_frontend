export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  tenant: Tenant;
  role?: Role;
  is_active: boolean;
  is_tenant_owner: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
