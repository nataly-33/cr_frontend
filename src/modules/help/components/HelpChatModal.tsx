import React, { useState, useEffect } from 'react';
import { FiX, FiSearch, FiChevronRight, FiBook, FiFileText, FiActivity, FiShield, FiUsers, FiSettings, FiFolder, FiBarChart2, FiMessageCircle, FiInfo, FiSliders, FiDollarSign } from 'react-icons/fi';
import { HelpCategory } from '../types/help.types';
import { getTopicsByRole, searchTopics, getTopicsByCategory } from '../data/helpTopics';
import { useAuthStore } from '../../../core/store/auth.store';
import HelpTopicDetail from './HelpTopicDetail';

interface HelpChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpChatModal: React.FC<HelpChatModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState(getTopicsByRole(user?.role?.name));
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTopics(getTopicsByRole(user?.role?.name));
      setSearchQuery('');
      setSelectedCategory(null);
      setSelectedTopicId(null);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setTopics(searchTopics(searchQuery, user?.role?.name));
      setSelectedCategory(null);
    } else if (searchQuery.trim().length === 0) {
      if (selectedCategory) {
        setTopics(getTopicsByCategory(selectedCategory, user?.role?.name));
      } else {
        setTopics(getTopicsByRole(user?.role?.name));
      }
    }
  }, [searchQuery, user, selectedCategory]);

  const handleCategoryClick = (category: HelpCategory) => {
    setSelectedCategory(category);
    setTopics(getTopicsByCategory(category, user?.role?.name));
    setSearchQuery('');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setTopics(getTopicsByRole(user?.role?.name));
  };

  const handleTopicClick = (topicId: string) => {
    setSelectedTopicId(topicId);
  };

  const handleBackToTopics = () => {
    setSelectedTopicId(null);
  };

  const categories = [
    { name: HelpCategory.GENERAL_USAGE, icon: FiInfo, color: 'bg-gray-500' },
    { name: HelpCategory.MEDICAL_RECORDS, icon: FiFileText, color: 'bg-red-500' },
    { name: HelpCategory.FORMS, icon: FiBook, color: 'bg-orange-500' },
    { name: HelpCategory.AI, icon: FiActivity, color: 'bg-purple-500' },
    { name: HelpCategory.PERMISSIONS, icon: FiShield, color: 'bg-green-500' },
    { name: HelpCategory.PATIENTS, icon: FiUsers, color: 'bg-blue-500' },
    { name: HelpCategory.USERS, icon: FiSettings, color: 'bg-indigo-500' },
    { name: HelpCategory.SYSTEM, icon: FiSliders, color: 'bg-teal-500' },
    { name: HelpCategory.DOCUMENTS, icon: FiFolder, color: 'bg-yellow-500' },
    { name: HelpCategory.BILLING, icon: FiDollarSign, color: 'bg-emerald-500' },
    { name: HelpCategory.REPORTS, icon: FiBarChart2, color: 'bg-pink-500' },
  ];

  const quickActions = [
    { title: 'Crear Historia Clínica', topicId: 'create_medical_record' },
    { title: 'Registrar Paciente', topicId: 'register_patient' },
    { title: 'Usar IA', topicId: 'diabetes_prediction' },
    { title: 'Ver mis Permisos', topicId: 'role_permissions' },
  ];

  if (!isOpen) return null;

  // Si hay un tema seleccionado, mostrar el detalle
  if (selectedTopicId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in-scale">
          <HelpTopicDetail
            topicId={selectedTopicId}
            onBack={handleBackToTopics}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white rounded-lg p-3">
                <FiMessageCircle className="text-blue-600 text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Asistente Virtual</h2>
                <p className="text-blue-100 text-sm">
                  {user?.role?.name ? `Ayuda para ${user.role.name}` : 'Centro de Ayuda'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
              aria-label="Cerrar"
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="¿En qué puedo ayudarte?"
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-6">
          {/* Initial State / Category View */}
          {!searchQuery && !selectedCategory && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Hola! 👋</h3>
                <p className="text-gray-600">
                  Estoy aquí para ayudarte a usar CliniDocs. ¿Qué necesitas saber?
                </p>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Acciones Rápidas</h4>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.topicId}
                      onClick={() => handleTopicClick(action.topicId)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors text-sm"
                    >
                      {action.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories Grid */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Categorías</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.name}
                        onClick={() => handleCategoryClick(category.name)}
                        className={`${category.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex flex-col items-center justify-center space-y-2`}
                      >
                        <Icon className="text-2xl" />
                        <span className="text-xs font-medium text-center">{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Search Results or Category Results */}
          {(searchQuery || selectedCategory) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {selectedCategory && (
                    <button
                      onClick={handleBackToCategories}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      ← Volver
                    </button>
                  )}
                  <h4 className="font-semibold text-gray-700">
                    {searchQuery
                      ? `Resultados para "${searchQuery}"`
                      : selectedCategory || 'Todos los Temas'}
                  </h4>
                </div>
                <span className="text-sm text-gray-500">
                  {topics.length} {topics.length === 1 ? 'resultado' : 'resultados'}
                </span>
              </div>

              {topics.length === 0 ? (
                <div className="text-center py-12">
                  <FiSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No se encontraron resultados</p>
                  <p className="text-gray-400 text-sm mt-2">Intenta con otras palabras clave</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic.id)}
                      className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800 mb-1">{topic.title}</h5>
                          <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {topic.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <FiChevronRight className="text-gray-400 ml-4 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-blue-50">
          <p className="text-center text-sm text-gray-600">
            ¿Necesitas más ayuda? Contacta a tu <span className="font-semibold">Administrador TI</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpChatModal;
