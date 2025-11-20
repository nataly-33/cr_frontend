# 🤖 Chatbot de Ayuda - Frontend React

## 📋 Descripción

El Chatbot de Ayuda es un asistente virtual integrado en CliniDocs que proporciona guías paso a paso y ayuda contextual para todos los usuarios del sistema. El chatbot se adapta automáticamente al rol del usuario, mostrando solo la información relevante para sus permisos y funcionalidades.

## ✨ Características

### 🎯 Adaptación por Rol
- **ASU (Super Admin)**: Acceso a toda la documentación del sistema
- **Administrador TI**: Guías de gestión de usuarios, roles, configuración
- **Doctor**: Historias clínicas, IA, formularios, gestión de pacientes
- **Enfermera**: Historias clínicas (vista), signos vitales, formularios básicos
- **Recepcionista**: Registro de pacientes, agendamiento, formularios básicos

### 📚 Categorías de Ayuda
1. **Historias Clínicas**: Crear, ver, editar historias médicas
2. **Formularios**: Completar formularios clínicos
3. **IA y Mejora de Imágenes**: Predicción de diabetes, árboles de decisión
4. **Permisos y Accesos**: Comprender roles y solicitar permisos
5. **Gestión de Pacientes**: Registrar y buscar pacientes
6. **Gestión de Usuarios**: Crear usuarios y asignar roles (Admin)
7. **Documentos**: Subir y visualizar documentos DICOM
8. **Reportes**: Generar reportes analíticos
9. **Uso General**: Navegación y funciones básicas

### 🔍 Funcionalidades
- ✅ Búsqueda en tiempo real de temas
- ✅ Filtrado por categorías con colores distintivos
- ✅ Guías paso a paso con iconos visuales
- ✅ Acciones rápidas para tareas comunes
- ✅ Interfaz responsive con animaciones suaves
- ✅ Modal deslizante desde abajo
- ✅ 14+ temas de ayuda configurados

## 🚀 Uso

### Abrir el Chatbot

El chatbot está integrado globalmente en el `MainLayout`, por lo que aparece en todas las páginas del sistema como un botón flotante azul en la esquina inferior derecha.

#### Clic en el Botón
1. Haz clic en el botón flotante con el ícono de ayuda (?)
2. Se abrirá un modal con el chatbot

### Buscar Ayuda

1. **Búsqueda por Texto**
   - Escribe tu pregunta en la barra de búsqueda
   - Los resultados se filtran en tiempo real
   - Busca por: "crear historia", "permisos", "diabetes", etc.

2. **Navegación por Categorías**
   - Selecciona una categoría del grid colorido
   - Ve todos los temas relacionados con esa categoría

3. **Acciones Rápidas**
   - Haz clic en cualquier acción rápida para ir directamente a la guía

### Ver Guía Detallada

1. Haz clic en cualquier tema de la lista
2. Se abrirá una vista detallada con:
   - Título y descripción del tema
   - Pasos numerados con instrucciones e iconos
   - Sección de contacto para soporte adicional

## 🏗️ Estructura de Archivos

```
src/modules/help/
├── types/
│   └── help.types.ts           # Tipos TypeScript
├── data/
│   └── helpTopics.ts           # Base de datos de temas (14+ temas)
├── components/
│   ├── HelpChatButton.tsx      # Botón flotante
│   ├── HelpChatModal.tsx       # Modal principal del chat
│   └── HelpTopicDetail.tsx     # Vista de detalle del tema
└── README.md                    # Esta documentación
```

## 🛠️ Integración

### Layout Principal (Ya Integrado)

El chatbot ya está integrado en `MainLayout.tsx`:

```tsx
import HelpChatButton from "../../../modules/help/components/HelpChatButton";

export const MainLayout = ({ children }) => {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* ... sidebar, navbar, content */}

      {/* Botón flotante de ayuda */}
      <HelpChatButton variant="primary" position="bottom-right" />
    </div>
  );
};
```

### Uso en Páginas Específicas

Si necesitas agregar el botón en una página fuera del MainLayout:

