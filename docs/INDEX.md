# 📚 Índice de Documentación - Frontend

Bienvenido a la documentación del frontend de **ClinicRecords**.

---

## 📖 Documentos Principales

### [REVISION.md](./REVISION.md) ⭐

**Estado del proyecto frontend, páginas implementadas y progreso**

- Estado general (95% completo)
- Sprint 1: 100% completo (19 páginas)
- Sprint 2: 60% en progreso
- Componentes UI (14/17)
- Servicios API (7/7)
- Stores (Zustand)

### [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md) ⭐

**Documentación técnica completa del frontend**

- Arquitectura del proyecto
- Estructura de carpetas
- Módulos (Auth, Dashboard, Patients, etc.)
- Componentes UI detallados
- Servicios y API
- Stores (Zustand)
- Rutas y navegación
- Formularios y validación
- Internacionalización (i18n)

### [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) ⭐

**Guía para desarrolladores frontend**

- Configuración del entorno
- Crear una nueva página
- Crear componentes UI
- Crear servicios API
- Crear stores con Zustand
- Trabajar con formularios (React Hook Form + Zod)
- Agregar traducciones (i18next)
- Estilos con TailwindCSS
- Testing (Vitest + Playwright)
- Build y deploy

### [CONTRIBUTING.md](./CONTRIBUTING.md)

**Guía para contribuir al proyecto**

---

## 📂 Guías Específicas (guides/)

### [RBAC_FRONTEND_GUIDE.md](./guides/RBAC_FRONTEND_GUIDE.md)

Sistema de permisos y control de acceso basado en roles

- Roles disponibles
- Cómo verificar permisos en componentes
- Rutas protegidas
- Ejemplos de uso

---

## 📦 Archivos Archivados (archive/)

Documentos antiguos mantenidos para referencia:

- `DASHBOARD_SETUP.md` - Setup anterior del dashboard
- `DOCS_US1_FRONTEND.md` - Documentación del Sprint 1

---

## 🎯 ¿Por Dónde Empezar?

### Nuevo en el Proyecto

1. Lee [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Sección "Configuración del Entorno"
2. Revisa [REVISION.md](./REVISION.md) para entender qué está implementado
3. Explora [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md) para detalles técnicos

### Agregar una Nueva Página

1. Consulta [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Sección "Crear una Nueva Página"
2. Sigue la estructura de módulos existentes (ej: `src/modules/patients/`)
3. Agrega la ruta en `src/core/routes/index.tsx`

### Crear un Componente UI

1. Revisa componentes existentes en `src/shared/components/`
2. Sigue las mejores prácticas en [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
3. Usa TypeScript para type-safety

### Integrar con API Backend

1. Crea un servicio en `src/modules/<module>/services/`
2. Usa el `apiClient` configurado en `src/core/api/client.ts`
3. Opcionalmente crea un store con Zustand

---

## 📝 Estructura del Proyecto

```
cr_frontend/
├── docs/
│   ├── INDEX.md                      # Este archivo
│   ├── REVISION.md                   # ⭐ Estado del proyecto
│   ├── DOCUMENTATION_GUIDE.md        # ⭐ Documentación técnica
│   ├── DEVELOPMENT_GUIDE.md          # ⭐ Guía para desarrolladores
│   ├── CONTRIBUTING.md               # Guía de contribución
│   ├── guides/
│   │   └── RBAC_FRONTEND_GUIDE.md
│   └── archive/
│       ├── DASHBOARD_SETUP.md
│       └── DOCS_US1_FRONTEND.md
├── src/
│   ├── core/                         # Funcionalidad core
│   │   ├── api/                      # Cliente API
│   │   ├── routes/                   # Rutas
│   │   ├── store/                    # Stores globales
│   │   ├── hooks/                    # Custom hooks
│   │   └── utils/                    # Utilidades
│   ├── modules/                      # Módulos de la app
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── clinical-records/
│   │   ├── documents/
│   │   ├── users/
│   │   ├── reports/
│   │   ├── notifications/
│   │   └── settings/
│   ├── shared/                       # Componentes compartidos
│   │   ├── components/               # Componentes UI
│   │   └── layouts/                  # Layouts
│   ├── locales/                      # Traducciones i18n
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🛠️ Tecnologías

- **React 18** - Librería UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Estilos
- **Zustand** - State management
- **React Router v6** - Navegación
- **React Hook Form** - Formularios
- **Zod** - Validación
- **Axios** - HTTP client
- **i18next** - Internacionalización
- **react-pdf** - Visualización de PDFs

---

## 🚀 Comandos Útiles

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

# Tests
npm run test
npm run test:coverage
npm run test:e2e
```

---

## 🔗 Enlaces Útiles

- **Aplicación:** http://localhost:5173
- **Backend API:** http://localhost:8000/api
- **Swagger UI:** http://localhost:8000/api/schema/swagger/

---

## 📊 Estado Actual

| Categoría      | Completo | Pendiente | %    |
| -------------- | -------- | --------- | ---- |
| Páginas        | 19/19    | 0/19      | 100% |
| Componentes UI | 14/17    | 3/17      | 82%  |
| Servicios API  | 7/7      | 0/7       | 100% |
| Stores         | 3/3      | 0/3       | 100% |

**Estado General:** ✅ **95% COMPLETO - Listo para MVP**

---

**Última actualización:** 5 de Noviembre, 2025
