# 📚 Guía de Documentación Técnica - Frontend (ClinicRecords)

**Versión:** 1.0  
**Fecha:** 5 de Noviembre, 2025  
**Framework:** React 18 + TypeScript + Vite

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Tecnologías Utilizadas](#tecnologías-utilizadas)
5. [Módulos](#módulos)
6. [Componentes UI](#componentes-ui)
7. [Servicios y API](#servicios-y-api)
8. [Stores (Zustand)](#stores-zustand)
9. [Rutas y Navegación](#rutas-y-navegación)
10. [Formularios y Validación](#formularios-y-validación)
11. [Internacionalización](#internacionalización)
12. [Estilos y Theming](#estilos-y-theming)
13. [Autenticación y Autorización](#autenticación-y-autorización)
14. [Manejo de Errores](#manejo-de-errores)
15. [Performance](#performance)
16. [Testing](#testing)

---

## 🎯 Introducción

Este documento es la guía técnica completa del frontend de **ClinicRecords**, una aplicación SaaS multi-tenant para gestión de historias clínicas y documentos médicos.

### Características Principales

- **React 18** con TypeScript para type-safety
- **Vite** para desarrollo rápido y build optimizado
- **TailwindCSS** para estilos utility-first
- **Zustand** para manejo de estado global
- **React Router v6** para navegación
- **React Hook Form + Zod** para formularios y validación
- **Axios** para peticiones HTTP
- **i18next** para internacionalización (es/en)

---

## 🏗️ Arquitectura del Proyecto

### Arquitectura de Capas

```
┌─────────────────────────────────────┐
│         Presentación (UI)           │
│  Componentes, Páginas, Layouts      │
├─────────────────────────────────────┤
│      Estado Global (Stores)         │
│  Zustand: auth, patients, etc       │
├─────────────────────────────────────┤
│       Lógica de Negocio             │
│  Hooks, Utils, Validators           │
├─────────────────────────────────────┤
│      Capa de Datos (API)            │
│  Services, API Client, Interceptors │
├─────────────────────────────────────┤
│         Backend (Django)            │
│  REST API con autenticación JWT     │
└─────────────────────────────────────┘
```

### Flujo de Datos

```
Componente → Action (Store) → Service (API) → Backend
                ↓
            State Update
                ↓
            Re-render
```

---

## 📁 Estructura de Carpetas

```
cr_frontend/
├── public/                         # Archivos estáticos
│   ├── favicon.ico
│   └── logo.png
├── src/
│   ├── assets/                     # Imágenes, iconos, fuentes
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── core/                       # Funcionalidad core
│   │   ├── api/                    # Configuración API
│   │   │   ├── client.ts           # Cliente Axios
│   │   │   ├── interceptors.ts     # Interceptors
│   │   │   └── endpoints.ts        # URLs de endpoints
│   │   ├── routes/                 # Configuración de rutas
│   │   │   ├── index.tsx           # Rutas principales
│   │   │   └── ProtectedRoute.tsx  # Rutas protegidas
│   │   ├── store/                  # Stores globales
│   │   │   ├── authStore.ts
│   │   │   ├── patientsStore.ts
│   │   │   └── notificationsStore.ts
│   │   ├── hooks/                  # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── usePagination.ts
│   │   ├── utils/                  # Utilidades
│   │   │   ├── formatters.ts       # Formateo de datos
│   │   │   ├── validators.ts       # Validaciones
│   │   │   └── constants.ts        # Constantes
│   │   └── types/                  # Tipos TypeScript
│   │       ├── user.ts
│   │       ├── patient.ts
│   │       └── document.ts
│   ├── locales/                    # Traducciones i18n
│   │   ├── en/
│   │   │   └── translation.json
│   │   ├── es/
│   │   │   └── translation.json
│   │   └── i18n.ts                 # Configuración i18n
│   ├── modules/                    # Módulos de la app
│   │   ├── auth/                   # Autenticación
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── components/
│   │   │   └── services/
│   │   │       └── authService.ts
│   │   ├── dashboard/              # Dashboard
│   │   │   ├── pages/
│   │   │   │   └── DashboardPage.tsx
│   │   │   └── components/
│   │   ├── patients/               # Pacientes
│   │   │   ├── pages/
│   │   │   │   ├── PatientsListPage.tsx
│   │   │   │   ├── PatientDetailPage.tsx
│   │   │   │   └── PatientFormPage.tsx
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   │   └── patientsService.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── clinical-records/       # Historias clínicas
│   │   ├── documents/              # Documentos
│   │   ├── users/                  # Usuarios
│   │   ├── reports/                # Reportes
│   │   ├── notifications/          # Notificaciones
│   │   └── settings/               # Configuración
│   ├── shared/                     # Componentes compartidos
│   │   ├── components/             # Componentes UI
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Table/
│   │   │   ├── Modal/
│   │   │   └── ...
│   │   ├── layouts/                # Layouts
│   │   │   ├── MainLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── EmptyLayout.tsx
│   │   └── hooks/                  # Hooks compartidos
│   ├── App.tsx                     # Componente raíz
│   ├── App.css                     # Estilos globales
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Estilos base + Tailwind
├── docs/                           # Documentación
│   ├── REVISION.md
│   ├── DOCUMENTATION_GUIDE.md      # Este archivo
│   └── DEVELOPMENT_GUIDE.md
├── .env                            # Variables de entorno
├── .env.example                    # Ejemplo de .env
├── .gitignore
├── eslint.config.js                # Configuración ESLint
├── index.html                      # HTML base
├── package.json
├── postcss.config.js               # PostCSS
├── tailwind.config.js              # Tailwind CSS
├── tsconfig.json                   # TypeScript config
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts                  # Vite config
└── README.md
```

---

## 🛠️ Tecnologías Utilizadas

### Core

| Tecnología | Versión | Propósito   |
| ---------- | ------- | ----------- |
| React      | 18.3.1  | Librería UI |
| TypeScript | 5.5.3   | Type safety |
| Vite       | 5.4.2   | Build tool  |

### UI y Estilos

| Tecnología  | Versión | Propósito              |
| ----------- | ------- | ---------------------- |
| TailwindCSS | 3.4.1   | Utility-first CSS      |
| Heroicons   | 2.1.1   | Iconos                 |
| Headless UI | 2.1.0   | Componentes accesibles |

### Estado y Datos

| Tecnología  | Versión | Propósito               |
| ----------- | ------- | ----------------------- |
| Zustand     | 4.5.0   | State management        |
| Axios       | 1.7.2   | HTTP client             |
| React Query | 5.0.0   | Server state (opcional) |

### Formularios

| Tecnología      | Versión | Propósito              |
| --------------- | ------- | ---------------------- |
| React Hook Form | 7.51.0  | Gestión de formularios |
| Zod             | 3.22.4  | Validación de schemas  |

### Navegación

| Tecnología   | Versión | Propósito |
| ------------ | ------- | --------- |
| React Router | 6.22.0  | Routing   |

### Internacionalización

| Tecnología    | Versión | Propósito      |
| ------------- | ------- | -------------- |
| i18next       | 23.10.0 | i18n           |
| react-i18next | 14.0.5  | React bindings |

### Documentos

| Tecnología | Versión  | Propósito         |
| ---------- | -------- | ----------------- |
| react-pdf  | 7.7.1    | Visualización PDF |
| pdfjs-dist | 3.11.174 | PDF.js            |

### Testing

| Tecnología      | Versión | Propósito         |
| --------------- | ------- | ----------------- |
| Vitest          | 1.3.1   | Unit testing      |
| Testing Library | 14.2.1  | Testing utilities |
| Playwright      | 1.42.0  | E2E testing       |

---

## 📦 Módulos

### 1. Auth (Autenticación)

**Ruta:** `src/modules/auth/`

#### Páginas

##### LoginPage.tsx

**Ruta:** `/login`

**Descripción:** Página de inicio de sesión con email y contraseña.

**Funcionalidades:**

- Formulario de login con validación
- Manejo de errores
- Redirección automática según rol
- Persistencia de sesión

**Código clave:**

```typescript
// src/modules/auth/pages/LoginPage.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/core/store/authStore";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Credenciales inválidas");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />
      <Input
        label="Contraseña"
        type="password"
        {...register("password")}
        error={errors.password?.message}
      />
      <Button type="submit">Iniciar Sesión</Button>
    </form>
  );
};
```

#### Servicios

##### authService.ts

**Descripción:** Maneja autenticación con el backend.

**Métodos:**

```typescript
// src/modules/auth/services/authService.ts
import { apiClient } from "@/core/api/client";

interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export const authService = {
  // Login
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post("/auth/login/", {
      email,
      password,
    });
    return response.data;
  },

  // Logout
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout/");
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<string> {
    const response = await apiClient.post("/auth/refresh/", {
      refresh: refreshToken,
    });
    return response.data.access;
  },

  // Obtener usuario actual
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get("/auth/me/");
    return response.data;
  },

  // Cambiar contraseña
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.post("/auth/password/change/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },
};
```

#### Store

```typescript
// src/core/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/modules/auth/services/authService";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  refreshAccessToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await authService.login(email, password);
        set({
          user: response.user,
          accessToken: response.access,
          refreshToken: response.refresh,
          isAuthenticated: true,
        });

        // Guardar token en localStorage para el interceptor
        localStorage.setItem("access_token", response.access);
        localStorage.setItem("refresh_token", response.refresh);
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      },

      setUser: (user) => set({ user }),

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error("No refresh token");

        const newAccessToken = await authService.refreshToken(refreshToken);
        set({ accessToken: newAccessToken });
        localStorage.setItem("access_token", newAccessToken);
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
```

---

### 2. Dashboard

**Ruta:** `src/modules/dashboard/`

#### DashboardPage.tsx

**Ruta:** `/dashboard`

**Descripción:** Página principal con métricas y accesos rápidos.

**Secciones:**

1. **Cards de Métricas** - Total pacientes, documentos, citas
2. **Actividad Reciente** - Últimas acciones
3. **Accesos Rápidos** - Botones a funciones comunes
4. **Gráficos** (pendiente) - Visualización de datos

**Código:**

```typescript
// src/modules/dashboard/pages/DashboardPage.tsx
export const DashboardPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [patients, documents, appointments] = await Promise.all([
      patientsService.getStats(),
      documentsService.getStats(),
      appointmentsService.getStats(),
    ]);

    setStats({
      totalPatients: patients.total,
      totalDocuments: documents.total,
      upcomingAppointments: appointments.upcoming,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title={t("dashboard.totalPatients")}
        value={stats?.totalPatients}
        icon={<UsersIcon />}
        color="blue"
      />
      <StatsCard
        title={t("dashboard.totalDocuments")}
        value={stats?.totalDocuments}
        icon={<DocumentIcon />}
        color="green"
      />
      <StatsCard
        title={t("dashboard.upcomingAppointments")}
        value={stats?.upcomingAppointments}
        icon={<CalendarIcon />}
        color="purple"
      />

      <div className="col-span-3">
        <RecentActivity />
      </div>
    </div>
  );
};
```

---

### 3. Patients (Pacientes)

**Ruta:** `src/modules/patients/`

#### Páginas

##### PatientsListPage.tsx

**Ruta:** `/patients`

**Funcionalidades:**

- Lista de pacientes con tabla
- Búsqueda por nombre, documento, email
- Filtros por género, edad
- Paginación
- Crear nuevo paciente
- Ver detalle
- Exportar a Excel/PDF

```typescript
// src/modules/patients/pages/PatientsListPage.tsx
export const PatientsListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PatientFilters>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    loadPatients();
  }, [debouncedSearch, filters, pagination.page]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await patientsService.getAll({
        search: debouncedSearch,
        ...filters,
        page: pagination.page,
        page_size: pagination.pageSize,
      });
      setPatients(data.results);
    } catch (error) {
      toast.error(t("errors.loadPatients"));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "document_number", label: t("patients.document") },
    { key: "full_name", label: t("patients.name") },
    { key: "email", label: t("patients.email") },
    { key: "phone", label: t("patients.phone") },
    { key: "gender", label: t("patients.gender") },
  ];

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("patients.title")}</h1>
        <Button onClick={() => navigate("/patients/new")}>
          {t("patients.new")}
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={t("patients.search")}
        />
        <FilterButton filters={filters} onChange={setFilters} />
        <ExportButton onExport={handleExport} />
      </div>

      {loading ? (
        <Loading />
      ) : (
        <Table
          columns={columns}
          data={patients}
          onRowClick={(patient) => navigate(`/patients/${patient.id}`)}
        />
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={Math.ceil(patients.length / pagination.pageSize)}
        onPageChange={(page) => setPagination({ ...pagination, page })}
      />
    </div>
  );
};
```

##### PatientDetailPage.tsx

**Ruta:** `/patients/:id`

**Funcionalidades:**

- Información completa del paciente
- Historia clínica
- Documentos asociados
- Citas
- Acciones: Editar, Eliminar, Ver historia

```typescript
// src/modules/patients/pages/PatientDetailPage.tsx
export const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatient();
  }, [id]);

  const loadPatient = async () => {
    try {
      const data = await patientsService.getById(id!);
      setPatient(data);
    } catch (error) {
      toast.error(t("errors.loadPatient"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!patient) return <NotFound />;

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">{patient.full_name}</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/patients/${id}/edit`)}>
            {t("common.edit")}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title={t("patients.personalInfo")}>
          <dl>
            <dt>{t("patients.document")}</dt>
            <dd>{patient.document_number}</dd>

            <dt>{t("patients.email")}</dt>
            <dd>{patient.email}</dd>

            <dt>{t("patients.phone")}</dt>
            <dd>{patient.phone}</dd>

            <dt>{t("patients.dateOfBirth")}</dt>
            <dd>{formatDate(patient.date_of_birth)}</dd>
          </dl>
        </Card>

        <Card title={t("patients.medicalInfo")}>
          <Button onClick={() => navigate(`/patients/${id}/clinical-record`)}>
            {t("patients.viewClinicalRecord")}
          </Button>
        </Card>
      </div>

      <Card title={t("patients.documents")} className="mt-6">
        <DocumentsList patientId={id} />
      </Card>
    </div>
  );
};
```

##### PatientFormPage.tsx

**Rutas:** `/patients/new`, `/patients/:id/edit`

**Funcionalidades:**

- Crear nuevo paciente
- Editar paciente existente
- Validación con Zod
- Campos: nombre, apellido, documento, email, teléfono, fecha nacimiento, género, dirección

```typescript
// src/modules/patients/pages/PatientFormPage.tsx
const patientSchema = z.object({
  first_name: z.string().min(2, "Mínimo 2 caracteres"),
  last_name: z.string().min(2, "Mínimo 2 caracteres"),
  document_number: z.string().min(6, "Documento inválido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  date_of_birth: z.string(),
  gender: z.enum(["M", "F", "O"]),
  address: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export const PatientFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    if (isEdit) {
      loadPatient();
    }
  }, [id]);

  const loadPatient = async () => {
    const patient = await patientsService.getById(id!);
    Object.keys(patient).forEach((key) => {
      setValue(key as any, patient[key as keyof Patient]);
    });
  };

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (isEdit) {
        await patientsService.update(id!, data);
        toast.success(t("patients.updated"));
      } else {
        await patientsService.create(data);
        toast.success(t("patients.created"));
      }
      navigate("/patients");
    } catch (error) {
      toast.error(t("errors.savePatient"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? t("patients.edit") : t("patients.new")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("patients.firstName")}
          {...register("first_name")}
          error={errors.first_name?.message}
        />

        <Input
          label={t("patients.lastName")}
          {...register("last_name")}
          error={errors.last_name?.message}
        />

        <Input
          label={t("patients.document")}
          {...register("document_number")}
          error={errors.document_number?.message}
        />

        <Input
          label={t("patients.email")}
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label={t("patients.phone")}
          type="tel"
          {...register("phone")}
          error={errors.phone?.message}
        />

        <Input
          label={t("patients.dateOfBirth")}
          type="date"
          {...register("date_of_birth")}
          error={errors.date_of_birth?.message}
        />

        <Select
          label={t("patients.gender")}
          options={[
            { value: "M", label: t("patients.male") },
            { value: "F", label: t("patients.female") },
            { value: "O", label: t("patients.other") },
          ]}
          {...register("gender")}
          error={errors.gender?.message}
        />

        <Input
          label={t("patients.address")}
          {...register("address")}
          error={errors.address?.message}
          className="col-span-2"
        />
      </div>

      <div className="flex gap-2 mt-6">
        <Button type="submit">{t("common.save")}</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/patients")}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
};
```

#### Servicios

```typescript
// src/modules/patients/services/patientsService.ts
import { apiClient } from "@/core/api/client";

export const patientsService = {
  // Listar pacientes
  async getAll(params?: {
    search?: string;
    gender?: string;
    page?: number;
    page_size?: number;
  }) {
    const response = await apiClient.get("/patients/", { params });
    return response.data;
  },

  // Obtener por ID
  async getById(id: string): Promise<Patient> {
    const response = await apiClient.get(`/patients/${id}/`);
    return response.data;
  },

  // Crear
  async create(data: PatientCreateData): Promise<Patient> {
    const response = await apiClient.post("/patients/", data);
    return response.data;
  },

  // Actualizar
  async update(id: string, data: Partial<PatientCreateData>): Promise<Patient> {
    const response = await apiClient.patch(`/patients/${id}/`, data);
    return response.data;
  },

  // Eliminar
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/patients/${id}/`);
  },

  // Buscar
  async search(query: string) {
    const response = await apiClient.get("/patients/search/", {
      params: { q: query },
    });
    return response.data;
  },

  // Estadísticas
  async getStats() {
    const response = await apiClient.get("/patients/stats/");
    return response.data;
  },

  // Exportar
  async exportToExcel() {
    const response = await apiClient.get("/patients/export/", {
      responseType: "blob",
    });
    return response.data;
  },
};
```

#### Tipos

```typescript
// src/modules/patients/types/index.ts
export interface Patient {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  document_number: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  gender: "M" | "F" | "O";
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientCreateData {
  first_name: string;
  last_name: string;
  document_number: string;
  email: string;
  phone?: string;
  date_of_birth: string;
  gender: "M" | "F" | "O";
  address?: string;
}

export interface PatientFilters {
  gender?: string;
  age_min?: number;
  age_max?: number;
}
```

---

### 4. Documents (Documentos)

**Ruta:** `src/modules/documents/`

#### Componentes Clave

##### DocumentContentViewer.tsx

**Descripción:** Visualiza contenido JSON estructurado cuando no hay archivo físico.

```typescript
// src/modules/documents/components/DocumentContentViewer.tsx
interface DocumentContentViewerProps {
  content: any;
  type: string;
}

export const DocumentContentViewer: React.FC<DocumentContentViewerProps> = ({
  content,
  type,
}) => {
  if (!content) return <p>No hay contenido disponible</p>;

  const renderConsultation = (data: any) => (
    <div className="space-y-4">
      <Section title="Información General">
        <Field label="Fecha" value={data.date} />
        <Field label="Paciente" value={data.patient_name} />
        <Field label="Doctor" value={data.doctor_name} />
      </Section>

      <Section title="Motivo de Consulta">
        <p>{data.reason}</p>
      </Section>

      <Section title="Diagnóstico">
        <p>{data.diagnosis}</p>
      </Section>

      <Section title="Tratamiento">
        <p>{data.treatment}</p>
      </Section>

      {data.observations && (
        <Section title="Observaciones">
          <p>{data.observations}</p>
        </Section>
      )}
    </div>
  );

  const renderLabResult = (data: any) => (
    <div className="space-y-4">
      <Section title="Información del Examen">
        <Field label="Tipo" value={data.exam_type} />
        <Field label="Fecha" value={data.date} />
      </Section>

      <Section title="Resultados">
        <table className="w-full">
          <thead>
            <tr>
              <th>Parámetro</th>
              <th>Resultado</th>
              <th>Valor de Referencia</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((result: any, index: number) => (
              <tr key={index}>
                <td>{result.parameter}</td>
                <td>{result.value}</td>
                <td>{result.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );

  const renderPrescription = (data: any) => (
    <div className="space-y-4">
      <Section title="Información">
        <Field label="Paciente" value={data.patient_name} />
        <Field label="Doctor" value={data.doctor_name} />
        <Field label="Fecha" value={data.date} />
      </Section>

      <Section title="Medicamentos">
        {data.medications.map((med: any, index: number) => (
          <Card key={index} className="mb-2">
            <h4 className="font-bold">{med.name}</h4>
            <p>Dosis: {med.dosage}</p>
            <p>Frecuencia: {med.frequency}</p>
            <p>Duración: {med.duration}</p>
            {med.instructions && <p>Instrucciones: {med.instructions}</p>}
          </Card>
        ))}
      </Section>
    </div>
  );

  switch (type) {
    case "consultation":
      return renderConsultation(content);
    case "lab_result":
      return renderLabResult(content);
    case "prescription":
      return renderPrescription(content);
    default:
      return <pre>{JSON.stringify(content, null, 2)}</pre>;
  }
};
```

---

## 🎨 Componentes UI

### Button

```typescript
// src/shared/components/Button/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = "rounded font-medium transition-colors";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent hover:bg-gray-100",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    (loading || disabled) && "opacity-50 cursor-not-allowed",
    className
  );

  return (
    <button className={classes} disabled={loading || disabled} {...props}>
      {loading && <Spinner className="mr-2" />}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
```

### Input

```typescript
// src/shared/components/Input/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-3 py-2 border rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
```

### Table

```typescript
// src/shared/components/Table/Table.tsx
interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  loading,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey as keyof T];
      const bValue = b[sortKey as keyof T];

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  if (loading) return <Loading />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() =>
                  column.sortable && handleSort(String(column.key))
                }
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && (
                    <SortIcon
                      active={sortKey === column.key}
                      order={sortOrder}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn("hover:bg-gray-50", onRowClick && "cursor-pointer")}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render
                    ? column.render(row[column.key as keyof T], row)
                    : String(row[column.key as keyof T] || "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔌 API Client

### Configuración

```typescript
// src/core/api/client.ts
import axios from "axios";
import { useAuthStore } from "@/core/store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Agregar token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Agregar tenant ID si está disponible
    const tenantId = localStorage.getItem("tenant_id");
    if (tenantId) {
      config.headers["X-Tenant-ID"] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Manejar errores y refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expirado - intentar refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem("access_token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh falló - logout
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 🛣️ Rutas

### Configuración

```typescript
// src/core/routes/index.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// Layouts
import { MainLayout } from "@/shared/layouts/MainLayout";
import { AuthLayout } from "@/shared/layouts/AuthLayout";

// Pages
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
// ... más imports

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/patients" element={<PatientsListPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/patients/new" element={<PatientFormPage />} />
        <Route path="/patients/:id/edit" element={<PatientFormPage />} />

        {/* ... más rutas */}
      </Route>

      {/* Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
```

### ProtectedRoute

```typescript
// src/core/routes/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !hasPermission(user, permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  if (user.role?.name === "ASU") return true; // Admin tiene todos los permisos

  return (
    user.role?.permissions?.some(
      (p) => p.codename === permission || p.codename === "*.*"
    ) || false
  );
}
```

---

## 📋 Formularios y Validación

### React Hook Form + Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema
const schema = z.object({
  first_name: z.string().min(2, "Mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  age: z.number().min(18, "Debe ser mayor de edad"),
});

type FormData = z.infer<typeof schema>;

// En el componente
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(schema),
});

const onSubmit = (data: FormData) => {
  console.log(data);
};
```

---

**Continuación en siguiente parte...**