```tsx
import HelpChatButton from '../../modules/help/components/HelpChatButton';

const MyPage = () => {
  return (
    <div>
      {/* Tu contenido */}

      {/* Botón de ayuda mini en esquina inferior izquierda */}
      <HelpChatButton variant="mini" position="bottom-left" />
    </div>
  );
};
```

## 📝 Agregar Nuevos Temas de Ayuda

Para agregar nuevos temas, edita: `src/modules/help/data/helpTopics.ts`

```typescript
import { HelpTopic, HelpCategory } from '../types/help.types';

export const helpTopics: HelpTopic[] = [
  // ... temas existentes
  {
    id: 'mi_nuevo_tema',
    title: '¿Cómo hacer algo nuevo?',
    description: 'Aprende a realizar esta nueva funcionalidad.',
    category: HelpCategory.GENERAL_USAGE,
    tags: ['tag1', 'tag2', 'tag3'],
    roles: ['Doctor', 'Enfermera'], // Vacío = todos los roles
    steps: [
      {
        title: 'Paso 1',
        description: 'Descripción del primer paso.',
        iconName: 'FiPlus', // Nombre del ícono de react-icons/fi
      },
      {
        title: 'Paso 2',
        description: 'Descripción del segundo paso.',
        iconName: 'FiEdit',
      },
      // ... más pasos
    ],
  },
];
```

### Iconos Disponibles

Usa cualquier ícono de `react-icons/fi`. Los más comunes:

- **Usuarios**: `FiUser`, `FiUsers`, `FiUserPlus`, `FiUserCheck`
- **Acciones**: `FiPlus`, `FiEdit`, `FiSave`, `FiTrash`, `FiRefreshCw`
- **Navegación**: `FiArrowLeft`, `FiArrowRight`, `FiChevronRight`
- **Archivos**: `FiFile`, `FiFileText`, `FiFolder`, `FiPaperclip`
- **Búsqueda**: `FiSearch`, `FiFilter`, `FiSliders`
- **IA**: `FiBrain`, `FiActivity`, `FiBarChart`, `FiGitBranch`
- **Configuración**: `FiSettings`, `FiShield`, `FiLock`, `FiTag`
- **Comunicación**: `FiMail`, `FiBell`, `FiMessageCircle`
- **Estado**: `FiCheck`, `FiCheckCircle`, `FiX`, `FiInfo`
- **Herramientas**: `FiTool`, `FiImage`, `FiUpload`, `FiDownload`

Ver lista completa en: https://react-icons.github.io/react-icons/icons/fi/

## 🎨 Personalización

### Variantes del Botón

```tsx
// Botón principal (grande)
<HelpChatButton variant="primary" position="bottom-right" />

// Botón mini (pequeño, para páginas con múltiples botones flotantes)
<HelpChatButton variant="mini" position="bottom-left" />
```

### Posiciones Disponibles

```tsx
position="bottom-right"  // Esquina inferior derecha (por defecto)
position="bottom-left"   // Esquina inferior izquierda
position="top-right"     // Esquina superior derecha
position="top-left"      // Esquina superior izquierda
```

### Colores de Categorías

Edita en `HelpChatModal.tsx`:

```tsx
const categories = [
  { name: HelpCategory.MEDICAL_RECORDS, icon: FiFileText, color: 'bg-red-500' },
  { name: HelpCategory.FORMS, icon: FiBook, color: 'bg-orange-500' },
  { name: HelpCategory.AI, icon: FiBrain, color: 'bg-purple-500' },
  // ... más categorías
];
```

### Animaciones

Las animaciones están definidas en `src/index.css`:

```css
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

.animate-fade-in-scale {
  animation: fadeInScale 0.3s ease-out;
}
```

Puedes ajustar la duración y el efecto según prefieras.

## 🔧 API / Funciones Útiles

### Filtrar Temas por Rol

```typescript
import { getTopicsByRole } from './data/helpTopics';

const topics = getTopicsByRole('Doctor'); // Devuelve solo temas para Doctor
```

