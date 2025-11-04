import { useState } from 'react';
import type { FC } from 'react';
import {
  Sparkles,
  FileText,
  Lightbulb,
  Loader,
  ChevronDown,
} from 'lucide-react';

import type { ReportExecution } from '../types';
import { showToast } from '@shared/utils';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { AIAnalysisPanel } from './AIAnalysisPanel';

interface AIActionsMenuProps {
  execution: ReportExecution;
  onActionStart?: () => void;
  onActionComplete?: () => void;
}

/**
 * Menu dropdown for AI actions on reports
 * Provides options to analyze, summarize, and get recommendations
 */
export const AIActionsMenu: FC<AIActionsMenuProps> = ({
  execution,
  onActionStart,
  onActionComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const {
    insights,
    isLoading,
    error,
    analyzeReport,
    generateSummary,
    getRecommendations,
    getFullInsights,
    reset,
  } = useAIAnalysis();

  const isCompleted = execution.status === 'completed';

  const handleAnalyze = async () => {
    try {
      onActionStart?.();
      setIsOpen(false);
      await analyzeReport(execution.id);
      setShowInsights(true);
      showToast.success('Análisis completado');
    } catch (err) {
      showToast.error('Error al analizar el reporte');
    } finally {
      onActionComplete?.();
    }
  };

  const handleSummarize = async () => {
    try {
      onActionStart?.();
      setIsOpen(false);
      await generateSummary(execution.id, 500);
      setShowInsights(true);
      showToast.success('Resumen generado');
    } catch (err) {
      showToast.error('Error al generar resumen');
    } finally {
      onActionComplete?.();
    }
  };

  const handleGetRecommendations = async () => {
    try {
      onActionStart?.();
      setIsOpen(false);
      await getRecommendations(execution.id);
      setShowInsights(true);
      showToast.success('Recomendaciones obtenidas');
    } catch (err) {
      showToast.error('Error al obtener recomendaciones');
    } finally {
      onActionComplete?.();
    }
  };

  const handleFullInsights = async () => {
    try {
      onActionStart?.();
      setIsOpen(false);
      await getFullInsights(execution.id);
      setShowInsights(true);
      showToast.success('Análisis completo obtenido');
    } catch (err) {
      showToast.error('Error al obtener análisis completo');
    } finally {
      onActionComplete?.();
    }
  };

  if (!isCompleted) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 text-sm font-medium"
        disabled={isLoading}
        title="Acciones de IA"
      >
        <Sparkles className="h-4 w-4" />
        {isLoading && <Loader className="h-4 w-4 animate-spin" />}
        {!isLoading && <ChevronDown className="h-4 w-4" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Acciones IA
            </p>
          </div>

          <div className="py-2">
            {/* Analyze */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 text-blue-600" />
              )}
              <span>Analizar Reporte</span>
            </button>

            {/* Summarize */}
            <button
              onClick={handleSummarize}
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 text-green-600" />
              )}
              <span>Generar Resumen</span>
            </button>

            {/* Get Recommendations */}
            <button
              onClick={handleGetRecommendations}
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4 text-yellow-600" />
              )}
              <span>Obtener Recomendaciones</span>
            </button>

            <div className="border-t border-gray-100 my-2" />

            {/* Get Full Insights */}
            <button
              onClick={handleFullInsights}
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-semibold"
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-indigo-600" />
              )}
              <span className="text-indigo-700">Análisis Completo</span>
            </button>
          </div>

          <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
            Potenciado por IA
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Insights Panel */}
      {showInsights && insights && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AIAnalysisPanel
              insights={insights}
              isLoading={isLoading}
              onClose={() => {
                setShowInsights(false);
                reset();
              }}
            />
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default AIActionsMenu;
