# 🔐 SISTEMA RBAC DINÁMICO - FRONTEND

## Descripción

Sistema de control de acceso basado en roles (RBAC) completamente dinámico que consume permisos desde el backend **sin hardcodear ninguna clase o constante de permisos**.

## 📋 Estructura

```
src/
├── core/
│   ├── services/
│   │   ├── permissions.service.ts    # Lógica central de permisos
│   │   └── index.ts                  # Exporta permissionsService
│   └── hooks/
│       ├── usePermissions.tsx         # Guards, hooks y componentes
│       └── index.ts
├── shared/
│   └── components/
│       └── permissions/
│           ├── PermissionWrapper.tsx  # Componentes de visibilidad condicional
│           └── index.ts
```

## 🎯 Características

✅ **Completamente Dinámico** - Lee permisos del backend, NO hardcodeados
✅ **Multi-nivel** - Soporta permisos simples, múltiples (AND/OR), recursos+acciones  
✅ **Guards de Rutas** - Protege rutas dinámicamente
✅ **Componentes** - Visibilidad condicional basada en permisos
✅ **Hooks** - Usa permisos dentro de componentes
✅ **Cache** - 5 minutos de cache para optimizar rendimiento
✅ **Type-Safe** - TypeScript completo

## 📚 Uso

### 1. Inicializar con usuario

En tu componente de login o App:

```tsx
import { permissionsService } from '@core/services/permissions.service';

const handleLogin = async (user: User) => {
  // Después de login
  await permissionsService.initialize(user);
};
```

### 2. Guards de Rutas

#### Ruta Protegida (requiere autenticación)

```tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

#### Ruta con Permiso

```tsx
<PermissionRoute permissionCode="patient.create">
  <CreatePatientPage />
</PermissionRoute>
```

#### Ruta con Múltiples Permisos (AND - todos requeridos)

```tsx
<AllPermissionsRoute permissionCodes={['patient.read', 'patient.update']}>
  <EditPatientPage />
</AllPermissionsRoute>
```

#### Ruta con Múltiples Permisos (OR - al menos uno)

```tsx
<AnyPermissionRoute permissionCodes={['patient.create', 'patient.update']}>
  <PatientForm />
</AnyPermissionRoute>
```

#### Ruta Solo para Superadmins

```tsx
<SuperAdminRoute>
  <AdminPanel />
</SuperAdminRoute>
```

#### Ruta con Recurso + Acción

```tsx
<ResourceActionRoute resource="patient" action="delete">
  <DeletePatientPage />
</ResourceActionRoute>
```

### 3. Componentes de Visibilidad Condicional

Usa dentro de un componente para mostrar/ocultar UI:

```tsx
import { CanAccess, CanCreate, CanDelete } from '@shared/components/permissions';

export const PatientActions = () => {
  return (
    <>
      <CanCreate resource="patient">
        <button>Crear Paciente</button>
      </CanCreate>

      <CanDelete resource="patient">
        <button>Eliminar Paciente</button>
      </CanDelete>

      {/* Versión genérica */}
      <CanAccess permissionCode="patient.export">
        <button>Exportar</button>
      </CanAccess>
    </>
  );
};
```

### 4. Hooks dentro de Componentes

```tsx
import { useCanAccess, useIsSuperAdmin, useUserPermissions } from '@core/hooks';

export const DashboardPage = () => {
  // Verificar un permiso
  const canCreatePatient = useCanAccess('patient.create');

  // Verificar múltiples (todos)
  const canManagePatients = useCanAccessAll('patient.read', 'patient.update');

  // Verificar múltiples (alguno)
  const canModifyPatient = useCanAccessAny('patient.update', 'patient.delete');

  // Verificar recurso + acción
  const canExport = useCanAccessResource('patient', 'export');

  // Verificar si es superadmin
  const isSuperAdmin = useIsSuperAdmin();

  // Obtener todos los permisos del usuario
  const permissions = useUserPermissions();

  // Obtener recursos accesibles
  const resources = useAccessibleResources();

  // Obtener acciones de un recurso
  const patientActions = useResourceActions('patient');

  return (
    <div>
      {canCreatePatient && <button>Crear Paciente</button>}
      {isSuperAdmin && <button>Panel Admin</button>}
    </div>
  );
};
```

### 5. Verificación Programática

```tsx
import { permissionsService } from '@core/services/permissions.service';

// Verificar un permiso
if (permissionsService.hasPermission('patient.delete')) {
  // Usuario puede eliminar pacientes
}

// Verificar múltiples (todos)
if (permissionsService.hasAllPermissions('patient.read', 'patient.update')) {
  // Usuario puede hacer ambas cosas
}

// Verificar múltiples (alguno)
if (permissionsService.hasAnyPermission('patient.create', 'patient.update')) {
  // Usuario puede hacer al menos una
}

// Verificar recurso + acción
if (permissionsService.hasResourcePermission('patient', 'export')) {
  // Usuario puede exportar pacientes
}

// Lanzar excepción si no tiene permiso
try {
  permissionsService.checkPermission('patient.delete');
} catch (error) {
  console.error(error.message);
}
```

## 🔄 Flujo de Datos

```
Backend (Django) → API Permisos/Roles/Usuario
                        ↓
