# 🚀 Frontend Development Guide - CliniDocs

## 📋 Tabla de Contenidos

1. [Estructura del Proyecto](#estructura-del-proyecto)
2. [Arquitectura](#arquitectura)
3. [Convenciones de Código](#convenciones-de-código)
4. [Módulos](#módulos)
5. [Routing](#routing)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Componentes](#componentes)
9. [Estilos](#estilos)
10. [Testing](#testing)

---

## 📁 Estructura del Proyecto

```
src/
├── core/               # Configuración y utilidades centrales
│   ├── config/        # Archivos de configuración
│   ├── routes/        # Definición de rutas
│   ├── store/         # Estado global (Zustand)
│   └── types/         # Tipos TypeScript globales
│
├── modules/           # Módulos de la aplicación
│   ├── auth/          # Autenticación
│   ├── dashboard/     # Dashboard principal
│   ├── patients/      # Gestión de pacientes
│   ├── documents/     # Gestión de documentos
│   └── reports/       # Sistema de reportes
│
└── shared/            # Recursos compartidos
    ├── components/    # Componentes reutilizables
    ├── hooks/         # Custom hooks
    ├── services/      # Servicios API
    └── utils/         # Utilidades
```

### Principios de Organización

- **Modularidad**: Cada feature es un módulo independiente
- **Separación de responsabilidades**: Cada carpeta tiene un propósito específico
- **Reutilización**: Componentes y lógica compartida en `shared/`
- **Escalabilidad**: Fácil agregar nuevos módulos

---

## 🏗️ Arquitectura

### Flujo de Datos

```
User Interaction
    ↓
Component (UI)
    ↓
Hook (Business Logic)
    ↓
Service (API Call)
    ↓
Store (State Update)
    ↓
Component Re-render
```

### Capas de la Aplicación

1. **Presentation Layer**: Componentes React (UI)
2. **Business Logic Layer**: Custom Hooks
3. **Data Layer**: Services y Store
4. **Configuration Layer**: Core config

---

## 📝 Convenciones de Código

### Nomenclatura

#### Archivos y Carpetas

```
✅ PascalCase para componentes: LoginPage.tsx, UserCard.tsx
✅ camelCase para servicios: auth.service.ts, patients.service.ts
✅ camelCase para hooks: useAuth.ts, usePatients.ts
✅ kebab-case para estilos: custom-styles.css
✅ lowercase para config: api.config.ts, app.config.ts
```

#### Variables y Funciones

```typescript
// Componentes: PascalCase
const UserProfile = () => {};

// Funciones: camelCase
const fetchUserData = async () => {};

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:8000";

// Interfaces/Types: PascalCase
interface UserData {}
type ApiResponse = {};
```

### Estructura de Archivos

#### Componente Típico

```typescript
// Imports externos primero
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Imports internos después
import { useAuthStore } from "@core/store/auth.store";
import { Button } from "@shared/components/ui/Button";

// Types
interface Props {
  title: string;
}

// Componente
export const MyComponent = ({ title }: Props) => {
  // Hooks
  const navigate = useNavigate();
  const [state, setState] = useState();

  // Handlers
  const handleClick = () => {};

  // Effects
  useEffect(() => {}, []);

  // Render
  return <div>{title}</div>;
};
```

#### Service Típico

```typescript
import { apiService } from "@shared/services/api.service";
import { ENDPOINTS } from "@core/config/api.config";

export const myService = {
  getAll: async () => {
    const response = await apiService.get(ENDPOINTS.MY_RESOURCE);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiService.post(ENDPOINTS.MY_RESOURCE, data);
    return response.data;
  },
};
```

---

## 🎯 Módulos

### Anatomía de un Módulo

Cada módulo debe tener esta estructura:

```
module/
├── components/        # Componentes específicos del módulo
├── pages/            # Páginas del módulo
├── routes/           # Rutas del módulo
├── services/         # Servicios API del módulo
├── hooks/            # Hooks personalizados del módulo
└── types/            # Types TypeScript del módulo
```

### Crear un Nuevo Módulo

```bash
# 1. Crear estructura
mkdir -p src/modules/nuevo-modulo/{components,pages,routes,services,hooks,types}

# 2. Crear archivos base
touch src/modules/nuevo-modulo/types/index.ts
touch src/modules/nuevo-modulo/services/nuevo-modulo.service.ts
touch src/modules/nuevo-modulo/pages/NuevoModuloPage.tsx
touch src/modules/nuevo-modulo/routes/index.tsx
```

### Ejemplo: Módulo de Usuarios

**1. Types** (`types/index.ts`)

```typescript
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
}
```

**2. Service** (`services/usuarios.service.ts`)

```typescript
import { apiService } from "@shared/services/api.service";

export const usuariosService = {
  getAll: async () => {
    const response = await apiService.get("/usuarios/");
    return response.data;
  },
};
```

**3. Page** (`pages/UsuariosPage.tsx`)

```typescript
import { useEffect, useState } from "react";
import { usuariosService } from "../services/usuarios.service";

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    const data = await usuariosService.getAll();
    setUsuarios(data);
  };

  return <div>Usuarios</div>;
};
```

**4. Routes** (`routes/index.tsx`)

```typescript
import { Routes, Route } from "react-router-dom";
import { UsuariosPage } from "../pages/UsuariosPage";

export const UsuariosRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UsuariosPage />} />
    </Routes>
  );
};
```

**5. Registrar en AppRoutes** (`src/core/routes/index.tsx`)

```typescript
import { UsuariosRoutes } from "@modules/usuarios/routes";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* ... otras rutas */}
      <Route path="/usuarios/*" element={<UsuariosRoutes />} />
    </Routes>
  );
};
```

---

## 🛣️ Routing

### Estructura de Rutas

```typescript
// Rutas públicas
/login
/register
/forgot-password

// Rutas privadas (requieren autenticación)
/dashboard
/patients
/patients/:id
/documents
/documents/:id
/reports
```

### Route Protection

```typescript
// ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@core/store/auth.store";
import { MainLayout } from "@shared/components/layout/MainLayout";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};
```

### Navegación Programática

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Navegar a una ruta
navigate("/dashboard");

// Navegar con parámetros
navigate(`/patients/${patientId}`);

// Navegar con replace (no agrega al historial)
navigate("/login", { replace: true });

// Navegar hacia atrás
navigate(-1);
```

---

## 🗄️ State Management

### Zustand Store

```typescript
// Crear store
import { create } from "zustand";

interface MyState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useMyStore = create<MyState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// Usar en componente
import { useMyStore } from "@core/store/my.store";

const MyComponent = () => {
  const { count, increment } = useMyStore();

  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
};
```

### State Local vs Global

**Use Local State cuando:**

- Solo un componente necesita los datos
- Los datos no se comparten
- Datos temporales de UI

**Use Global State cuando:**

- Múltiples componentes necesitan los datos
- Datos del usuario autenticado
- Configuración de la app

---

## 🔌 API Integration

### Configuración

**api.config.ts**

```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  TIMEOUT: 30000,
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login/",
    LOGOUT: "/auth/logout/",
  },
  PATIENTS: {
    LIST: "/patients/",
    DETAIL: (id: string) => `/patients/${id}/`,
  },
};
```

### Service Base

```typescript
// api.service.ts
import axios from "axios";
import { API_CONFIG } from "@core/config/api.config";

class ApiService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request: agregar token
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response: manejar errores
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Refresh token o redirect a login
        }
        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string) {
    return this.axiosInstance.get<T>(url);
  }

  public post<T>(url: string, data?: any) {
    return this.axiosInstance.post<T>(url, data);
  }
}

export const apiService = new ApiService();
```

### Error Handling

```typescript
// En componente
try {
  const data = await patientsService.getAll();
  setPatients(data);
} catch (error: any) {
  if (error.response?.status === 404) {
    toast.error("No se encontraron pacientes");
  } else {
    toast.error("Error al cargar pacientes");
  }
  console.error("Error:", error);
}
```

---

## 🧩 Componentes

### Componentes Compartidos

Los componentes en `shared/components/` deben ser:

- **Reutilizables**: Usados en múltiples módulos
- **Genéricos**: No tienen lógica de negocio específica
- **Configurables**: Aceptan props para personalización

### Ejemplo: Button Component

```typescript
// shared/components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  type?: "button" | "submit";
}

export const Button = ({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
}: ButtonProps) => {
  const baseClasses = "px-4 py-2 rounded-lg transition-colors";
  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
};
```

### Layout Components

```typescript
// MainLayout.tsx
export const MainLayout = ({ children }) => {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
```

---

## 🎨 Estilos

### Tailwind CSS

Usamos Tailwind para estilos con clases utilitarias:

```typescript
// ✅ Bueno
<div className="bg-white rounded-lg shadow p-6">
  <h1 className="text-2xl font-bold mb-4">Título</h1>
</div>

// ❌ Evitar
<div style={{ backgroundColor: 'white', padding: '24px' }}>
  <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Título</h1>
</div>
```

### Clases Reutilizables

```css
/* index.css */
@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700;
  }

  .card {
    @apply bg-white rounded-lg shadow p-6;
  }

  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500;
  }
}
```

### Responsive Design

```typescript
// Mobile first
<div
  className="
  p-4              // mobile
  sm:p-6           // tablet
  lg:p-8           // desktop
