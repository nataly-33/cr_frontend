/**
 * Servicio de Permisos - Sistema RBAC Dinámico
 *
 * Gestiona:
 * - Carga dinámica de permisos desde el backend
 * - Validación de permisos en tiempo de ejecución
 * - Guards para rutas protegidas
 * - Directivas para visibilidad condicional
 *
 * NO CONTIENE PERMISOS HARDCODEADOS - Todo es dinámico desde BD
 */

import { apiService } from '@shared/services/api.service';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  is_system_role: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: Role;
  is_superuser: boolean;
  is_staff: boolean;
  tenant_id?: string;
}

class PermissionsService {
  private permissionsCache: Map<string, Permission> = new Map();
  private currentUser: User | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutos
  private lastCacheTime: number = 0;

  /**
   * Inicializa el servicio con datos del usuario actual
   */
  async initialize(user: User): Promise<void> {
    this.currentUser = user;
    await this.refreshPermissionsCache();
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Establece el usuario actual (usado en login)
   */
  setCurrentUser(user: User): void {
    this.currentUser = user;
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param permissionCode Código del permiso (ej: 'patient.create')
   * @returns true si tiene el permiso
   */
  hasPermission(permissionCode: string): boolean {
    if (!this.currentUser) {
      return false;
    }

    // Superusuarios tienen todos los permisos
    if (this.currentUser.is_superuser) {
      return true;
    }

    // Verificar si el usuario tiene el rol y el rol tiene el permiso
    if (!this.currentUser.role) {
      return false;
    }

    return this.currentUser.role.permissions.some(
      (p) => p.code === permissionCode
    );
  }

  /**
   * Verifica si el usuario tiene TODOS los permisos especificados
   */
  hasAllPermissions(...permissionCodes: string[]): boolean {
    return permissionCodes.every((code) => this.hasPermission(code));
  }

  /**
   * Verifica si el usuario tiene AL MENOS UNO de los permisos especificados
   */
  hasAnyPermission(...permissionCodes: string[]): boolean {
    return permissionCodes.some((code) => this.hasPermission(code));
  }

  /**
   * Verifica permiso de recurso + acción (ej: resource="patient", action="create")
   */
  hasResourcePermission(resource: string, action: string): boolean {
    return this.hasPermission(`${resource}.${action}`);
  }

  /**
   * Valida si el usuario puede acceder a una acción
   * Lanza excepción si no tiene permisos
   */
  checkPermission(permissionCode: string): void {
    if (!this.hasPermission(permissionCode)) {
      throw new PermissionError(
        `No tienes permiso: ${permissionCode}`,
        permissionCode
      );
    }
  }

  /**
   * Obtiene todos los permisos del usuario actual
   */
  getUserPermissions(): Permission[] {
    if (!this.currentUser?.role) {
      return [];
    }
    return this.currentUser.role.permissions;
  }

  /**
   * Obtiene los permisos del usuario filtrados por recurso
   */
  getPermissionsByResource(resource: string): Permission[] {
    return this.getUserPermissions().filter((p) => p.resource === resource);
  }

  /**
   * Obtiene todos los recursos que el usuario puede acceder
   */
  getAccessibleResources(): string[] {
    const resources = new Set(
      this.getUserPermissions().map((p) => p.resource)
    );
    return Array.from(resources);
  }

  /**
   * Obtiene todas las acciones que el usuario puede hacer en un recurso
   */
  getResourceActions(resource: string): string[] {
    const actions = new Set(
      this.getPermissionsByResource(resource).map((p) => p.action)
    );
    return Array.from(actions);
  }

  /**
   * Recarga el cache de permisos desde el backend
   */
  private async refreshPermissionsCache(): Promise<void> {
    try {
      if (!this.shouldRefreshCache()) {
        return;
      }

      const response = await apiService.get<any>('/permissions/');
      const permissions: Permission[] = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      this.permissionsCache.clear();
      permissions.forEach((perm: Permission) => {
        this.permissionsCache.set(perm.code, perm);
      });

      this.lastCacheTime = Date.now();
    } catch (error) {
      console.warn('Error al recargar cache de permisos:', error);
    }
  }

  /**
   * Verifica si se debe refrescar el cache
   */
  private shouldRefreshCache(): boolean {
    return Date.now() - this.lastCacheTime > this.cacheExpiry;
  }

  /**
   * Fuerza la actualización del cache
   */
  async invalidateCache(): Promise<void> {
    this.lastCacheTime = 0;
    await this.refreshPermissionsCache();
  }

  /**
   * Obtiene permisos disponibles por módulo/resource
   */
  getPermissionsByModule(
    resource: string
  ): Record<string, Permission[]> {
    const permissions = this.getUserPermissions();
    const filtered = permissions.filter((p) => p.resource === resource);

    return filtered.reduce(
      (acc, perm) => {
        if (!acc[perm.action]) {
          acc[perm.action] = [];
        }
        acc[perm.action].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>
    );
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getCurrentRole(): Role | undefined {
    return this.currentUser?.role;
  }

  /**
   * Verifica si el usuario es superadmin
   */
  isSuperAdmin(): boolean {
    return this.currentUser?.is_superuser ?? false;
  }

  /**
   * Verifica si el usuario es staff
   */
  isStaff(): boolean {
    return this.currentUser?.is_staff ?? false;
  }
}

/**
 * Error personalizado para permisos
 */
export class PermissionError extends Error {
  permissionCode: string;

  constructor(message: string, permissionCode: string) {
    super(message);
    this.name = 'PermissionError';
    this.permissionCode = permissionCode;
  }
}

// Exportar instancia singleton
export const permissionsService = new PermissionsService();
