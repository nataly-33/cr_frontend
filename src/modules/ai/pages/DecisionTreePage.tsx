import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DecisionTreeViewer from '../components/DecisionTreeViewer';

const DecisionTreePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        {/* Tree Viewer */}
        <DecisionTreeViewer />
      </div>
    </div>
  );
};

export default DecisionTreePage;
