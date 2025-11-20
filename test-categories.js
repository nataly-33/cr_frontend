// Test script to debug category filtering

const HelpCategory = {
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
};

console.log('Testing category values:');
console.log('HelpCategory.MEDICAL_RECORDS =', HelpCategory.MEDICAL_RECORDS);
console.log('HelpCategory.FORMS =', HelpCategory.FORMS);
console.log('HelpCategory.AI =', HelpCategory.AI);

const topic1 = {
  category: HelpCategory.MEDICAL_RECORDS
};

const topic2 = {
  category: HelpCategory.FORMS
};

console.log('\nTopic categories:');
console.log('topic1.category =', topic1.category);
console.log('topic2.category =', topic2.category);

console.log('\nComparison test:');
console.log('topic1.category === HelpCategory.MEDICAL_RECORDS:', topic1.category === HelpCategory.MEDICAL_RECORDS);
console.log('topic1.category === "Historias Clínicas":', topic1.category === 'Historias Clínicas');
