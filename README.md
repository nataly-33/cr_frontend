# 🏥 ClinicRecords - Frontend (React + TypeScript + Vite)

**Sistema SaaS Multi-tenant para Gestión de Historias Clínicas y Documentos Médicos**

---

## 📘 Documentación Completa

**👉 Ver [docs/INDEX.md](./docs/INDEX.md) para el índice completo de documentación**

### 📖 Documentos Principales

| Documento                                                        | Propósito                                        | Audiencia       |
| ---------------------------------------------------------------- | ------------------------------------------------ | --------------- |
| **[docs/REVISION.md](./docs/REVISION.md)** ⭐                    | Estado del proyecto (95% completo)               | Todos           |
| **[docs/DOCUMENTATION_GUIDE.md](./docs/DOCUMENTATION_GUIDE.md)** | Documentación técnica completa                   | Desarrolladores |
| **[docs/DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md)**     | Guía para desarrollar nuevas páginas/componentes | Desarrolladores |
| **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)**               | Guía de contribución                             | Colaboradores   |

### 🔧 Guías Específicas

- **[docs/guides/RBAC_FRONTEND_GUIDE.md](./docs/guides/RBAC_FRONTEND_GUIDE.md)** - Sistema de permisos y roles

**👉 Recomendación:** Si eres nuevo, comienza con [docs/DEVELOPMENT_GUIDE.md](./docs/DEVELOPMENT_GUIDE.md)

---

## 🚀 Quick Start

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Backend corriendo en http://localhost:8000

### Instalación

```bash
npm install
```

### Variables de Entorno

Copia `.env.example` a `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=ClinicRecords
VITE_DEFAULT_LANGUAGE=es
```

### Desarrollo

```bash
npm run dev
# http://localhost:5173
```

### Build

```bash
npm run build
npm run preview
```

---

## 🛠️ Stack Tecnológico

- **React 18** - Librería UI
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Estilos utility-first
- **Zustand** - State management
- **React Router v6** - Navegación
- **React Hook Form + Zod** - Formularios y validación
- **Axios** - HTTP client
- **i18next** - Internacionalización (es/en)
- **react-pdf** - Visualización de PDFs

---

## 📁 Estructura del Proyecto

```
src/
├── core/                   # Funcionalidad core
│   ├── api/                # Cliente API
│   ├── routes/             # Rutas
│   ├── store/              # Stores globales
│   └── hooks/              # Custom hooks
├── modules/                # Módulos de la app
│   ├── auth/
│   ├── dashboard/
│   ├── patients/
│   ├── clinical-records/
│   ├── documents/
│   └── ...
├── shared/                 # Componentes compartidos
│   ├── components/         # Componentes UI
│   └── layouts/            # Layouts
└── locales/                # Traducciones i18n
```

---

## 📊 Estado del Proyecto

**95% COMPLETO - Listo para MVP**

- ✅ 19/19 Páginas implementadas
- ✅ 14/17 Componentes UI (82%)
- ✅ 7/7 Servicios API (100%)
- ✅ 3/3 Stores (100%)

Ver [docs/REVISION.md](./docs/REVISION.md) para detalles completos.

---

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build
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

## 🔗 Enlaces

- **Documentación:** [docs/INDEX.md](./docs/INDEX.md)
- **Backend API:** http://localhost:8000/api
- **Swagger UI:** http://localhost:8000/api/schema/swagger/

---

**Última actualización:** 5 de Noviembre, 2025

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
