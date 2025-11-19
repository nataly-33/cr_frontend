import React from 'react';
import { AlertCircle, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import type { DiabetesPrediction } from '../types';
import RiskMeter from './RiskMeter';

interface PredictionResultProps {
  prediction: DiabetesPrediction;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ prediction }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5" />;
      case 'medium':
        return <Activity className="w-5 h-5" />;
      default:
        return <CheckCircle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Medidor de Riesgo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <RiskMeter
          probability={prediction.probability}
          riskLevel={prediction.risk_level}
        />
      </div>

      {/* Factores Contribuyentes */}
      {prediction.contributing_factors && prediction.contributing_factors.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Factores de Riesgo Detectados
          </h3>
          <div className="space-y-3">
            {prediction.contributing_factors.map((factor, index) => (
              <div
                key={index}
                className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{factor.factor}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Valor actual: <span className="font-medium">{factor.value}</span>
                    </p>
                    {factor.normal && (
                      <p className="text-xs text-gray-500 mt-1">
                        Normal: {factor.normal}
                      </p>
                    )}
                  </div>
                  {factor.importance !== undefined && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Importancia</div>
                      <div className="text-sm font-semibold text-orange-600">
                        {(factor.importance * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {prediction.recommendations && prediction.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Recomendaciones Médicas
          </h3>
          <div className="space-y-3">
            {prediction.recommendations.map((rec, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getPriorityIcon(rec.priority)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold uppercase px-2 py-0.5 bg-white bg-opacity-50 rounded">
                        {rec.category}
                      </span>
                      <span className="text-xs font-semibold uppercase">
                        Prioridad {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                    <h4 className="font-semibold">{rec.recommendation}</h4>
                    {rec.action && (
                      <p className="text-sm mt-1 opacity-90">
                        Acción: {rec.action}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información del Modelo */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Modelo utilizado:</span>
          <span className="font-medium">v{prediction.model_version}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span>Fecha de predicción:</span>
          <span className="font-medium">
            {new Date(prediction.created_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;
