import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, ArrowLeft, History, GitBranch } from 'lucide-react';
import { diabetesService } from '../services/diabetes.service';
import PredictionResult from '../components/PredictionResult';
import type { DiabetesPrediction } from '../types';

const DiabetesPredictionPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<DiabetesPrediction | null>(null);
  const [history, setHistory] = useState<DiabetesPrediction[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadHistory();
    }
  }, [patientId]);

  const loadHistory = async () => {
    if (!patientId) return;

    try {
      const response = await diabetesService.getPatientHistory(patientId);
      setHistory(response.data);
      if (response.data.length > 0) {
        setPrediction(response.data[0]);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const handlePredict = async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await diabetesService.predict(patientId);
      setPrediction(response.data);
      await loadHistory();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al realizar la predicción');
    } finally {
      setLoading(false);
    }
  };

  const selectHistoricalPrediction = (pred: DiabetesPrediction) => {
    setPrediction(pred);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                Predicción de Diabetes
              </h1>
              <p className="text-gray-600 mt-1">
                Análisis predictivo basado en historial clínico
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/ai/decision-tree')}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2"
              >
                <GitBranch className="w-4 h-4" />
                Ver Árbol de Decisión
              </button>
              {history.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  Historial ({history.length})
                </button>
              )}
              <button
                onClick={handlePredict}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                {loading ? 'Analizando...' : 'Nueva Predicción'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analizando datos del paciente</h3>
                <p className="text-gray-600 mt-1">Procesando historial clínico con modelo de IA...</p>
              </div>
            </div>
          </div>
        )}

        {/* History Panel */}
        {showHistory && history.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Historial de Predicciones</h2>
            <div className="space-y-3">
              {history.map((pred) => (
                <button
                  key={pred.id}
                  onClick={() => selectHistoricalPrediction(pred)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    prediction?.id === pred.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {new Date(pred.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          pred.risk_level === 'very_high' ? 'bg-red-100 text-red-700' :
                          pred.risk_level === 'high' ? 'bg-orange-100 text-orange-700' :
                          pred.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {pred.risk_level === 'very_high' ? 'Muy Alto' :
                           pred.risk_level === 'high' ? 'Alto' :
                           pred.risk_level === 'medium' ? 'Medio' : 'Bajo'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Probabilidad: {(pred.probability * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      v{pred.model_version}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prediction Result */}
        {!loading && prediction && (
          <PredictionResult prediction={prediction} />
        )}

        {/* Empty State */}
        {!loading && !prediction && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No hay predicciones disponibles</h3>
            <p className="text-gray-600 mt-2 mb-6">
              Realiza una nueva predicción para analizar el riesgo de diabetes
            </p>
            <button
              onClick={handlePredict}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Realizar Predicción
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiabetesPredictionPage;
