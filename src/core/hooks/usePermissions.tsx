/**
 * Hooks y Guards de Permisos - Sistema RBAC Dinámico
 */

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@core/store/auth.store';
import { permissionsService } from '@core/services/permissions.service';

// ============================================================================
// GUARDS DE RUTAS
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

interface PermissionRouteProps {
  children: React.ReactNode;
  permissionCode: string;
  fallback?: React.ReactNode;
}

export const PermissionRoute = ({
  children,
  permissionCode,
  fallback,
}: PermissionRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!permissionsService.hasPermission(permissionCode)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

interface AllPermissionsRouteProps {
  children: React.ReactNode;
  permissionCodes: string[];
  fallback?: React.ReactNode;
}

export const AllPermissionsRoute = ({
  children,
  permissionCodes,
  fallback,
}: AllPermissionsRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!permissionsService.hasAllPermissions(...permissionCodes)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

interface AnyPermissionRouteProps {
  children: React.ReactNode;
  permissionCodes: string[];
  fallback?: React.ReactNode;
}

export const AnyPermissionRoute = ({
  children,
  permissionCodes,
  fallback,
}: AnyPermissionRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!permissionsService.hasAnyPermission(...permissionCodes)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

interface SuperAdminRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SuperAdminRoute = ({
  children,
  fallback,
}: SuperAdminRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!permissionsService.isSuperAdmin()) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

interface ResourceActionRouteProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
}

export const ResourceActionRoute = ({
  children,
  resource,
  action,
  fallback,
}: ResourceActionRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!permissionsService.hasResourcePermission(resource, action)) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

// ============================================================================
// HOOKS
// ============================================================================

export const useCanAccess = (permissionCode: string): boolean => {
  return permissionsService.hasPermission(permissionCode);
};

export const useCanAccessAll = (...permissionCodes: string[]): boolean => {
  return permissionsService.hasAllPermissions(...permissionCodes);
};

export const useCanAccessAny = (...permissionCodes: string[]): boolean => {
  return permissionsService.hasAnyPermission(...permissionCodes);
};

export const useCanAccessResource = (
  resource: string,
  action: string
): boolean => {
  return permissionsService.hasResourcePermission(resource, action);
};

export const useIsSuperAdmin = (): boolean => {
  return permissionsService.isSuperAdmin();
};

export const useUserPermissions = () => {
  return permissionsService.getUserPermissions();
};

export const useAccessibleResources = (): string[] => {
  return permissionsService.getAccessibleResources();
};

export const useResourceActions = (resource: string): string[] => {
  return permissionsService.getResourceActions(resource);
};
