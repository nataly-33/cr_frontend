/**
 * Componentes Condicionales de Permisos
 *
 * Componentes reutilizables para mostrar/ocultar contenido
 * basado en permisos dinámicos
 */

import React from 'react';
import { permissionsService } from '@core/services/permissions.service';

// ============================================================================
// INTERFACES
// ============================================================================

interface CanAccessProps {
  children: React.ReactNode;
  permissionCode: string;
  fallback?: React.ReactNode;
}

interface CanAccessAllProps {
  children: React.ReactNode;
  permissionCodes: string[];
  fallback?: React.ReactNode;
}

interface CanAccessAnyProps {
  children: React.ReactNode;
  permissionCodes: string[];
  fallback?: React.ReactNode;
}

interface CanAccessResourceProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
}

interface IsSuperAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// ============================================================================
// COMPONENTES
// ============================================================================

/**
 * Muestra contenido si el usuario tiene un permiso específico
 *
 * @example
 * <CanAccess permissionCode="patient.create">
 *   <button>Crear Paciente</button>
 * </CanAccess>
 */
export const CanAccess: React.FC<CanAccessProps> = ({
  children,
  permissionCode,
  fallback,
}) => {
  if (permissionsService.hasPermission(permissionCode)) {
    return <>{children}</>;
  }
  return <>{fallback || null}</>;
};

/**
 * Muestra contenido si el usuario tiene TODOS los permisos
 *
 * @example
 * <CanAccessAll permissionCodes={['patient.read', 'patient.update']}>
 *   <button>Editar Paciente</button>
 * </CanAccessAll>
 */
export const CanAccessAll: React.FC<CanAccessAllProps> = ({
  children,
  permissionCodes,
  fallback,
}) => {
  if (permissionsService.hasAllPermissions(...permissionCodes)) {
    return <>{children}</>;
  }
  return <>{fallback || null}</>;
};

/**
 * Muestra contenido si el usuario tiene AL MENOS UNO de los permisos
 *
 * @example
 * <CanAccessAny permissionCodes={['patient.create', 'patient.update']}>
 *   <button>Crear o Editar Paciente</button>
 * </CanAccessAny>
 */
export const CanAccessAny: React.FC<CanAccessAnyProps> = ({
  children,
  permissionCodes,
  fallback,
}) => {
  if (permissionsService.hasAnyPermission(...permissionCodes)) {
    return <>{children}</>;
  }
  return <>{fallback || null}</>;
};

/**
 * Muestra contenido si el usuario tiene permiso para un recurso + acción
 *
 * @example
 * <CanAccessResource resource="patient" action="delete">
 *   <button>Eliminar Paciente</button>
 * </CanAccessResource>
 */
export const CanAccessResource: React.FC<CanAccessResourceProps> = ({
  children,
  resource,
  action,
  fallback,
}) => {
  if (permissionsService.hasResourcePermission(resource, action)) {
    return <>{children}</>;
  }
  return <>{fallback || null}</>;
};

/**
 * Muestra contenido solo para superadmins
 *
 * @example
 * <IsSuperAdmin>
 *   <button>Admin Panel</button>
 * </IsSuperAdmin>
 */
export const IsSuperAdmin: React.FC<IsSuperAdminProps> = ({
  children,
  fallback,
}) => {
  if (permissionsService.isSuperAdmin()) {
    return <>{children}</>;
  }
  return <>{fallback || null}</>;
};

// ============================================================================
// ALIAS ÚTILES
// ============================================================================

export const CanRead = ({
  resource,
  children,
  fallback,
}: {
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <CanAccessResource resource={resource} action="read" fallback={fallback}>
    {children}
  </CanAccessResource>
);

export const CanCreate = ({
  resource,
  children,
  fallback,
}: {
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <CanAccessResource resource={resource} action="create" fallback={fallback}>
    {children}
  </CanAccessResource>
);

export const CanUpdate = ({
  resource,
  children,
  fallback,
}: {
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <CanAccessResource resource={resource} action="update" fallback={fallback}>
    {children}
  </CanAccessResource>
);

export const CanDelete = ({
  resource,
  children,
  fallback,
}: {
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <CanAccessResource resource={resource} action="delete" fallback={fallback}>
    {children}
  </CanAccessResource>
);

export const CanExport = ({
  resource,
  children,
  fallback,
}: {
  resource: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => (
  <CanAccessResource resource={resource} action="export" fallback={fallback}>
    {children}
  </CanAccessResource>
);
