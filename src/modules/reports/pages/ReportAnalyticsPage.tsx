import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Loader,
  Download,
  Share2,
} from 'lucide-react';

import { reportsService } from '../services/reports.service';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import { AIAnalysisPanel } from '../components/AIAnalysisPanel';
import type { ReportExecution } from '../types';
import { Button, Card, CardHeader } from '@shared/components/ui';
import { showToast } from '@shared/utils';

/**
 * Analytics page for viewing detailed AI insights about reports
 * Shows analysis, recommendations, trends and visualizations
 */
export const ReportAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [execution, setExecution] = useState<ReportExecution | null>(null);
  const [isLoadingExecution, setIsLoadingExecution] = useState(true);
  const {
    insights,
    isLoading: isLoadingInsights,
    error,
    getFullInsights,
  } = useAIAnalysis();

  // Load report execution details
  useEffect(() => {
    const loadExecution = async () => {
      if (!id) return;

      try {
        setIsLoadingExecution(true);
        const data = await reportsService.getExecutionById(id);
        setExecution(data);
      } catch (err) {
        showToast.error('Error al cargar el reporte');
        console.error('Error loading execution:', err);
      } finally {
        setIsLoadingExecution(false);
      }
    };

    loadExecution();
  }, [id]);

  // Load AI insights
  useEffect(() => {
    if (execution?.status === 'completed' && !insights) {
      handleLoadInsights();
    }
  }, [execution]);

  const handleLoadInsights = async () => {
    if (!id) return;

    try {
      await getFullInsights(id);
    } catch (err) {
      showToast.error('Error al cargar análisis');
    }
  };

  const handleExport = async () => {
    // TODO: Implement export functionality
    showToast.info('Funcionalidad de exportación en desarrollo');
  };

  const handleShare = async () => {
    // TODO: Implement share functionality
    showToast.info('Funcionalidad de compartir en desarrollo');
  };

  if (isLoadingExecution) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Reporte no encontrado
        </h3>
        <p className="text-gray-600">
          El reporte que buscas no existe o ha sido eliminado.
        </p>
      </div>
    );
  }

  const isCompleted = execution.status === 'completed';

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/reports"
            className="inline-flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver a reportes"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </a>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Análisis de Reporte
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {execution.report_type} • Generado el{' '}
              {new Date(execution.executed_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && !insights && (
            <Button
              onClick={handleLoadInsights}
              isLoading={isLoadingInsights}
              variant="outline"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Cargar Análisis
            </Button>
          )}
          <Button
            onClick={handleExport}
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Exportar
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            Compartir
          </Button>
        </div>
      </div>

      {/* Execution Details Card */}
      <Card>
        <div className="p-6">
          <CardHeader
            title="Detalles del Reporte"
            subtitle="Información de generación y ejecución"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <DetailItem
              label="Tipo"
              value={execution.report_type}
              icon={BarChart3}
            />
            <DetailItem
              label="Formato"
              value={execution.output_format.toUpperCase()}
              icon={BarChart3}
            />
            <DetailItem
              label="Estado"
              value={
                isCompleted ? (
                  <span className="text-green-600 font-semibold">
                    ✓ Completado
                  </span>
                ) : (
                  <span className="text-yellow-600 font-semibold">
                    ⟳ {execution.status}
                  </span>
                )
              }
              icon={isCompleted ? CheckCircle2 : AlertCircle}
            />
            <DetailItem
              label="Generado por"
              value={execution.executed_by_name || execution.executed_by}
              icon={Lightbulb}
            />
          </div>
        </div>
      </Card>

      {/* AI Analysis Panel */}
      {isCompleted && insights && (
        <AIAnalysisPanel
          insights={insights}
          isLoading={isLoadingInsights}
          className="border-2 border-indigo-200"
        />
      )}

      {/* Loading State */}
      {isCompleted && isLoadingInsights && !insights && (
        <Card>
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-600">Cargando análisis de IA...</p>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error en análisis</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* No Analysis Available */}
      {isCompleted && !insights && !isLoadingInsights && (
        <Card>
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Lightbulb className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Sin análisis disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Haz clic en el botón "Cargar Análisis" para generar insights
              con IA
            </p>
            <Button
              onClick={handleLoadInsights}
              isLoading={isLoadingInsights}
              leftIcon={<Lightbulb className="w-4 h-4" />}
            >
              Generar Análisis
            </Button>
          </div>
        </Card>
      )}

      {/* Not Completed State */}
      {!isCompleted && (
        <Card>
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Reporte aún en procesamiento
            </h3>
            <p className="text-gray-600">
              Los análisis estarán disponibles cuando el reporte se complete.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * Component to display a detail item with icon and label
 */
interface DetailItemProps {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ElementType;
}

const DetailItem = ({ label, value, icon: Icon }: DetailItemProps) => (
  <div className="flex flex-col items-start gap-2 p-3 bg-gray-50 rounded-lg">
    {Icon && <Icon className="w-4 h-4 text-gray-600" />}
    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {label}
    </p>
    <p className="text-sm text-gray-900 font-medium">{value}</p>
  </div>
);

export default ReportAnalyticsPage;