Frontend (React) ← API responde con datos dinámicos
                        ↓
permissionsService.initialize(user)
                        ↓
Cache local de permisos (5 min)
                        ↓
Guards/Hooks/Componentes usan permissionsService
                        ↓
Visibilidad condicional sin hardcoding
```

## 📝 Formatos de Permisos

Los permisos desde el backend tienen este formato:

```typescript
interface Permission {
  id: string;
  code: string;           // ej: "patient.create"
  name: string;           // ej: "Crear Paciente"
  description: string;
  resource: string;       // ej: "patient"
  action: string;         // ej: "create"
  created_at: string;
}
```

Los códigos de permiso siguen el patrón: `{recurso}.{acción}`

**Ejemplos:**
- `patient.create`
- `patient.read`
- `patient.update`
- `patient.delete`
- `clinical_record.create`
- `document.sign`
- `document.export`

## 🛡️ Características de Seguridad

1. **Sin Hardcoding** - NO hay constantes de permisos en el frontend
2. **Dinámico Completamente** - Nuevos permisos aparecen automáticamente
3. **Multi-tenant** - Respeta tenant_id del usuario
4. **Superadmin Override** - Los superadmin tienen todos los permisos
5. **Cache Inteligente** - Se invalida automáticamente si es necesario

## ⚙️ Configuración

### Modificar tiempo de cache

```tsx
// En permissions.service.ts - línea ~45
private cacheExpiry: number = 5 * 60 * 1000; // Cambiar milisegundos
```

### Invalidar cache manualmente

```tsx
import { permissionsService } from '@core/services/permissions.service';

// Fuerza recarga desde backend
await permissionsService.invalidateCache();
```

## 🚀 Integración con Rutas

```tsx
// src/core/routes/index.tsx

import { 
  ProtectedRoute, 
  PermissionRoute,
  SuperAdminRoute 
} from '@core/hooks';

export const routes = [
  // Rutas públicas
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },

  // Rutas protegidas (requieren autenticación)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },

  // Rutas con permisos específicos
  {
    path: '/patients',
    element: (
      <PermissionRoute permissionCode="patient.read">
        <PatientsPage />
      </PermissionRoute>
    ),
  },

  // Rutas solo para admin
  {
    path: '/admin',
    element: (
      <SuperAdminRoute>
        <AdminPanel />
      </SuperAdminRoute>
    ),
  },
];
```

## 🔍 Depuración

Ver permisos actuales del usuario:

```tsx
import { permissionsService } from '@core/services/permissions.service';

console.log('Usuario actual:', permissionsService.getCurrentUser());
console.log('Rol:', permissionsService.getCurrentRole());
console.log('Todos los permisos:', permissionsService.getUserPermissions());
console.log('Recursos accesibles:', permissionsService.getAccessibleResources());
console.log('Es superadmin:', permissionsService.isSuperAdmin());
```

## ❌ Manejo de Errores

```tsx
import { PermissionError } from '@core/services/permissions.service';

try {
  permissionsService.checkPermission('patient.delete');
} catch (error) {
  if (error instanceof PermissionError) {
    console.error(`No tienes permiso: ${error.permissionCode}`);
  }
}
```

## 📊 Ejemplo Completo

```tsx
import { useCanAccess, useIsSuperAdmin } from '@core/hooks';
import { CanCreate, CanDelete } from '@shared/components/permissions';

export const PatientsPage = () => {
  const canCreate = useCanAccess('patient.create');
  const isSuperAdmin = useIsSuperAdmin();

  return (
    <div>
      <h1>Pacientes</h1>

      {/* Mostrar botón solo si tiene permiso */}
      <CanCreate resource="patient">
        <button onClick={() => navigate('/patients/create')}>
          Nuevo Paciente
        </button>
      </CanCreate>

      {/* Mostrar panel admin solo para superadmins */}
      {isSuperAdmin && (
        <button onClick={() => navigate('/admin')}>
          Panel Administrativo
        </button>
      )}

      {/* Lista de pacientes */}
      <PatientsList />

      {/* Acciones por fila */}
      {patients.map((patient) => (
        <div key={patient.id}>
          <span>{patient.name}</span>
          <CanDelete resource="patient">
            <button onClick={() => deletePatient(patient.id)}>
              Eliminar
            </button>
          </CanDelete>
        </div>
      ))}
    </div>
  );
};
```

## 🎓 Mejores Prácticas

✅ **DO:**
- Usar componentes `<CanAccess>` para UI condicional
- Usar hooks en lógica de componentes
- Verificar permisos en servicios antes de hacer API calls
- Invalidar cache después de cambios de rol

❌ **DON'T:**
- Hardcodear códigos de permisos
- Confiar solo en frontend (verificar siempre en backend)
- Usar permisos sin inicializar el servicio
- Cachear datos de usuario por más de 5 minutos

## 🔗 Relación con Backend

El frontend **depende del backend** para:
- Lista de permisos disponibles
- Permisos asignados al rol del usuario
- Validación final de acciones

El backend **es la fuente de verdad** y siempre valida permisos en cada endpoint.

---

**Creado:** Noviembre 2025
**Versión:** 1.0.0
**Status:** ✅ Implementado y Documentado
