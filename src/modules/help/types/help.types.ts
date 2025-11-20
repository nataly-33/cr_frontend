/**
 * Tipos para el sistema de ayuda y chatbot
 */

export interface HelpStep {
  title: string;
  description: string;
  iconName?: string;
}

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  category: HelpCategory;
  tags: string[];
  roles: string[]; // Roles que pueden ver este tema (vacío = todos)
  steps: HelpStep[];
}

export const HelpCategory = {
  GENERAL_USAGE: 'Uso General',
  MEDICAL_RECORDS: 'Historias Clínicas',
  FORMS: 'Formularios',
  AI: 'IA y Mejora de Imágenes',
  PERMISSIONS: 'Permisos y Accesos',
  PATIENTS: 'Gestión de Pacientes',
  USERS: 'Gestión de Usuarios',
  SYSTEM: 'Configuración del Sistema',
  DOCUMENTS: 'Documentos',
  BILLING: 'Facturación',
  REPORTS: 'Reportes'
} as const;

export type HelpCategory = typeof HelpCategory[keyof typeof HelpCategory];

export interface HelpSearchResult {
  topics: HelpTopic[];
  query: string;
}

export interface CategoryInfo {
  name: HelpCategory;
  icon: string;
  color: string;
  description: string;
}
