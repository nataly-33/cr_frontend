import React from 'react';
import { FiArrowLeft, FiX, FiMail, FiBook } from 'react-icons/fi';
import * as FiIcons from 'react-icons/fi';
import { getTopicById } from '../data/helpTopics';

interface HelpTopicDetailProps {
  topicId: string;
  onBack: () => void;
  onClose: () => void;
}

const HelpTopicDetail: React.FC<HelpTopicDetailProps> = ({ topicId, onBack, onClose }) => {
  const topic = getTopicById(topicId);

  if (!topic) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Tema no encontrado</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:text-blue-700">
          Volver
        </button>
      </div>
    );
  }

  const getIcon = (iconName?: string) => {
    if (!iconName) return FiBook;
    // @ts-ignore - Dynamic icon loading
    return FiIcons[iconName] || FiBook;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Uso General': 'from-gray-600 to-gray-500',
      'Historias Clínicas': 'from-red-600 to-red-500',
      'Formularios': 'from-orange-600 to-orange-500',
      'IA y Mejora de Imágenes': 'from-purple-600 to-purple-500',
      'Permisos y Accesos': 'from-green-600 to-green-500',
      'Gestión de Pacientes': 'from-blue-600 to-blue-500',
      'Gestión de Usuarios': 'from-indigo-600 to-indigo-500',
      'Configuración del Sistema': 'from-gray-700 to-gray-600',
      'Documentos': 'from-yellow-600 to-yellow-500',
      'Facturación': 'from-emerald-600 to-emerald-500',
      'Reportes': 'from-pink-600 to-pink-500',
    };
    return colors[category] || 'from-blue-600 to-blue-500';
  };

  const CategoryIcon = getIcon('FiBook');

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getCategoryColor(topic.category)} text-white p-6`}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 hover:bg-white hover:bg-opacity-20 rounded-lg px-3 py-2 transition-colors"
          >
            <FiArrowLeft />
            <span>Volver</span>
          </button>
          <button
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            aria-label="Cerrar"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-white rounded-lg p-3 flex-shrink-0">
            <CategoryIcon className="text-3xl" style={{ color: '#3b82f6' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{topic.title}</h2>
            <p className="text-white text-opacity-90">{topic.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
                {topic.category}
              </span>
              {topic.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Steps Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-blue-600 mb-4">
            <FiBook />
            <h3 className="text-lg font-semibold">Pasos a seguir ({topic.steps.length})</h3>
          </div>
        </div>

        <div className="space-y-6">
          {topic.steps.map((step, index) => {
            const isLast = index === topic.steps.length - 1;
            const StepIcon = getIcon(step.iconName);

            return (
              <div key={index} className="flex items-start space-x-4">
                {/* Step Number and Line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white flex items-center justify-center font-bold shadow-lg">
                    {index + 1}
                  </div>
                  {!isLast && (
                    <div className="w-0.5 h-16 bg-gradient-to-b from-blue-500 to-blue-300 my-2" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-2 mb-2">
                    <StepIcon className="text-blue-600" />
                    <h4 className="font-semibold text-gray-800">{step.title}</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <FiMail className="text-blue-600 text-xl flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">¿Necesitas más ayuda?</h4>
              <p className="text-blue-800 mb-4">
                Si aún tienes dudas, contacta a tu supervisor o al Administrador TI de tu
                institución.
              </p>
              <button
                onClick={() => {
                  // Aquí podrías implementar lógica de contacto
                  alert('Función de contacto en desarrollo');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FiMail />
                <span>Contactar Soporte</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpTopicDetail;
