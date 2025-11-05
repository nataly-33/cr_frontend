# 🛠️ Guía de Desarrollo - Frontend (ClinicRecords)

**Versión:** 1.0  
**Fecha:** 5 de Noviembre, 2025  
**Framework:** React 18 + TypeScript + Vite

---

## 📋 Tabla de Contenidos

1. [Configuración del Entorno](#configuración-del-entorno)
2. [Crear una Nueva Página](#crear-una-nueva-página)
3. [Crear un Componente UI](#crear-un-componente-ui)
4. [Crear un Servicio API](#crear-un-servicio-api)
5. [Crear un Store](#crear-un-store)
6. [Trabajar con Formularios](#trabajar-con-formularios)
7. [Agregar Traducciones](#agregar-traducciones)
8. [Estilos con TailwindCSS](#estilos-con-tailwindcss)
9. [Testing](#testing)
10. [Mejores Prácticas](#mejores-prácticas)
11. [Debugging](#debugging)
12. [Build y Deploy](#build-y-deploy)

---

## ⚙️ Configuración del Entorno

### 1. Prerequisitos

- Node.js 18+
- npm o yarn
- Git

### 2. Clonar e Instalar

```bash
cd clinic_records/cr_frontend
npm install
```

### 3. Variables de Entorno

Copia `.env.example` a `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=ClinicRecords
VITE_DEFAULT_LANGUAGE=es
```

### 4. Iniciar Desarrollo

```bash
npm run dev
# http://localhost:5173
```

---

## 📄 Crear una Nueva Página

### Paso 1: Crear el Archivo

```bash
# Estructura
src/modules/<module-name>/pages/<PageName>Page.tsx
```

**Ejemplo:** Crear página de Citas

```typescript
// src/modules/appointments/pages/AppointmentsListPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/Button";
import { Table } from "@/shared/components/Table";
import { appointmentsService } from "../services/appointmentsService";

export const AppointmentsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await appointmentsService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "patient_name", label: t("appointments.patient") },
    { key: "doctor_name", label: t("appointments.doctor") },
    { key: "date", label: t("appointments.date") },
    { key: "status", label: t("appointments.status") },
  ];

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("appointments.title")}</h1>
        <Button onClick={() => navigate("/appointments/new")}>
          {t("appointments.new")}
        </Button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <Table
          columns={columns}
          data={appointments}
          onRowClick={(row) => navigate(`/appointments/${row.id}`)}
        />
      )}
    </div>
  );
};
```

### Paso 2: Agregar Ruta

```typescript
// src/core/routes/index.tsx
import { AppointmentsListPage } from "@/modules/appointments/pages/AppointmentsListPage";

// Dentro de las rutas protegidas
<Route path="/appointments" element={<AppointmentsListPage />} />;
```

### Paso 3: Agregar al Menú (opcional)

```typescript
// src/shared/layouts/MainLayout.tsx
const menuItems = [
  { path: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
  { path: "/patients", label: "Pacientes", icon: <UsersIcon /> },
  { path: "/appointments", label: "Citas", icon: <CalendarIcon /> }, // ← Nuevo
];
```

---

## 🧩 Crear un Componente UI

### Componente Básico

```typescript
// src/shared/components/Card/Card.tsx
import React from "react";
import { cn } from "@/core/utils/classNames";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className,
  actions,
}) => {
  return (
    <div className={cn("bg-white rounded-lg shadow-md p-6", className)}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
```

### Componente con Estado

```typescript
// src/shared/components/Accordion/Accordion.tsx
import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg">
      <button
        className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{title}</span>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && <div className="p-4 border-t">{children}</div>}
    </div>
  );
};
```

### Exportar

```typescript
// src/shared/components/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Card } from "./Card";
export { Accordion } from "./Accordion";
// ... más componentes
```

**Uso:**

```typescript
import { Card, Accordion } from "@/shared/components";

<Card title="Información">
  <Accordion title="Detalles">Contenido aquí</Accordion>
</Card>;
```

---

## 🔌 Crear un Servicio API

### Paso 1: Crear el Servicio

```typescript
// src/modules/appointments/services/appointmentsService.ts
import { apiClient } from "@/core/api/client";

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  appointment_date: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  reason: string;
}

export interface AppointmentCreateData {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  reason: string;
}

export const appointmentsService = {
  // Listar todas las citas
  async getAll(params?: {
    patient_id?: string;
    doctor_id?: string;
    status?: string;
    date?: string;
  }): Promise<Appointment[]> {
    const response = await apiClient.get("/appointments/", { params });
    return response.data;
  },

  // Obtener por ID
  async getById(id: string): Promise<Appointment> {
    const response = await apiClient.get(`/appointments/${id}/`);
    return response.data;
  },

  // Crear
  async create(data: AppointmentCreateData): Promise<Appointment> {
    const response = await apiClient.post("/appointments/", data);
    return response.data;
  },

  // Actualizar
  async update(
    id: string,
    data: Partial<AppointmentCreateData>
  ): Promise<Appointment> {
    const response = await apiClient.patch(`/appointments/${id}/`, data);
    return response.data;
  },

  // Eliminar
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/appointments/${id}/`);
  },

  // Confirmar cita
  async confirm(id: string): Promise<Appointment> {
    const response = await apiClient.post(`/appointments/${id}/confirm/`);
    return response.data;
  },

  // Cancelar cita
  async cancel(id: string): Promise<Appointment> {
    const response = await apiClient.post(`/appointments/${id}/cancel/`);
    return response.data;
  },

  // Citas próximas
  async getUpcoming(): Promise<Appointment[]> {
    const response = await apiClient.get("/appointments/upcoming/");
    return response.data;
  },
};
```

### Paso 2: Usar en Componentes

```typescript
import { appointmentsService } from "../services/appointmentsService";

const MyComponent = () => {
  const loadData = async () => {
    try {
      const appointments = await appointmentsService.getAll();
      console.log(appointments);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ...
};
```

---

## 🗄️ Crear un Store

### Con Zustand

```typescript
// src/core/store/appointmentsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  appointmentsService,
  Appointment,
} from "@/modules/appointments/services/appointmentsService";

interface AppointmentsStore {
  // Estado
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  loading: boolean;
  error: string | null;

  // Acciones
  fetchAppointments: () => Promise<void>;
  fetchAppointmentById: (id: string) => Promise<void>;
  selectAppointment: (appointment: Appointment | null) => void;
  createAppointment: (data: any) => Promise<void>;
  updateAppointment: (id: string, data: any) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useAppointmentsStore = create<AppointmentsStore>((set, get) => ({
  // Estado inicial
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,

  // Listar
  fetchAppointments: async () => {
    set({ loading: true, error: null });
    try {
      const appointments = await appointmentsService.getAll();
      set({ appointments, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Obtener por ID
  fetchAppointmentById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const appointment = await appointmentsService.getById(id);
      set({ selectedAppointment: appointment, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  // Seleccionar
  selectAppointment: (appointment) => {
    set({ selectedAppointment: appointment });
  },

  // Crear
  createAppointment: async (data) => {
    set({ loading: true, error: null });
    try {
      const newAppointment = await appointmentsService.create(data);
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Actualizar
  updateAppointment: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await appointmentsService.update(id, data);
      set((state) => ({
        appointments: state.appointments.map((a) =>
          a.id === id ? updated : a
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Eliminar
  deleteAppointment: async (id) => {
    set({ loading: true, error: null });
    try {
      await appointmentsService.delete(id);
      set((state) => ({
        appointments: state.appointments.filter((a) => a.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Limpiar error
  clearError: () => set({ error: null }),
}));
```

### Usar el Store

```typescript
import { useAppointmentsStore } from "@/core/store/appointmentsStore";

const MyComponent = () => {
  // Seleccionar estado
  const appointments = useAppointmentsStore((state) => state.appointments);
  const loading = useAppointmentsStore((state) => state.loading);

  // Seleccionar acciones
  const fetchAppointments = useAppointmentsStore(
    (state) => state.fetchAppointments
  );
  const createAppointment = useAppointmentsStore(
    (state) => state.createAppointment
  );

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreate = async (data: any) => {
    await createAppointment(data);
    toast.success("Cita creada");
  };

  // ...
};
```

---

## 📋 Trabajar con Formularios

### Formulario con React Hook Form + Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/shared/components/Input";
import { Button } from "@/shared/components/Button";

// 1. Definir schema de validación
const appointmentSchema = z.object({
  patient_id: z.string().uuid("Paciente inválido"),
  doctor_id: z.string().uuid("Doctor inválido"),
  appointment_date: z.string().min(1, "Fecha requerida"),
  reason: z.string().min(10, "Mínimo 10 caracteres"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const AppointmentForm = () => {
  // 2. Configurar react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: "",
      doctor_id: "",
      appointment_date: "",
      reason: "",
    },
  });

  // 3. Handler de submit
  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await appointmentsService.create(data);
      toast.success("Cita creada exitosamente");
      reset();
    } catch (error) {
      toast.error("Error al crear cita");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Paciente"
        {...register("patient_id")}
        error={errors.patient_id?.message}
      />

      <Input
        label="Doctor"
        {...register("doctor_id")}
        error={errors.doctor_id?.message}
      />

      <Input
        label="Fecha"
        type="datetime-local"
        {...register("appointment_date")}
        error={errors.appointment_date?.message}
      />

      <Input
        label="Motivo"
        {...register("reason")}
        error={errors.reason?.message}
      />

      <Button type="submit" loading={isSubmitting}>
        Guardar
      </Button>
    </form>
  );
};
```

### Formulario con Select Personalizado

```typescript
import { Controller } from "react-hook-form";
import { Select } from "@/shared/components/Select";

const MyForm = () => {
  const { control } = useForm();

  return (
    <Controller
      name="patient_id"
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Select
          label="Paciente"
          options={patients.map((p) => ({
            value: p.id,
            label: p.full_name,
          }))}
          value={field.value}
          onChange={field.onChange}
          error={error?.message}
        />
      )}
    />
  );
};
```

---

## 🌍 Agregar Traducciones

### Paso 1: Agregar a archivos JSON

```json
// src/locales/es/translation.json
{
  "appointments": {
    "title": "Citas",
    "new": "Nueva Cita",
    "patient": "Paciente",
    "doctor": "Doctor",
    "date": "Fecha",
    "status": "Estado",
    "reason": "Motivo"
  }
}
```

```json
// src/locales/en/translation.json
{
  "appointments": {
    "title": "Appointments",
    "new": "New Appointment",
    "patient": "Patient",
    "doctor": "Doctor",
    "date": "Date",
    "status": "Status",
    "reason": "Reason"
  }
}
```

### Paso 2: Usar en Componentes

```typescript
import { useTranslation } from "react-i18next";

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("appointments.title")}</h1>
      <button>{t("appointments.new")}</button>
    </div>
  );
};
```

### Cambiar Idioma

```typescript
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>
  );
};
```

---

## 🎨 Estilos con TailwindCSS

### Clases Básicas

```tsx
// Layout
<div className="flex justify-between items-center">
<div className="grid grid-cols-3 gap-4">
<div className="container mx-auto px-4">

// Spacing
<div className="p-4">          {/* padding: 1rem */}
<div className="mx-auto">      {/* margin-left/right: auto */}
<div className="space-y-4">    {/* gap vertical */}

// Sizing
<div className="w-full h-screen">
<div className="max-w-xl">
<div className="min-h-[200px]">

// Colors
<div className="bg-blue-600 text-white">
<div className="hover:bg-gray-100">

// Typography
<h1 className="text-2xl font-bold">
<p className="text-sm text-gray-600">

// Borders
<div className="border border-gray-300 rounded-lg">
<div className="shadow-md">

// Responsive
<div className="md:flex md:justify-between">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Clases Personalizadas

```typescript
// src/core/utils/classNames.ts
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// Uso
<div
  className={cn(
    "base-class",
    isActive && "active-class",
    error && "error-class",
    className
  )}
/>;
```

---

## 🧪 Testing

### Test de Componente

```typescript
// src/shared/components/Button/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when loading", () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### Test de Hook

```typescript
// src/core/hooks/useDebounce.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  it("debounces value", async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    expect(result.current).toBe("initial");

    rerender({ value: "updated" });
    expect(result.current).toBe("initial"); // No actualizado aún

    await waitFor(() => expect(result.current).toBe("updated"), {
      timeout: 600,
    });
  });
});
```

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Con coverage
npm run test:coverage

# Watch mode
npm run test:watch

# E2E
npm run test:e2e
```

---

## ✅ Mejores Prácticas

### 1. Estructura de Archivos

```typescript
// ✅ BIEN - Organizado por módulo
src /
  modules /
  patients /
  pages /
  components /
  services /
  types /
  hooks /
  // ❌ MAL - Todo mezclado
  src /
  PatientsList.tsx;
PatientDetail.tsx;
patientsService.ts;
```

### 2. Nombres Descriptivos

```typescript
// ❌ MAL
const getData = () => {};
const data = [];

// ✅ BIEN
const fetchPatients = () => {};
const patientsList = [];
```

### 3. TypeScript

```typescript
// ✅ BIEN - Tipado explícito
interface Patient {
  id: string;
  name: string;
}

const patients: Patient[] = [];

// ❌ MAL - Sin tipos
const patients: any[] = [];
```

### 4. Custom Hooks

```typescript
// ✅ BIEN - Lógica reutilizable
const usePatients = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  return { patients, loading };
};

// Usar en múltiples componentes
const { patients, loading } = usePatients();
```

### 5. Manejo de Errores

```typescript
// ✅ BIEN
try {
  await appointmentsService.create(data);
  toast.success("Cita creada");
  navigate("/appointments");
} catch (error) {
  if (error.response?.status === 400) {
    toast.error("Datos inválidos");
  } else {
    toast.error("Error al crear cita");
  }
  console.error(error);
}
```

### 6. Loading States

```typescript
// ✅ BIEN
const [loading, setLoading] = useState(false);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await service.getData();
    setState(data);
  } finally {
    setLoading(false); // Siempre ejecuta
  }
};

if (loading) return <Loading />;
```

### 7. Evitar Re-renders

```typescript
// ✅ BIEN - Memorizar
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// ✅ BIEN - useMemo para cálculos costosos
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

// ✅ BIEN - useCallback para funciones
const handleClick = useCallback(() => {
  console.log(data);
}, [data]);
```

---

## 🐛 Debugging

### React DevTools

- Instalar extensión de Chrome/Firefox
- Inspeccionar componentes
- Ver props y estado
- Profiler para performance

### Console Logs Útiles

```typescript
// Tabla
console.table(patients);

// Grupo
console.group("API Call");
console.log("Request:", data);
console.log("Response:", response);
console.groupEnd();

// Tiempo
console.time("fetch");
await fetchData();
console.timeEnd("fetch");
```

### Network Tab

- Ver peticiones HTTP
- Headers y payload
- Response time
- Status codes

### Sourcemaps

Vite genera sourcemaps automáticamente en desarrollo, permitiendo debuggear TypeScript directamente en el navegador.

---

## 🚀 Build y Deploy

### Build para Producción

```bash
npm run build
```

Genera carpeta `dist/` con archivos optimizados.

### Preview del Build

```bash
npm run preview
```

### Deploy a Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Producción
vercel --prod
```

### Deploy a Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy

# Producción
netlify deploy --prod
```

### Variables de Entorno en Producción

En Vercel/Netlify, configura:

```
VITE_API_URL=https://api.clinicrecords.com
VITE_APP_NAME=ClinicRecords
```

---

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Tests
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e

# Analizar bundle
npm run build -- --mode analyze
```

---

## 📚 Recursos

- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Zustand](https://docs.pmnd.rs/zustand)

---

**¡Happy coding! 🎉**

---

**Última actualización:** 5 de Noviembre, 2025  
**Versión:** 1.0
