# 🤖 Guía Rápida del Chatbot de Ayuda - Frontend React

## 📖 Índice
- [¿Qué es?](#qué-es)
- [Características Principales](#características-principales)
- [Estructura del Sistema](#estructura-del-sistema)
- [Cómo Usar](#cómo-usar)
- [Integración en Páginas](#integración-en-páginas)
- [Agregar Nuevos Temas](#agregar-nuevos-temas)
- [Ejemplos de Código](#ejemplos-de-código)

---

## ¿Qué es?

El **Chatbot de Ayuda** es un asistente virtual integrado en CliniDocs que proporciona:
- ✅ Guías paso a paso personalizadas según el rol del usuario
- ✅ Búsqueda en tiempo real de temas de ayuda
- ✅ 14+ temas organizados en 9 categorías
- ✅ Acceso rápido a funciones comunes
- ✅ Interfaz moderna y responsive

---

## Características Principales

### 🎯 Adaptación Automática por Rol

El chatbot muestra solo los temas relevantes para cada usuario:

| Rol               | Ejemplo de Temas Visibles                                    |
|-------------------|-------------------------------------------------------------|
| **ASU**           | Todos los temas (14)                                        |
| **Admin TI**      | Crear usuarios, gestionar roles, configurar sistema (12)   |
| **Doctor**        | Crear historias, usar IA, gestionar pacientes (11)         |
| **Enfermera**     | Ver historias, registrar signos vitales (9)                 |
| **Recepcionista** | Registrar pacientes, agendar citas (6)                      |

### 📚 Categorías Disponibles

1. 🩺 **Historias Clínicas** - Crear y ver historias médicas
2. 📝 **Formularios** - Completar formularios clínicos
3. 🤖 **IA** - Predicción de diabetes, árboles de decisión
4. 🔐 **Permisos** - Comprender roles y accesos
5. 👥 **Pacientes** - Registrar y buscar pacientes
6. ⚙️ **Usuarios** - Gestión de usuarios (Admin)
7. 📁 **Documentos** - Subir y ver archivos DICOM
8. 📊 **Reportes** - Generar informes analíticos
9. ℹ️ **Uso General** - Navegación y notificaciones

---

## Estructura del Sistema

```
📦 Frontend (React + TypeScript)
│
├── 📂 src/modules/help/
│   ├── 📂 types/
│   │   └── help.types.ts          # Interfaces TypeScript
│   ├── 📂 data/
│   │   └── helpTopics.ts          # Base de datos de 14+ temas
│   ├── 📂 components/
│   │   ├── HelpChatButton.tsx     # Botón flotante
│   │   ├── HelpChatModal.tsx      # Modal principal
│   │   └── HelpTopicDetail.tsx    # Vista de detalle
│   └── README.md                   # Documentación completa
│
├── 📂 src/shared/components/layout/
│   └── MainLayout.tsx             # ✅ Ya integrado aquí
│
└── 📂 src/index.css               # ✅ Animaciones agregadas
```

---

## Cómo Usar

### Para Usuarios Finales

1. **Abrir el Chatbot**
   - Haz clic en el botón azul flotante con el ícono `?` en la esquina inferior derecha
   - Aparecerá en todas las páginas del sistema

2. **Buscar Ayuda**
   - **Búsqueda rápida**: Escribe en la barra de búsqueda (ej: "crear historia")
   - **Por categorías**: Haz clic en una de las 9 categorías coloridas
   - **Acciones rápidas**: Usa los botones de acceso directo

3. **Ver una Guía**
   - Haz clic en cualquier tema de la lista
   - Sigue los pasos numerados con iconos visuales
   - Usa el botón "Contactar Soporte" si necesitas más ayuda

4. **Navegar**
   - `Volver`: Regresa a la lista de temas
   - `X`: Cierra el chatbot
   - `Buscar`: Filtra temas en tiempo real

---

## Integración en Páginas

### ✅ Ya Integrado Globalmente

El chatbot **ya está integrado** en el `MainLayout`, por lo que aparece automáticamente en todas las páginas que usan este layout.

**Archivo**: `src/shared/components/layout/MainLayout.tsx`

```tsx
import HelpChatButton from "../../../modules/help/components/HelpChatButton";

export const MainLayout = ({ children }) => {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* ... sidebar, navbar, main content ... */}

      {/* Botón flotante de ayuda - Ya agregado */}
      <HelpChatButton variant="primary" position="bottom-right" />
    </div>
  );
};
```

### Páginas que Usan MainLayout (Chatbot Disponible)

- ✅ Dashboard
- ✅ Pacientes (lista, detalle, formulario)
- ✅ Historias Clínicas
- ✅ Formularios Clínicos
- ✅ Documentos
- ✅ IA / Predicción de Diabetes
- ✅ Reportes
- ✅ Usuarios (Admin)
- ✅ Configuración

### Páginas Públicas (Sin Chatbot)

- ❌ Login
- ❌ Registro
- ❌ Landing Page
- ❌ Activación de Cuenta

*Estas páginas no usan MainLayout, por lo que no muestran el chatbot.*

---

## Agregar Nuevos Temas

### Paso 1: Editar `helpTopics.ts`

**Archivo**: `src/modules/help/data/helpTopics.ts`

```typescript
import { HelpTopic, HelpCategory } from '../types/help.types';

export const helpTopics: HelpTopic[] = [
  // ... temas existentes

  // ===== NUEVO TEMA =====
  {
    id: 'agendar_cita',
    title: '¿Cómo agendar una cita?',
    description: 'Aprende a agendar citas para tus pacientes.',
    category: HelpCategory.PATIENTS,
    tags: ['cita', 'agendar', 'calendario', 'turno'],
    roles: ['Recepcionista', 'Doctor'], // Dejar vacío [] para todos los roles
    steps: [
      {
        title: 'Acceder al calendario',
        description: 'Desde el menú lateral, selecciona "Citas" o "Calendario".',
        iconName: 'FiCalendar',
      },
      {
        title: 'Seleccionar paciente',
        description: 'Busca al paciente en el campo de búsqueda.',
        iconName: 'FiSearch',
      },
      {
        title: 'Elegir fecha y hora',
        description: 'Selecciona la fecha y hora disponible en el calendario.',
        iconName: 'FiClock',
      },
      {
        title: 'Confirmar cita',
        description: 'Revisa los datos y presiona "Agendar Cita".',
        iconName: 'FiCheck',
      },
    ],
  },
];
```

### Paso 2: Elegir Ícono Apropiado

**Iconos Recomendados por Categoría**:

| Categoría             | Iconos Sugeridos                                      |
|-----------------------|------------------------------------------------------|
| Historias Clínicas    | `FiFileText`, `FiClipboard`, `FiBook`                |
| Formularios           | `FiEdit`, `FiCheckSquare`, `FiList`                  |
| IA                    | `FiBrain`, `FiActivity`, `FiTrendingUp`              |
| Permisos              | `FiShield`, `FiLock`, `FiKey`                        |
| Pacientes             | `FiUsers`, `FiUser`, `FiUserPlus`                    |
| Usuarios (Admin)      | `FiSettings`, `FiUserCheck`, `FiTag`                 |
| Documentos            | `FiFolder`, `FiFile`, `FiUpload`, `FiDownload`       |
| Reportes              | `FiBarChart`, `FiPieChart`, `FiTrendingUp`           |
| Uso General           | `FiInfo`, `FiHelpCircle`, `FiCompass`                |

**Ver todos los iconos**: https://react-icons.github.io/react-icons/icons/fi/

### Paso 3: Probar

1. Guarda el archivo `helpTopics.ts`
2. Recarga la aplicación
3. Abre el chatbot
4. Busca tu nuevo tema o navega por categorías

---

## Ejemplos de Código

### Ejemplo 1: Botón en Página con Otro FAB

Si tu página ya tiene un botón flotante principal, usa el botón mini:

```tsx
import React from 'react';
import HelpChatButton from '../../modules/help/components/HelpChatButton';

const PatientsListPage = () => {
  return (
    <div className="relative">
      {/* Contenido de la página */}
      <h1>Lista de Pacientes</h1>
      <div>{/* tabla de pacientes */}</div>

      {/* Botón principal para agregar paciente */}
      <button className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14">
        +
      </button>

      {/* Botón de ayuda mini en esquina opuesta */}
      <HelpChatButton variant="mini" position="bottom-left" />
    </div>
  );
};
```

### Ejemplo 2: Abrir Modal Programáticamente

Si quieres abrir el modal desde tu código (ej: botón "?" en el navbar):

```tsx
import React, { useState } from 'react';
import HelpChatModal from '../../modules/help/components/HelpChatModal';

const Navbar = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <nav>
      {/* ... otros elementos del navbar */}

      <button
        onClick={() => setIsHelpOpen(true)}
        className="text-gray-600 hover:text-blue-600"
      >
        ¿Necesitas ayuda?
      </button>

      <HelpChatModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </nav>
  );
};
```

### Ejemplo 3: Filtrar Temas por Rol en tu Código

```typescript
import { getTopicsByRole, searchTopics } from './data/helpTopics';
import { useAuthStore } from '../../core/store/authStore';

const MyComponent = () => {
  const { user } = useAuthStore();

  // Obtener todos los temas para el rol actual
  const topics = getTopicsByRole(user?.role?.name);

  // Buscar temas
  const results = searchTopics('diabetes', user?.role?.name);

  console.log('Temas disponibles:', topics.length);
  console.log('Resultados de búsqueda:', results);
};
```

### Ejemplo 4: Crear un Tooltip de Ayuda

```tsx
import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import { getTopicById } from '../../modules/help/data/helpTopics';

const FormFieldWithHelp = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const topic = getTopicById('create_medical_record');

  return (
    <div className="relative">
      <label>
        Motivo de Consulta
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="ml-2 text-blue-600"
        >
          <FiHelpCircle />
        </button>
      </label>

      {showTooltip && (
        <div className="absolute z-10 bg-white border rounded-lg shadow-lg p-4 w-64">
          <p className="text-sm">{topic?.description}</p>
        </div>
      )}

      <input type="text" className="w-full border rounded p-2" />
    </div>
  );
};
```

---

## ⚙️ Configuración Avanzada

### Cambiar Posición del Botón Globalmente

**Archivo**: `src/shared/components/layout/MainLayout.tsx`

```tsx
// Cambiar de esquina inferior derecha a inferior izquierda
<HelpChatButton variant="primary" position="bottom-left" />

// Cambiar a esquina superior
<HelpChatButton variant="primary" position="top-right" />
```

### Personalizar Colores de Categorías

**Archivo**: `src/modules/help/components/HelpChatModal.tsx`

```tsx
const categories = [
  { name: HelpCategory.MEDICAL_RECORDS, icon: FiFileText, color: 'bg-red-500' },
  { name: HelpCategory.FORMS, icon: FiBook, color: 'bg-orange-500' },
  { name: HelpCategory.AI, icon: FiBrain, color: 'bg-purple-500' },
  // Cambia 'bg-red-500' por otro color de Tailwind
];
```

### Cambiar Velocidad de Animaciones

**Archivo**: `src/index.css`

```css
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Cambiar duración de 0.3s a 0.5s para más lento */
.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}
```

---

## 🐛 Solución de Problemas Comunes

### Problema 1: El botón no aparece

**Posibles causas**:
- La página no usa `MainLayout`
- Hay un error de importación

**Solución**:
```tsx
// Asegúrate de que tu página use MainLayout
import { MainLayout } from '../../shared/components/layout/MainLayout';

const MyPage = () => {
  return (
    <MainLayout>
      {/* contenido */}
    </MainLayout>
  );
};
```

### Problema 2: No se muestran temas para mi rol

**Causa**: El rol del usuario no coincide con los roles configurados en `helpTopics.ts`

**Solución**:
- Verifica el nombre exacto del rol en tu base de datos
- Asegúrate de que los temas tengan `roles: ['NombreExacto']`
- O deja `roles: []` para que esté disponible para todos

### Problema 3: Iconos no se muestran

**Causa**: El nombre del ícono no existe en `react-icons/fi`

**Solución**:
- Verifica que uses nombres válidos: `FiUser`, `FiEdit`, `FiSave`
- No uses `Fi` al principio si ya está en la importación
- Consulta la lista completa: https://react-icons.github.io/react-icons/icons/fi/

### Problema 4: El modal no se cierra al hacer clic afuera

**Causa**: El overlay no tiene el evento `onClick`

**Solución**: Ya está implementado en `HelpChatModal.tsx`. Si el problema persiste, verifica que no haya un `z-index` superior bloqueando el overlay.

---

## 📊 Resumen Rápido

| Aspecto              | Detalles                                            |
|----------------------|-----------------------------------------------------|
| **Ubicación**        | Botón flotante esquina inferior derecha            |
| **Temas Totales**    | 14 guías completas                                  |
| **Categorías**       | 9 categorías coloridas                              |
| **Búsqueda**         | En tiempo real mientras escribes                    |
| **Animaciones**      | Slide-up y fade-in-scale                            |
| **Iconos**           | react-icons/fi (Feather Icons)                      |
| **Responsive**       | Sí, funciona en móvil, tablet y desktop             |
| **Roles**            | Filtrado automático según rol del usuario           |
| **Integración**      | Ya integrado en MainLayout                          |

---

## 🚀 Próximos Pasos Recomendados

1. ✅ **Prueba el chatbot**: Abre la aplicación y haz clic en el botón `?`
2. ✅ **Busca un tema**: Escribe "crear historia" en la búsqueda
3. ✅ **Navega por categorías**: Explora las diferentes categorías
4. ✅ **Agrega un tema nuevo**: Sigue la guía de "Agregar Nuevos Temas"
5. ✅ **Personaliza colores**: Cambia los colores de las categorías a tu gusto
6. ✅ **Recopila feedback**: Pregunta a los usuarios qué temas les gustaría ver

---

## 📞 Contacto y Soporte

- **Documentación Completa**: `src/modules/help/README.md`
- **Código Fuente**: `src/modules/help/`
- **Reportar Bugs**: Crea un issue en el repositorio del proyecto

---

**¡Listo para usar! 🎉**

El chatbot de ayuda ya está completamente integrado y funcional en tu aplicación CliniDocs.