"
>
  <div
    className="
    grid 
    grid-cols-1      // mobile: 1 columna
    md:grid-cols-2   // tablet: 2 columnas
    lg:grid-cols-4   // desktop: 4 columnas
    gap-4
  "
  >
    {/* contenido */}
  </div>
</div>
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Tests (Playwright)

```bash
npm install -D @playwright/test
```

```typescript
// e2e/login.spec.ts
import { test, expect } from "@playwright/test";

test("user can login", async ({ page }) => {
  await page.goto("http://localhost:5173/login");

  await page.fill('input[type="email"]', "admin@test.com");
  await page.fill('input[type="password"]', "admin123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("http://localhost:5173/dashboard");
});
```

---

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Testing
npm run test
npm run test:watch
npm run test:coverage

# E2E
npm run test:e2e
```

---

## 📦 Agregar Nueva Feature

### Checklist

- [ ] Crear módulo en `src/modules/`
- [ ] Definir types en `types/index.ts`
- [ ] Crear service en `services/`
- [ ] Crear páginas en `pages/`
- [ ] Crear rutas en `routes/`
- [ ] Registrar rutas en `core/routes/index.tsx`
- [ ] Agregar al sidebar si necesario
- [ ] Crear componentes específicos si necesario
- [ ] Agregar tests

---

## 🐛 Debugging

### React DevTools

```bash
# Instalar extensión de navegador
# Chrome: React Developer Tools
# Firefox: React DevTools
```

### Console Logs

```typescript
// Desarrollo
if (import.meta.env.DEV) {
  console.log("Debug info:", data);
}
```

### Network Debugging

```typescript
// Ver requests en api.service.ts
this.axiosInstance.interceptors.request.use((config) => {
  console.log("Request:", config.url, config.data);
  return config;
});

this.axiosInstance.interceptors.response.use((response) => {
  console.log("Response:", response.config.url, response.data);
  return response;
});
```

---

## 📚 Recursos

### Documentación Oficial

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)

### Herramientas

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)

---

## ✅ Best Practices

### Do's ✅

- Usar TypeScript para todo
- Componentes pequeños y enfocados
- Custom hooks para lógica reutilizable
- Nombres descriptivos
- Comentarios cuando sea necesario
- Manejo de errores en todos los requests
- Loading states
- Responsive design

### Don'ts ❌

- No usar `any` en TypeScript
- No componentes gigantes (>200 líneas)
- No lógica de negocio en componentes
- No inline styles
- No console.logs en producción
- No hardcodear valores
- No ignorar warnings

---

**Última actualización:** Día 3  
**Versión:** 1.0.0
