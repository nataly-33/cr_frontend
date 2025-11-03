import { apiService } from "@shared/services/api.service";

export interface Permission {
  id: string;
  tenant_id: string | null;
  name: string;
  code: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  tenant_id: string | null;
  name: string;
  description: string;
  permissions: string[] | Permission[]; // IDs de permisos o permisos completos
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleDetail extends Role {
  permissions: Permission[]; // Permisos completos (detalle)
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[];
  tenant_id?: string | null;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface CreatePermissionData {
  name: string;
  code: string;
  description: string;
  resource: string;
  action: string;
  tenant_id?: string | null;
}

export interface UpdatePermissionData {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
}

export const rolesPermissionsService = {
  /**
   * Get all roles (globales + por tenant)
   */
  getAllRoles: async (): Promise<Role[]> => {
    const response = await apiService.get<any>("/roles/");
    // DRF retorna paginado, extraer resultados
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  /**
   * Get single role by ID
   */
  getRoleById: async (id: string): Promise<RoleDetail> => {
    const response = await apiService.get<RoleDetail>(`/roles/${id}/`);
    return response.data;
  },

  /**
   * Create new role
   */
  createRole: async (data: CreateRoleData): Promise<Role> => {
    const response = await apiService.post<Role>("/roles/", data);
    return response.data;
  },

  /**
   * Update role
   */
  updateRole: async (id: string, data: UpdateRoleData): Promise<Role> => {
    const response = await apiService.put<Role>(`/roles/${id}/`, data);
    return response.data;
  },

  /**
   * Delete role
   */
  deleteRole: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete<{ message: string }>(`/roles/${id}/`);
    return response.data;
  },

  /**
   * Get all permissions (globales + por tenant)
   */
  getAllPermissions: async (): Promise<Permission[]> => {
    const response = await apiService.get<any>("/permissions/");
    // DRF retorna paginado, extraer resultados
    return Array.isArray(response.data) ? response.data : response.data.results || [];
  },

  /**
   * Get single permission by ID
   */
  getPermissionById: async (id: string): Promise<Permission> => {
    const response = await apiService.get<Permission>(`/permissions/${id}/`);
    return response.data;
  },

  /**
   * Create new permission
   */
  createPermission: async (data: CreatePermissionData): Promise<Permission> => {
    const response = await apiService.post<Permission>("/permissions/", data);
    return response.data;
  },

  /**
   * Update permission
   */
  updatePermission: async (id: string, data: UpdatePermissionData): Promise<Permission> => {
    const response = await apiService.put<Permission>(`/permissions/${id}/`, data);
    return response.data;
  },

  /**
   * Delete permission
   */
  deletePermission: async (id: string): Promise<{ message: string }> => {
    const response = await apiService.delete<{ message: string }>(`/permissions/${id}/`);
    return response.data;
  },
};
