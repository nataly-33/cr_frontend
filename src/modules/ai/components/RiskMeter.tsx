import React from 'react';

interface RiskMeterProps {
  probability: number; // 0.0 - 1.0
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
}

const RiskMeter: React.FC<RiskMeterProps> = ({ probability, riskLevel }) => {
  const percentage = Math.round(probability * 100);

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-orange-500';
      case 'very_high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskTextColor = () => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-700';
      case 'medium':
        return 'text-yellow-700';
      case 'high':
        return 'text-orange-700';
      case 'very_high':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const getRiskLabel = () => {
    switch (riskLevel) {
      case 'low':
        return 'Bajo';
      case 'medium':
        return 'Medio';
      case 'high':
        return 'Alto';
      case 'very_high':
        return 'Muy Alto';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Riesgo de Diabetes</span>
        <span className={`text-2xl font-bold ${getRiskTextColor()}`}>
          {percentage}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getRiskColor()} transition-all duration-500 ease-out flex items-center justify-end pr-3`}
          style={{ width: `${percentage}%` }}
        >
          {percentage > 15 && (
            <span className="text-white text-xs font-semibold">
              {percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Etiqueta de nivel */}
      <div className="mt-2 text-center">
        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getRiskTextColor()} bg-opacity-10`}
          style={{ backgroundColor: `currentColor` }}>
          Riesgo {getRiskLabel()}
        </span>
      </div>

      {/* Indicadores de rangos */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <div className="text-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
          <span>0-30%</span>
          <div className="font-medium">Bajo</div>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
          <span>31-60%</span>
          <div className="font-medium">Medio</div>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-1"></div>
          <span>61-80%</span>
          <div className="font-medium">Alto</div>
        </div>
        <div className="text-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
          <span>81-100%</span>
          <div className="font-medium">Muy Alto</div>
        </div>
      </div>
    </div>
  );
};

export default RiskMeter;