### Buscar Temas

```typescript
import { searchTopics } from './data/helpTopics';

const results = searchTopics('diabetes', 'Doctor'); // Busca "diabetes" en temas de Doctor
```

### Filtrar por Categoría

```typescript
import { getTopicsByCategory } from './data/helpTopics';
import { HelpCategory } from './types/help.types';

const topics = getTopicsByCategory(HelpCategory.AI, 'Doctor');
```

### Obtener Tema por ID

```typescript
import { getTopicById } from './data/helpTopics';

const topic = getTopicById('create_medical_record');
```

## 📱 Temas por Rol

| Rol                | Temas Disponibles |
|--------------------|-------------------|
| ASU                | 14 (todos)        |
| Administrador TI   | 12                |
| Doctor             | 11                |
| Enfermera          | 9                 |
| Recepcionista      | 6                 |

## 🐛 Troubleshooting

### El chatbot no muestra ningún tema
**Causa**: No hay temas configurados para el rol del usuario actual.
**Solución**: Verifica que los temas tengan el rol correcto o déjalos con `roles: []` para todos los roles.

### Los iconos no se muestran correctamente
**Causa**: El nombre del ícono no coincide con ningún ícono de react-icons/fi.
**Solución**: Verifica que el nombre del ícono exista en `react-icons/fi` y que esté importado en `HelpTopicDetail.tsx`.

### El botón flotante se superpone con otro elemento
**Causa**: Conflicto de posicionamiento con otros elementos flotantes.
**Solución**: Usa `variant="mini"` y/o cambia la `position` (ej: `position="bottom-left"`).

### Error: "Cannot read property 'role' of undefined"
**Causa**: El usuario no está autenticado o el store no está configurado correctamente.
**Solución**: Asegúrate de que `useAuthStore` esté funcionando correctamente y que el usuario esté autenticado.

## 📊 Estadísticas

- **Total de Temas**: 14 guías completas
- **Categorías**: 9 categorías principales
- **Roles Soportados**: 5 roles principales
- **Pasos Totales**: ~60 (promedio 4-5 por tema)
- **Líneas de Código**: ~1,500
- **Archivos**: 5 archivos principales

## 🚀 Futuras Mejoras

- [ ] Sincronización de temas desde backend/API
- [ ] Historial de búsquedas del usuario
- [ ] Temas favoritos
- [ ] Valoración de utilidad de las guías
- [ ] Videos tutoriales embed
- [ ] Chat en vivo con soporte
- [ ] Notificaciones de nuevas guías
- [ ] Modo offline con caché
- [ ] Tooltips contextuales en campos de formulario
- [ ] Integración con sistema de tickets de soporte

## 👥 Contribuir

Para agregar nuevas guías:
1. Identifica la necesidad del usuario
2. Crea el tema en `helpTopics.ts`
3. Asigna categoría, tags y roles apropiados
4. Escribe pasos claros, concisos y accionables
5. Agrega iconos visuales relevantes
6. Prueba con diferentes roles de usuario

## 📞 Soporte

Si necesitas ayuda con el chatbot:
- **Desarrolladores**: Revisa el código en `src/modules/help/`
- **Usuarios**: Usa el botón de ayuda flotante o contacta a tu Administrador TI

## 🎯 Ejemplo de Uso Completo

```tsx
import React from 'react';
import HelpChatButton from '../../modules/help/components/HelpChatButton';
import { useAuthStore } from '../../core/store/authStore';

const DiabetesPredictionPage = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6">
      <h1>Predicción de Diabetes con IA</h1>

      {/* Contenido de la página */}
      <div>
        {/* ... */}
      </div>

      {/* Botón de ayuda mini para no interferir con otros botones */}
      <HelpChatButton variant="mini" position="bottom-left" />
    </div>
  );
};

export default DiabetesPredictionPage;
```

---

**Versión**: 1.0.0
**Última actualización**: Noviembre 2025
**Autor**: Equipo CliniDocs
**Tecnologías**: React 18, TypeScript, Tailwind CSS, react-icons
