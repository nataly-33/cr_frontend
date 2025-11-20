import React, { useState } from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import HelpChatModal from './HelpChatModal';

interface HelpChatButtonProps {
  variant?: 'primary' | 'mini';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Botón flotante que abre el chatbot de ayuda
 */
const HelpChatButton: React.FC<HelpChatButtonProps> = ({
  variant = 'primary',
  position = 'bottom-right',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getPositionClasses = () => {
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
    };
    return positions[position];
  };

  const getSizeClasses = () => {
    if (variant === 'mini') {
      return 'w-12 h-12 text-lg';
    }
    return 'w-14 h-14 text-xl';
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          fixed ${getPositionClasses()} ${getSizeClasses()}
          bg-blue-600 hover:bg-blue-700
          text-white rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          hover:scale-110 hover:shadow-xl
          z-40 group
        `}
        title="Ayuda"
        aria-label="Abrir asistente de ayuda"
      >
        <FiHelpCircle className="transition-transform group-hover:rotate-12" />

        {/* Ripple effect */}
        <span className="absolute w-full h-full rounded-full bg-blue-600 opacity-0 group-hover:opacity-20 animate-ping" />
      </button>

      {/* Modal del chatbot */}
      <HelpChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default HelpChatButton;
