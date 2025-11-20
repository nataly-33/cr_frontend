import type { HelpTopic } from '../types/help.types';
import { HelpCategory } from '../types/help.types';

/**
 * Base de datos local de temas de ayuda
 * Estos temas se filtran automáticamente según el rol del usuario
 */
export const helpTopics: HelpTopic[] = [
  // ===== HISTORIAS CLÍNICAS =====
  {
    id: 'create_medical_record',
    title: '¿Cómo crear una historia clínica?',
    description: 'Aprende a crear una nueva historia clínica para un paciente.',
    category: HelpCategory.MEDICAL_RECORDS,
    tags: ['historia', 'crear', 'paciente', 'médico'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a la lista de pacientes',
        description: 'Desde el menú lateral, selecciona "Pacientes".',
        iconName: 'FiUsers',
      },
      {
        title: 'Seleccionar el paciente',
        description: 'Busca y selecciona al paciente para el cual quieres crear la historia clínica.',
        iconName: 'FiUser',
      },
      {
        title: 'Crear nueva historia',
        description: 'En la página del paciente, presiona el botón "Nueva Historia Clínica".',
        iconName: 'FiPlus',
      },
      {
        title: 'Completar información',
        description: 'Llena todos los campos requeridos: motivo de consulta, antecedentes, examen físico, diagnóstico y tratamiento.',
        iconName: 'FiEdit',
      },
      {
        title: 'Guardar',
        description: 'Revisa la información y presiona "Guardar". La historia quedará registrada con tu nombre y fecha.',
        iconName: 'FiSave',
      },
    ],
  },

  {
    id: 'view_medical_history',
    title: '¿Cómo ver el historial médico de un paciente?',
    description: 'Accede al historial completo de historias clínicas de un paciente.',
    category: HelpCategory.MEDICAL_RECORDS,
    tags: ['historial', 'ver', 'consultar', 'paciente'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Buscar paciente',
        description: 'Accede a la sección de "Pacientes" desde el menú lateral.',
        iconName: 'FiSearch',
      },
      {
        title: 'Ver perfil del paciente',
        description: 'Haz clic sobre el paciente para ver su perfil completo.',
        iconName: 'FiUser',
      },
      {
        title: 'Acceder al historial',
        description: 'En el perfil del paciente, selecciona la pestaña "Historial Médico" para ver todas las consultas anteriores.',
        iconName: 'FiFileText',
      },
      {
        title: 'Ver detalles',
        description: 'Haz clic en cualquier historia clínica para ver sus detalles completos.',
        iconName: 'FiEye',
      },
    ],
  },

  // ===== FORMULARIOS =====
  {
    id: 'fill_forms',
    title: '¿Cómo llenar formularios médicos?',
    description: 'Guía para completar formularios de consentimiento, evolución, etc.',
    category: HelpCategory.FORMS,
    tags: ['formulario', 'llenar', 'completar', 'consentimiento'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a formularios',
        description: 'Desde el perfil del paciente, selecciona "Formularios Clínicos" en el menú.',
        iconName: 'FiFileText',
      },
      {
        title: 'Seleccionar tipo',
        description: 'Elige el tipo de formulario: consulta, triaje, prescripción, orden de laboratorio, etc.',
        iconName: 'FiList',
      },
      {
        title: 'Completar campos',
        description: 'Llena todos los campos obligatorios marcados con asterisco (*). Los opcionales pueden dejarse en blanco.',
        iconName: 'FiEdit',
      },
      {
        title: 'Adjuntar archivos',
        description: 'Si es necesario, adjunta documentos o imágenes relacionadas.',
        iconName: 'FiPaperclip',
      },
      {
        title: 'Guardar formulario',
        description: 'Presiona "Guardar" o "Enviar". El formulario quedará registrado en el expediente del paciente.',
        iconName: 'FiSave',
      },
    ],
  },

  // ===== IA Y MEJORA DE IMÁGENES =====
  {
    id: 'diabetes_prediction',
    title: '¿Cómo usar la predicción de diabetes con IA?',
    description: 'Utiliza la IA para predecir el riesgo de diabetes de un paciente.',
    category: HelpCategory.AI,
    tags: ['diabetes', 'predicción', 'ia', 'riesgo', 'análisis'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder al módulo de IA',
        description: 'En el menú lateral, selecciona "IA" > "Predicción de Diabetes".',
        iconName: 'FiBrain',
      },
      {
        title: 'Seleccionar paciente',
        description: 'Busca y selecciona al paciente que quieres analizar.',
        iconName: 'FiUser',
      },
      {
        title: 'Verificar datos',
        description: 'Asegúrate de que el paciente tenga datos clínicos completos (glucosa, presión, IMC, edad, etc.).',
        iconName: 'FiCheckSquare',
      },
      {
        title: 'Ejecutar predicción',
        description: 'Presiona "Analizar con IA" para generar la predicción.',
        iconName: 'FiActivity',
      },
      {
        title: 'Revisar resultados',
        description: 'La IA mostrará el porcentaje de riesgo, nivel (bajo/medio/alto), factores contribuyentes y recomendaciones.',
        iconName: 'FiBarChart',
      },
    ],
  },

  {
    id: 'decision_tree',
    title: '¿Cómo usar el árbol de decisión médico?',
    description: 'Utiliza el árbol de decisión interactivo para diagnóstico asistido.',
    category: HelpCategory.AI,
    tags: ['árbol', 'decisión', 'diagnóstico', 'ia'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder al árbol de decisión',
        description: 'En el menú, selecciona "IA" > "Árbol de Decisión".',
        iconName: 'FiGitBranch',
      },
      {
        title: 'Seleccionar categoría',
        description: 'Elige la categoría médica: cardiovascular, respiratorio, etc.',
        iconName: 'FiGrid',
      },
      {
        title: 'Responder preguntas',
        description: 'El sistema te guiará con preguntas. Responde basándote en los síntomas del paciente.',
        iconName: 'FiHelpCircle',
      },
      {
        title: 'Ver resultado',
        description: 'Al final, recibirás un diagnóstico sugerido y recomendaciones de tratamiento.',
        iconName: 'FiCheckCircle',
      },
    ],
  },

  // ===== PERMISOS =====
  {
    id: 'role_permissions',
    title: '¿Qué permisos tiene mi rol?',
    description: 'Comprende qué acciones puedes realizar según tu rol en el sistema.',
    category: HelpCategory.PERMISSIONS,
    tags: ['permisos', 'rol', 'acceso', 'privilegios'],
    roles: [],
    steps: [
      {
        title: 'ASU (Super Admin)',
        description: 'Acceso total al sistema. Gestión de tenants, usuarios globales y configuraciones del sistema.',
        iconName: 'FiShield',
      },
      {
        title: 'Administrador TI',
        description: 'Gestión completa de su tenant: usuarios, roles, módulos y configuraciones locales.',
        iconName: 'FiSettings',
      },
      {
        title: 'Doctor',
        description: 'Crear y ver historias clínicas, gestionar pacientes, usar IA, completar formularios médicos.',
        iconName: 'FiActivity',
      },
      {
        title: 'Enfermera',
        description: 'Ver historias clínicas, registrar signos vitales, completar formularios básicos.',
        iconName: 'FiHeart',
      },
      {
        title: 'Recepcionista',
        description: 'Registrar pacientes, agendar citas, gestionar documentos básicos.',
        iconName: 'FiCalendar',
      },
    ],
  },

  // ===== GESTIÓN DE PACIENTES =====
  {
    id: 'register_patient',
    title: '¿Cómo registrar un nuevo paciente?',
    description: 'Guía paso a paso para agregar un paciente al sistema.',
    category: HelpCategory.PATIENTS,
    tags: ['paciente', 'registrar', 'nuevo', 'agregar'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Pacientes',
        description: 'Desde el menú lateral, selecciona "Pacientes".',
        iconName: 'FiUsers',
      },
      {
        title: 'Nuevo Paciente',
        description: 'Presiona el botón "Nuevo Paciente" o el ícono "+".',
        iconName: 'FiUserPlus',
      },
      {
        title: 'Datos personales',
        description: 'Completa: nombres, apellidos, fecha de nacimiento, género, documento de identidad.',
        iconName: 'FiUser',
      },
      {
        title: 'Datos de contacto',
        description: 'Agrega: teléfono, email, dirección, contacto de emergencia.',
        iconName: 'FiPhone',
      },
      {
        title: 'Guardar',
        description: 'Verifica que todos los campos obligatorios estén completos y presiona "Guardar".',
        iconName: 'FiSave',
      },
    ],
  },

  {
    id: 'search_patient',
    title: '¿Cómo buscar un paciente?',
    description: 'Encuentra rápidamente a un paciente en el sistema.',
    category: HelpCategory.PATIENTS,
    tags: ['buscar', 'encontrar', 'paciente', 'filtrar'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Usar barra de búsqueda',
        description: 'En la sección "Pacientes", usa la barra de búsqueda en la parte superior.',
        iconName: 'FiSearch',
      },
      {
        title: 'Criterios de búsqueda',
        description: 'Puedes buscar por: nombre, apellido, documento de identidad o número de historia.',
        iconName: 'FiFilter',
      },
      {
        title: 'Filtros avanzados',
        description: 'Usa el botón de filtros para buscar por rango de edad, género o estado.',
        iconName: 'FiSliders',
      },
      {
        title: 'Seleccionar resultado',
        description: 'Haz clic sobre el paciente encontrado para ver su perfil completo.',
        iconName: 'FiMousePointer',
      },
    ],
  },

  // ===== GESTIÓN DE USUARIOS (Admin) =====
  {
    id: 'create_user',
    title: '¿Cómo crear un nuevo usuario?',
    description: 'Registra nuevos usuarios en el sistema (solo administradores).',
    category: HelpCategory.USERS,
    tags: ['usuario', 'crear', 'registrar', 'admin'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Usuarios',
        description: 'Desde el menú de administración, selecciona "Usuarios".',
        iconName: 'FiUsers',
      },
      {
        title: 'Nuevo Usuario',
        description: 'Presiona "Agregar Usuario" o el botón "+".',
        iconName: 'FiUserPlus',
      },
      {
        title: 'Datos del usuario',
        description: 'Completa: nombres, apellidos, email (que será su usuario), documento.',
        iconName: 'FiUser',
      },
      {
        title: 'Asignar rol',
        description: 'Selecciona el rol apropiado: Doctor, Enfermera, Recepcionista, etc.',
        iconName: 'FiTag',
      },
      {
        title: 'Contraseña temporal',
        description: 'El sistema generará una contraseña temporal que el usuario cambiará en su primer inicio.',
        iconName: 'FiLock',
      },
      {
        title: 'Guardar y notificar',
        description: 'Guarda el usuario. Se enviará un email con las credenciales de acceso.',
        iconName: 'FiMail',
      },
    ],
  },

  // ===== DOCUMENTOS =====
  {
    id: 'upload_documents',
    title: '¿Cómo subir documentos médicos?',
    description: 'Aprende a subir y gestionar documentos DICOM, PDF y otros archivos.',
    category: HelpCategory.DOCUMENTS,
    tags: ['documentos', 'subir', 'dicom', 'pdf'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Documentos',
        description: 'Desde el perfil del paciente, selecciona "Documentos".',
        iconName: 'FiFolder',
      },
      {
        title: 'Subir archivo',
        description: 'Presiona "Subir Documento" o arrastra archivos a la zona indicada.',
        iconName: 'FiUpload',
      },
      {
        title: 'Seleccionar tipo',
        description: 'Indica el tipo de documento: laboratorio, imágenes, informes, etc.',
        iconName: 'FiFileText',
      },
      {
        title: 'Agregar metadatos',
        description: 'Opcionalmente, agrega una descripción, fecha y etiquetas para facilitar la búsqueda.',
        iconName: 'FiTag',
      },
      {
        title: 'Confirmar subida',
        description: 'Presiona "Subir". El documento quedará disponible en el expediente del paciente.',
        iconName: 'FiCheckCircle',
      },
    ],
  },

  {
    id: 'view_dicom',
    title: '¿Cómo ver imágenes DICOM?',
    description: 'Utiliza el visor DICOM integrado para ver radiografías, TAC y resonancias.',
    category: HelpCategory.DOCUMENTS,
    tags: ['dicom', 'imágenes', 'radiografía', 'visor'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Documentos',
        description: 'En el perfil del paciente, ve a la sección "Documentos" o "Imágenes".',
        iconName: 'FiFolder',
      },
      {
        title: 'Seleccionar archivo DICOM',
        description: 'Haz clic en el archivo DICOM que deseas visualizar.',
        iconName: 'FiImage',
      },
      {
        title: 'Usar herramientas del visor',
        description: 'El visor incluye: zoom, contraste, brillo, mediciones, anotaciones.',
        iconName: 'FiTool',
      },
      {
        title: 'Guardar anotaciones',
        description: 'Puedes agregar marcas y comentarios que se guardarán con la imagen.',
        iconName: 'FiEdit',
      },
    ],
  },

  // ===== CONFIGURACIÓN DEL SISTEMA =====
  {
    id: 'system_settings',
    title: '¿Cómo configurar el sistema?',
    description: 'Ajusta las configuraciones generales del sistema CliniDocs.',
    category: HelpCategory.SYSTEM,
    tags: ['configuración', 'sistema', 'ajustes', 'settings'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Configuración del Sistema',
        description: 'Desde el menú principal, selecciona "Configuración" o el ícono de engranaje.',
        iconName: 'FiSettings',
      },
      {
        title: 'Configuración General',
        description: 'Ajusta: nombre de la institución, logo, zona horaria, formato de fecha.',
        iconName: 'FiGlobe',
      },
      {
        title: 'Notificaciones',
        description: 'Activa o desactiva notificaciones por email, SMS o push.',
        iconName: 'FiBell',
      },
      {
        title: 'Respaldos y Seguridad',
        description: 'Configura respaldos automáticos y políticas de seguridad.',
        iconName: 'FiShield',
      },
      {
        title: 'Guardar cambios',
        description: 'Presiona "Guardar Configuración". Los cambios se aplicarán al sistema.',
        iconName: 'FiSave',
      },
    ],
  },

  // ===== USO GENERAL =====
  {
    id: 'navigation',
    title: '¿Cómo navegar por la aplicación?',
    description: 'Conoce la estructura y navegación básica de CliniDocs.',
    category: HelpCategory.GENERAL_USAGE,
    tags: ['navegación', 'menú', 'uso', 'básico'],
    roles: [],
    steps: [
      {
        title: 'Menú lateral',
        description: 'El menú lateral izquierdo contiene todas las secciones principales del sistema.',
        iconName: 'FiMenu',
      },
      {
        title: 'Barra superior',
        description: 'En la barra superior encuentras: notificaciones, perfil de usuario y botón de ayuda.',
        iconName: 'FiLayout',
      },
      {
        title: 'Búsqueda global',
        description: 'Usa el campo de búsqueda en la parte superior para buscar pacientes o funciones rápidamente.',
        iconName: 'FiSearch',
      },
      {
        title: 'Breadcrumbs',
        description: 'Las migas de pan te muestran tu ubicación actual y te permiten retroceder fácilmente.',
        iconName: 'FiChevronRight',
      },
    ],
  },

  {
    id: 'notifications',
    title: '¿Cómo funcionan las notificaciones?',
    description: 'Gestiona y responde a notificaciones del sistema.',
    category: HelpCategory.GENERAL_USAGE,
    tags: ['notificaciones', 'alertas', 'avisos'],
    roles: [],
    steps: [
      {
        title: 'Acceder a notificaciones',
        description: 'Haz clic en el ícono de campana en la barra superior.',
        iconName: 'FiBell',
      },
      {
        title: 'Tipos de notificaciones',
        description: 'Recibirás alertas sobre: nuevas asignaciones, resultados, mensajes, actualizaciones.',
        iconName: 'FiInfo',
      },
      {
        title: 'Marcar como leída',
        description: 'Haz clic en una notificación para verla y marcarla como leída.',
        iconName: 'FiCheckCircle',
      },
      {
        title: 'Configurar preferencias',
        description: 'En tu perfil > Configuración, puedes personalizar qué notificaciones recibes.',
        iconName: 'FiSettings',
      },
    ],
  },

  // ===== REPORTES =====
  {
    id: 'generate_reports',
    title: '¿Cómo generar reportes?',
    description: 'Crea reportes estadísticos y analíticos del sistema.',
    category: HelpCategory.REPORTS,
    tags: ['reportes', 'estadísticas', 'analítica', 'informes'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Reportes',
        description: 'Desde el menú, selecciona "Reportes" o "Analítica".',
        iconName: 'FiBarChart2',
      },
      {
        title: 'Seleccionar tipo de reporte',
        description: 'Elige entre: pacientes atendidos, diagnósticos, evolución, tiempos de atención, etc.',
        iconName: 'FiFileText',
      },
      {
        title: 'Configurar filtros',
        description: 'Establece el rango de fechas, servicios, médicos o diagnósticos a incluir.',
        iconName: 'FiFilter',
      },
      {
        title: 'Generar reporte',
        description: 'Presiona "Generar". El sistema procesará la información.',
        iconName: 'FiRefreshCw',
      },
      {
        title: 'Exportar',
        description: 'Puedes exportar el reporte en PDF, Excel o CSV.',
        iconName: 'FiDownload',
      },
    ],
  },

  {
    id: 'view_analytics',
    title: '¿Cómo ver analíticas del sistema?',
    description: 'Visualiza gráficos y estadísticas en tiempo real.',
    category: HelpCategory.REPORTS,
    tags: ['analítica', 'gráficos', 'dashboard', 'estadísticas'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder al Dashboard de Analítica',
        description: 'Desde el menú, selecciona "Analítica" o "Dashboard".',
        iconName: 'FiTrendingUp',
      },
      {
        title: 'Ver métricas principales',
        description: 'El dashboard muestra: total de pacientes, consultas del mes, diagnósticos frecuentes.',
        iconName: 'FiActivity',
      },
      {
        title: 'Explorar gráficos',
        description: 'Interactúa con los gráficos de barras, líneas y pie charts para ver detalles.',
        iconName: 'FiBarChart',
      },
      {
        title: 'Filtrar por período',
        description: 'Selecciona el rango de fechas: hoy, semana, mes, año o personalizado.',
        iconName: 'FiCalendar',
      },
    ],
  },

  // ===== MÁS FORMULARIOS =====
  {
    id: 'triage_form',
    title: '¿Cómo completar el formulario de triaje?',
    description: 'Registra la clasificación inicial de urgencia del paciente.',
    category: HelpCategory.FORMS,
    tags: ['triaje', 'urgencia', 'clasificación', 'emergencia'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Triaje',
        description: 'En el perfil del paciente, selecciona "Formularios" > "Triaje".',
        iconName: 'FiAlertTriangle',
      },
      {
        title: 'Registrar signos vitales',
        description: 'Ingresa: presión arterial, frecuencia cardíaca, temperatura, saturación de oxígeno.',
        iconName: 'FiActivity',
      },
      {
        title: 'Evaluar síntomas',
        description: 'Describe los síntomas principales y tiempo de evolución.',
        iconName: 'FiFileText',
      },
      {
        title: 'Asignar nivel de urgencia',
        description: 'Clasifica según escala: I (Resucitación), II (Emergencia), III (Urgente), IV (Menos urgente), V (No urgente).',
        iconName: 'FiAlertCircle',
      },
      {
        title: 'Guardar triaje',
        description: 'El triaje quedará registrado y el paciente será priorizado en la cola de atención.',
        iconName: 'FiSave',
      },
    ],
  },

  {
    id: 'prescription_form',
    title: '¿Cómo crear una receta médica?',
    description: 'Genera recetas electrónicas con prescripciones médicas.',
    category: HelpCategory.FORMS,
    tags: ['receta', 'prescripción', 'medicamentos', 'fármacos'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Prescripciones',
        description: 'En la historia clínica, selecciona "Nueva Prescripción" o "Receta".',
        iconName: 'FiFileText',
      },
      {
        title: 'Buscar medicamento',
        description: 'Escribe el nombre del medicamento. El sistema autocompletará con sugerencias.',
        iconName: 'FiSearch',
      },
      {
        title: 'Especificar dosis',
        description: 'Indica: dosis, frecuencia (cada X horas), duración del tratamiento.',
        iconName: 'FiEdit',
      },
      {
        title: 'Agregar indicaciones',
        description: 'Escribe instrucciones especiales: "Tomar con alimentos", "Evitar alcohol", etc.',
        iconName: 'FiInfo',
      },
      {
        title: 'Generar receta',
        description: 'Presiona "Generar Receta". Podrás imprimirla o enviarla por email al paciente.',
        iconName: 'FiPrinter',
      },
    ],
  },

  {
    id: 'lab_order_form',
    title: '¿Cómo solicitar exámenes de laboratorio?',
    description: 'Crea órdenes de laboratorio para tus pacientes.',
    category: HelpCategory.FORMS,
    tags: ['laboratorio', 'exámenes', 'análisis', 'orden'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Órdenes de Laboratorio',
        description: 'En la historia clínica, selecciona "Órdenes" > "Laboratorio".',
        iconName: 'FiActivity',
      },
      {
        title: 'Seleccionar exámenes',
        description: 'Marca los exámenes requeridos: hemograma, glucosa, perfil lipídico, etc.',
        iconName: 'FiCheckSquare',
      },
      {
        title: 'Agregar indicaciones',
        description: 'Especifica si requiere ayuno, hora específica u otras indicaciones.',
        iconName: 'FiAlertCircle',
      },
      {
        title: 'Generar orden',
        description: 'Presiona "Generar Orden". La orden se imprimirá o enviará electrónicamente.',
        iconName: 'FiPrinter',
      },
    ],
  },

  {
    id: 'imaging_order',
    title: '¿Cómo solicitar estudios de imagen?',
    description: 'Ordena radiografías, ecografías, TAC o resonancias.',
    category: HelpCategory.FORMS,
    tags: ['imagen', 'radiografía', 'ecografía', 'tac', 'resonancia'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Órdenes de Imagen',
        description: 'En la historia clínica, selecciona "Órdenes" > "Imagen".',
        iconName: 'FiImage',
      },
      {
        title: 'Seleccionar tipo de estudio',
        description: 'Elige: radiografía, ecografía, tomografía (TAC), resonancia magnética (RM).',
        iconName: 'FiGrid',
      },
      {
        title: 'Especificar región anatómica',
        description: 'Indica la zona a estudiar: tórax, abdomen, miembro inferior, etc.',
        iconName: 'FiTarget',
      },
      {
        title: 'Agregar justificación clínica',
        description: 'Describe el motivo del estudio y sospecha diagnóstica.',
        iconName: 'FiFileText',
      },
      {
        title: 'Generar orden',
        description: 'La orden se generará y se enviará al servicio de radiología.',
        iconName: 'FiSend',
      },
    ],
  },

  // ===== CONFIGURACIÓN Y SISTEMA =====
  {
    id: 'change_password',
    title: '¿Cómo cambiar mi contraseña?',
    description: 'Actualiza tu contraseña de acceso al sistema.',
    category: HelpCategory.GENERAL_USAGE,
    tags: ['contraseña', 'password', 'seguridad', 'cambiar'],
    roles: [],
    steps: [
      {
        title: 'Acceder a tu perfil',
        description: 'Haz clic en tu nombre o foto de perfil en la barra superior.',
        iconName: 'FiUser',
      },
      {
        title: 'Ir a Configuración',
        description: 'Selecciona "Configuración" o "Ajustes".',
        iconName: 'FiSettings',
      },
      {
        title: 'Cambiar contraseña',
        description: 'Busca la sección "Seguridad" y haz clic en "Cambiar contraseña".',
        iconName: 'FiLock',
      },
      {
        title: 'Ingresar contraseñas',
        description: 'Escribe tu contraseña actual, luego la nueva contraseña dos veces.',
        iconName: 'FiKey',
      },
      {
        title: 'Guardar cambios',
        description: 'Presiona "Actualizar". Deberás iniciar sesión nuevamente con la nueva contraseña.',
        iconName: 'FiCheck',
      },
    ],
  },

  {
    id: 'update_profile',
    title: '¿Cómo actualizar mi perfil?',
    description: 'Edita tu información personal y foto de perfil.',
    category: HelpCategory.GENERAL_USAGE,
    tags: ['perfil', 'información', 'datos', 'foto'],
    roles: [],
    steps: [
      {
        title: 'Acceder a tu perfil',
        description: 'Haz clic en tu nombre o foto en la barra superior.',
        iconName: 'FiUser',
      },
      {
        title: 'Editar información',
        description: 'Haz clic en "Editar Perfil" para modificar: nombre, email, teléfono.',
        iconName: 'FiEdit',
      },
      {
        title: 'Cambiar foto',
        description: 'Haz clic en tu foto actual y selecciona una nueva imagen desde tu dispositivo.',
        iconName: 'FiCamera',
      },
      {
        title: 'Guardar cambios',
        description: 'Presiona "Guardar". Los cambios se aplicarán inmediatamente.',
        iconName: 'FiSave',
      },
    ],
  },

  {
    id: 'theme_settings',
    title: '¿Cómo cambiar el tema de la aplicación?',
    description: 'Personaliza la apariencia: tema claro, oscuro o de colores.',
    category: HelpCategory.GENERAL_USAGE,
    tags: ['tema', 'apariencia', 'colores', 'dark mode'],
    roles: [],
    steps: [
      {
        title: 'Acceder a Configuración',
        description: 'Haz clic en tu perfil > Configuración.',
        iconName: 'FiSettings',
      },
      {
        title: 'Ir a Apariencia',
        description: 'Busca la sección "Apariencia" o "Tema".',
        iconName: 'FiEye',
      },
      {
        title: 'Seleccionar tema',
        description: 'Elige entre: Claro, Oscuro, Azul, Verde u otros temas disponibles.',
        iconName: 'FiSun',
      },
      {
        title: 'Aplicar cambios',
        description: 'El tema se aplicará automáticamente. Puedes cambiarlo cuando quieras.',
        iconName: 'FiCheck',
      },
    ],
  },

  // ===== GESTIÓN DE ROLES Y PERMISOS (ADMIN) =====
  {
    id: 'create_role',
    title: '¿Cómo crear un rol personalizado?',
    description: 'Crea roles con permisos específicos para tu institución.',
    category: HelpCategory.USERS,
    tags: ['rol', 'crear', 'permisos', 'admin'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Roles',
        description: 'Desde el menú de administración, selecciona "Roles".',
        iconName: 'FiShield',
      },
      {
        title: 'Nuevo Rol',
        description: 'Presiona "Crear Rol" o el botón "+".',
        iconName: 'FiPlus',
      },
      {
        title: 'Nombrar el rol',
        description: 'Asigna un nombre descriptivo: "Médico Especialista", "Asistente Administrativo", etc.',
        iconName: 'FiEdit',
      },
      {
        title: 'Asignar permisos',
        description: 'Marca las casillas de los módulos y acciones que este rol podrá realizar.',
        iconName: 'FiCheckSquare',
      },
      {
        title: 'Guardar rol',
        description: 'Presiona "Guardar". Ahora podrás asignar este rol a usuarios.',
        iconName: 'FiSave',
      },
    ],
  },

  {
    id: 'assign_role',
    title: '¿Cómo asignar un rol a un usuario?',
    description: 'Cambia o asigna roles a usuarios existentes.',
    category: HelpCategory.USERS,
    tags: ['rol', 'asignar', 'usuario', 'permisos'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Usuarios',
        description: 'Desde el menú de administración, selecciona "Usuarios".',
        iconName: 'FiUsers',
      },
      {
        title: 'Buscar usuario',
        description: 'Encuentra al usuario cuyo rol quieres cambiar.',
        iconName: 'FiSearch',
      },
      {
        title: 'Editar usuario',
        description: 'Haz clic en el botón de editar (lápiz) junto al nombre del usuario.',
        iconName: 'FiEdit',
      },
      {
        title: 'Cambiar rol',
        description: 'En el campo "Rol", selecciona el nuevo rol del menú desplegable.',
        iconName: 'FiTag',
      },
      {
        title: 'Guardar cambios',
        description: 'Presiona "Guardar". El usuario tendrá los nuevos permisos al volver a iniciar sesión.',
        iconName: 'FiSave',
      },
    ],
  },

  {
    id: 'deactivate_user',
    title: '¿Cómo desactivar un usuario?',
    description: 'Bloquea el acceso de un usuario sin eliminar sus datos.',
    category: HelpCategory.USERS,
    tags: ['desactivar', 'bloquear', 'usuario', 'suspender'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Usuarios',
        description: 'Desde el menú de administración, selecciona "Usuarios".',
        iconName: 'FiUsers',
      },
      {
        title: 'Buscar usuario',
        description: 'Encuentra al usuario que quieres desactivar.',
        iconName: 'FiSearch',
      },
      {
        title: 'Abrir opciones',
        description: 'Haz clic en el menú de tres puntos o botón de opciones.',
        iconName: 'FiMoreVertical',
      },
      {
        title: 'Desactivar',
        description: 'Selecciona "Desactivar usuario". El usuario no podrá iniciar sesión.',
        iconName: 'FiUserX',
      },
      {
        title: 'Confirmar',
        description: 'Confirma la acción. Podrás reactivar al usuario en cualquier momento.',
        iconName: 'FiAlertCircle',
      },
    ],
  },

  // ===== FACTURACIÓN =====
  {
    id: 'view_billing',
    title: '¿Cómo ver mi facturación?',
    description: 'Consulta el estado de tu suscripción y facturas.',
    category: HelpCategory.BILLING,
    tags: ['facturación', 'suscripción', 'pago', 'facturas'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Facturación',
        description: 'Desde el menú, selecciona "Facturación" o "Suscripción".',
        iconName: 'FiCreditCard',
      },
      {
        title: 'Ver plan actual',
        description: 'Verás tu plan actual, fecha de renovación y métodos de pago.',
        iconName: 'FiInfo',
      },
      {
        title: 'Historial de pagos',
        description: 'Haz clic en "Historial de Pagos" para ver todas tus facturas.',
        iconName: 'FiClock',
      },
      {
        title: 'Descargar factura',
        description: 'Haz clic en el ícono de descarga junto a cada factura para obtener el PDF.',
        iconName: 'FiDownload',
      },
    ],
  },

  {
    id: 'update_payment_method',
    title: '¿Cómo actualizar mi método de pago?',
    description: 'Cambia o agrega tarjetas de crédito/débito.',
    category: HelpCategory.BILLING,
    tags: ['pago', 'tarjeta', 'método', 'actualizar'],
    roles: [], // Disponible para todos
    steps: [
      {
        title: 'Acceder a Facturación',
        description: 'Desde el menú, selecciona "Facturación".',
        iconName: 'FiCreditCard',
      },
      {
        title: 'Métodos de pago',
        description: 'Busca la sección "Métodos de Pago".',
        iconName: 'FiDollarSign',
      },
      {
        title: 'Agregar método',
        description: 'Haz clic en "Agregar Tarjeta" e ingresa los datos de tu tarjeta.',
        iconName: 'FiPlus',
      },
      {
        title: 'Establecer como principal',
        description: 'Marca la nueva tarjeta como "Método de pago principal".',
        iconName: 'FiCheckCircle',
      },
      {
        title: 'Guardar',
        description: 'Los futuros cobros se realizarán con el nuevo método de pago.',
        iconName: 'FiSave',
      },
    ],
  },
];

/**
 * Filtra los temas de ayuda según el rol del usuario
 */
export const getTopicsByRole = (userRole?: string): HelpTopic[] => {
  if (!userRole) {
    return helpTopics.filter(topic => topic.roles.length === 0);
  }

  return helpTopics.filter(topic =>
    topic.roles.length === 0 || topic.roles.includes(userRole)
  );
};

/**
 * Busca temas de ayuda por query
 */
export const searchTopics = (query: string, userRole?: string): HelpTopic[] => {
  const lowerQuery = query.toLowerCase();
  const filteredByRole = getTopicsByRole(userRole);

  return filteredByRole.filter(topic =>
    topic.title.toLowerCase().includes(lowerQuery) ||
    topic.description.toLowerCase().includes(lowerQuery) ||
    topic.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Obtiene temas por categoría
 */
export const getTopicsByCategory = (category: HelpCategory, userRole?: string): HelpTopic[] => {
  const filteredByRole = getTopicsByRole(userRole);
  return filteredByRole.filter(topic => topic.category === category);
};

/**
 * Obtiene un tema por ID
 */
export const getTopicById = (id: string): HelpTopic | undefined => {
  return helpTopics.find(topic => topic.id === id);
};
